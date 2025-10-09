const { query, transaction } = require('../config/database');
const { bookingLimiter } = require('../middleware/rateLimiter');
const { createTicketData } = require('../utils/ticketGenerator');

const bookingController = {
    // Create new booking (Customers only)
    async createBooking(req, res) {
        try {
            const {
                flightId,
                seatClass,
                numberOfPassengers = 1,
                passengers,
                specialRequests,
                paymentMethod = 'credit_card'
            } = req.body;

            // Validation
            if (!flightId || !seatClass || !passengers || passengers.length !== numberOfPassengers) {
                return res.status(400).json({
                    success: false,
                    message: 'Flight ID, seat class, and passenger details are required'
                });
            }

            if (!['economy', 'business', 'first_class'].includes(seatClass)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid seat class'
                });
            }

            // Validate passenger data
            for (const passenger of passengers) {
                if (!passenger.firstName || !passenger.lastName) {
                    return res.status(400).json({
                        success: false,
                        message: 'First name and last name are required for all passengers'
                    });
                }
            }

            const result = await transaction(async (client) => {
                // Get flight details and check availability
                const flightResult = await client.query(`
                    SELECT f.*, a.name as airline_name
                    FROM flights f
                    JOIN airlines a ON f.airline_id = a.id
                    WHERE f.id = $1 AND a.approval_status = 'approved' AND f.status IN ('scheduled', 'boarding')
                `, [flightId]);

                if (flightResult.rows.length === 0) {
                    throw new Error('Flight not found or not available for booking');
                }

                const flight = flightResult.rows[0];

                // Check seat availability
                if (flight.available_seats < numberOfPassengers) {
                    throw new Error('Not enough seats available');
                }

                // Calculate total amount based on seat class
                let pricePerSeat = 0;
                switch (seatClass) {
                    case 'economy':
                        pricePerSeat = flight.economy_price;
                        break;
                    case 'business':
                        pricePerSeat = flight.business_price;
                        break;
                    case 'first_class':
                        pricePerSeat = flight.first_class_price;
                        break;
                }

                if (!pricePerSeat) {
                    throw new Error(`${seatClass} class not available for this flight`);
                }

                const totalAmount = pricePerSeat * numberOfPassengers;

                // Create booking
                const bookingResult = await client.query(`
                    INSERT INTO bookings (
                        user_id, flight_id, seat_class, number_of_passengers,
                        total_amount, payment_method, special_requests
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    RETURNING *
                `, [
                    req.user.id,
                    flightId,
                    seatClass,
                    numberOfPassengers,
                    totalAmount,
                    paymentMethod,
                    specialRequests
                ]);

                const booking = bookingResult.rows[0];

                // Add passengers and generate e-tickets
                const passengerIds = [];
                for (const passenger of passengers) {
                    const passengerResult = await client.query(`
                        INSERT INTO booking_passengers (
                            booking_id, first_name, last_name, date_of_birth,
                            gender, passport_number, nationality, meal_preference
                        )
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                        RETURNING *
                    `, [
                        booking.id,
                        passenger.firstName,
                        passenger.lastName,
                        passenger.dateOfBirth,
                        passenger.gender,
                        passenger.passportNumber,
                        passenger.nationality,
                        passenger.mealPreference
                    ]);
                    
                    passengerIds.push(passengerResult.rows[0]);
                }

                // Generate e-tickets for all passengers
                const tickets = [];
                for (const passenger of passengerIds) {
                    const ticketData = createTicketData(booking, passenger, flight);
                    
                    const ticketResult = await client.query(`
                        INSERT INTO tickets (
                            booking_id, passenger_id, qr_code, barcode,
                            valid_until, boarding_gate, boarding_time
                        )
                        VALUES ($1, $2, $3, $4, $5, $6, $7)
                        RETURNING *
                    `, [
                        ticketData.bookingId,
                        ticketData.passengerId,
                        ticketData.qrCode,
                        ticketData.barcode,
                        ticketData.validUntil,
                        ticketData.boardingGate,
                        ticketData.boardingTime
                    ]);
                    
                    tickets.push(ticketResult.rows[0]);
                }

                return { booking, flight, tickets };
            });

            res.status(201).json({
                success: true,
                message: 'Booking created successfully. E-tickets have been generated.',
                data: {
                    booking: result.booking,
                    flight: {
                        flightNumber: result.flight.flight_number,
                        airlineName: result.flight.airline_name,
                        departureAirport: result.flight.departure_airport,
                        arrivalAirport: result.flight.arrival_airport,
                        departureDate: result.flight.departure_date,
                        departureTime: result.flight.departure_time
                    },
                    tickets: result.tickets.map(ticket => ({
                        ticketNumber: ticket.ticket_number,
                        ticketStatus: ticket.ticket_status,
                        issueDate: ticket.issue_date,
                        validUntil: ticket.valid_until,
                        qrCode: ticket.qr_code,
                        barcode: ticket.barcode
                    }))
                }
            });
        } catch (error) {
            console.error('Create booking error:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to create booking'
            });
        }
    },

    // Get user's bookings
    async getUserBookings(req, res) {
        try {
            const { page = 1, limit = 10, status = '' } = req.query;
            const offset = (page - 1) * limit;

            let whereConditions = ['b.user_id = $1'];
            let queryParams = [req.user.id];
            let paramCount = 1;

            // Filter by status
            if (status) {
                paramCount++;
                whereConditions.push(`b.booking_status = $${paramCount}`);
                queryParams.push(status);
            }

            const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

            // Get total count
            const countQuery = `
                SELECT COUNT(*) as total
                FROM bookings b
                ${whereClause}
            `;
            const countResult = await query(countQuery, queryParams);
            const total = parseInt(countResult.rows[0].total);

            // Get bookings with pagination
            paramCount++;
            queryParams.push(limit);
            paramCount++;
            queryParams.push(offset);

            const bookingsQuery = `
                SELECT b.*, f.flight_number, f.departure_airport, f.arrival_airport,
                       f.departure_date, f.departure_time, f.arrival_date, f.arrival_time,
                       a.name as airline_name, a.code as airline_code, a.logo_url as airline_logo
                FROM bookings b
                JOIN flights f ON b.flight_id = f.id
                JOIN airlines a ON f.airline_id = a.id
                ${whereClause}
                ORDER BY b.created_at DESC
                LIMIT $${paramCount - 1} OFFSET $${paramCount}
            `;

            const bookingsResult = await query(bookingsQuery, queryParams);

            // Get passengers for each booking
            for (const booking of bookingsResult.rows) {
                const passengersResult = await query(
                    'SELECT * FROM booking_passengers WHERE booking_id = $1',
                    [booking.id]
                );
                booking.passengers = passengersResult.rows;
            }

            res.json({
                success: true,
                data: {
                    bookings: bookingsResult.rows,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total,
                        pages: Math.ceil(total / limit)
                    }
                }
            });
        } catch (error) {
            console.error('Get user bookings error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve bookings'
            });
        }
    },

    // Get booking by ID
    async getBookingById(req, res) {
        try {
            const { id } = req.params;

            let bookingQuery = `
                SELECT b.*, f.flight_number, f.departure_airport, f.arrival_airport,
                       f.departure_date, f.departure_time, f.arrival_date, f.arrival_time,
                       f.gate, f.terminal, f.status as flight_status,
                       a.name as airline_name, a.code as airline_code, 
                       a.logo_url as airline_logo, a.contact_email as airline_contact
                FROM bookings b
                JOIN flights f ON b.flight_id = f.id
                JOIN airlines a ON f.airline_id = a.id
                WHERE b.id = $1
            `;

            let queryParams = [id];

            // Role-based access control
            if (req.user.roleName === 'customer') {
                bookingQuery += ' AND b.user_id = $2';
                queryParams.push(req.user.id);
            } else if (req.user.roleName === 'airline_admin') {
                bookingQuery += ' AND a.admin_user_id = $2';
                queryParams.push(req.user.id);
            }
            // Super admin can access all bookings

            const bookingResult = await query(bookingQuery, queryParams);

            if (bookingResult.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking not found or access denied'
                });
            }

            const booking = bookingResult.rows[0];

            // Get passengers
            const passengersResult = await query(
                'SELECT * FROM booking_passengers WHERE booking_id = $1',
                [id]
            );
            booking.passengers = passengersResult.rows;

            res.json({
                success: true,
                data: { booking }
            });
        } catch (error) {
            console.error('Get booking by ID error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve booking'
            });
        }
    },

    // Cancel booking
    async cancelBooking(req, res) {
        try {
            const { id } = req.params;
            const { cancellationReason } = req.body;

            const result = await transaction(async (client) => {
                // Get booking details
                const bookingResult = await client.query(`
                    SELECT b.*, f.departure_date, f.departure_time
                    FROM bookings b
                    JOIN flights f ON b.flight_id = f.id
                    WHERE b.id = $1 AND b.user_id = $2 AND b.booking_status = 'confirmed'
                `, [id, req.user.id]);

                if (bookingResult.rows.length === 0) {
                    throw new Error('Booking not found or cannot be cancelled');
                }

                const booking = bookingResult.rows[0];

                // Check if cancellation is allowed (e.g., not within 2 hours of departure)
                const departureDateTime = new Date(`${booking.departure_date}T${booking.departure_time}`);
                const now = new Date();
                const timeDiff = departureDateTime.getTime() - now.getTime();
                const hoursDiff = timeDiff / (1000 * 60 * 60);

                if (hoursDiff < 2) {
                    throw new Error('Cancellation not allowed within 2 hours of departure');
                }

                // Calculate refund amount (example: 90% refund if cancelled 24+ hours before)
                let refundPercentage = 0;
                if (hoursDiff >= 24) {
                    refundPercentage = 0.9; // 90% refund
                } else if (hoursDiff >= 12) {
                    refundPercentage = 0.7; // 70% refund
                } else {
                    refundPercentage = 0.5; // 50% refund
                }

                const refundAmount = booking.total_amount * refundPercentage;

                // Update booking status
                const updateResult = await client.query(`
                    UPDATE bookings 
                    SET booking_status = 'cancelled',
                        cancellation_reason = $1,
                        refund_amount = $2,
                        cancelled_at = CURRENT_TIMESTAMP,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = $3
                    RETURNING *
                `, [cancellationReason, refundAmount, id]);

                return updateResult.rows[0];
            });

            res.json({
                success: true,
                message: 'Booking cancelled successfully',
                data: { 
                    booking: result,
                    refundInfo: {
                        refundAmount: result.refund_amount,
                        processingTime: '5-7 business days'
                    }
                }
            });
        } catch (error) {
            console.error('Cancel booking error:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to cancel booking'
            });
        }
    },

    // Get all bookings (Admin access)
    async getAllBookings(req, res) {
        try {
            const { page = 1, limit = 10, search = '', status = '', flightId = '' } = req.query;
            const offset = (page - 1) * limit;

            let whereConditions = [];
            let queryParams = [];
            let paramCount = 0;

            // Role-based access control
            if (req.user.roleName === 'airline_admin') {
                paramCount++;
                whereConditions.push(`a.admin_user_id = $${paramCount}`);
                queryParams.push(req.user.id);
            }

            // Search functionality
            if (search) {
                paramCount++;
                whereConditions.push(`(b.booking_reference ILIKE $${paramCount} OR u.email ILIKE $${paramCount} OR u.first_name ILIKE $${paramCount} OR u.last_name ILIKE $${paramCount})`);
                queryParams.push(`%${search}%`);
            }

            // Status filter
            if (status) {
                paramCount++;
                whereConditions.push(`b.booking_status = $${paramCount}`);
                queryParams.push(status);
            }

            // Flight filter
            if (flightId) {
                paramCount++;
                whereConditions.push(`b.flight_id = $${paramCount}`);
                queryParams.push(flightId);
            }

            const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

            // Get total count
            const countQuery = `
                SELECT COUNT(*) as total
                FROM bookings b
                JOIN flights f ON b.flight_id = f.id
                JOIN airlines a ON f.airline_id = a.id
                JOIN users u ON b.user_id = u.id
                ${whereClause}
            `;
            const countResult = await query(countQuery, queryParams);
            const total = parseInt(countResult.rows[0].total);

            // Get bookings with pagination
            paramCount++;
            queryParams.push(limit);
            paramCount++;
            queryParams.push(offset);

            const bookingsQuery = `
                SELECT b.*, f.flight_number, f.departure_airport, f.arrival_airport,
                       f.departure_date, f.departure_time,
                       a.name as airline_name, a.code as airline_code,
                       u.first_name as customer_first_name, u.last_name as customer_last_name,
                       u.email as customer_email
                FROM bookings b
                JOIN flights f ON b.flight_id = f.id
                JOIN airlines a ON f.airline_id = a.id
                JOIN users u ON b.user_id = u.id
                ${whereClause}
                ORDER BY b.created_at DESC
                LIMIT $${paramCount - 1} OFFSET $${paramCount}
            `;

            const bookingsResult = await query(bookingsQuery, queryParams);

            res.json({
                success: true,
                data: {
                    bookings: bookingsResult.rows,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total,
                        pages: Math.ceil(total / limit)
                    }
                }
            });
        } catch (error) {
            console.error('Get all bookings error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve bookings'
            });
        }
    },

    // Get booking statistics
    async getBookingStats(req, res) {
        try {
            let statsQuery;
            let queryParams = [];

            if (req.user.roleName === 'super_admin') {
                statsQuery = `
                    SELECT 
                        COUNT(*) as total_bookings,
                        COUNT(CASE WHEN booking_status = 'confirmed' THEN 1 END) as confirmed_bookings,
                        COUNT(CASE WHEN booking_status = 'cancelled' THEN 1 END) as cancelled_bookings,
                        COUNT(CASE WHEN booking_status = 'pending' THEN 1 END) as pending_bookings,
                        COALESCE(SUM(CASE WHEN booking_status = 'confirmed' THEN total_amount END), 0) as total_revenue,
                        COALESCE(SUM(CASE WHEN booking_status = 'cancelled' THEN refund_amount END), 0) as total_refunds
                    FROM bookings
                `;
            } else if (req.user.roleName === 'airline_admin') {
                statsQuery = `
                    SELECT 
                        COUNT(*) as total_bookings,
                        COUNT(CASE WHEN b.booking_status = 'confirmed' THEN 1 END) as confirmed_bookings,
                        COUNT(CASE WHEN b.booking_status = 'cancelled' THEN 1 END) as cancelled_bookings,
                        COUNT(CASE WHEN b.booking_status = 'pending' THEN 1 END) as pending_bookings,
                        COALESCE(SUM(CASE WHEN b.booking_status = 'confirmed' THEN b.total_amount END), 0) as total_revenue,
                        COALESCE(SUM(CASE WHEN b.booking_status = 'cancelled' THEN b.refund_amount END), 0) as total_refunds
                    FROM bookings b
                    JOIN flights f ON b.flight_id = f.id
                    JOIN airlines a ON f.airline_id = a.id
                    WHERE a.admin_user_id = $1
                `;
                queryParams = [req.user.id];
            } else {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            const result = await query(statsQuery, queryParams);
            const stats = result.rows[0];

            // Convert string numbers to proper types
            Object.keys(stats).forEach(key => {
                if (key.includes('total') || key.includes('count')) {
                    stats[key] = parseInt(stats[key]) || 0;
                } else if (key.includes('revenue') || key.includes('refund')) {
                    stats[key] = parseFloat(stats[key]) || 0;
                }
            });

            res.json({
                success: true,
                data: { stats }
            });
        } catch (error) {
            console.error('Get booking stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve booking statistics'
            });
        }
    }
};

module.exports = bookingController;