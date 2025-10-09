const { query } = require('../config/database');
const moment = require('moment');

const flightController = {
    // Create new flight (Airline Admin only)
    async createFlight(req, res) {
        try {
            const {
                flightNumber,
                aircraftType,
                departureAirport,
                arrivalAirport,
                departureDate,
                departureTime,
                arrivalDate,
                arrivalTime,
                totalSeats,
                economySeats = 0,
                businessSeats = 0,
                firstClassSeats = 0,
                economyPrice,
                businessPrice,
                firstClassPrice,
                baggageAllowance = 23,
                gate,
                terminal
            } = req.body;

            // Validation
            if (!flightNumber || !departureAirport || !arrivalAirport || !departureDate || 
                !departureTime || !arrivalDate || !arrivalTime || !totalSeats) {
                return res.status(400).json({
                    success: false,
                    message: 'Required fields: flightNumber, departureAirport, arrivalAirport, departureDate, departureTime, arrivalDate, arrivalTime, totalSeats'
                });
            }

            // Get user's airline
            const airlineResult = await query(
                'SELECT id FROM airlines WHERE admin_user_id = $1 AND approval_status = $2',
                [req.user.id, 'approved']
            );

            if (airlineResult.rows.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'No approved airline found for this user'
                });
            }

            const airlineId = airlineResult.rows[0].id;

            // Check if flight number is unique for this airline and date
            const existingFlight = await query(
                'SELECT id FROM flights WHERE airline_id = $1 AND flight_number = $2 AND departure_date = $3',
                [airlineId, flightNumber, departureDate]
            );

            if (existingFlight.rows.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'Flight number already exists for this date'
                });
            }

            // Calculate estimated duration
            const departureDateTime = moment(`${departureDate} ${departureTime}`);
            const arrivalDateTime = moment(`${arrivalDate} ${arrivalTime}`);
            const estimatedDuration = moment.duration(arrivalDateTime.diff(departureDateTime));

            // Insert new flight
            const result = await query(`
                INSERT INTO flights (
                    airline_id, flight_number, aircraft_type, departure_airport, arrival_airport,
                    departure_date, departure_time, arrival_date, arrival_time, estimated_duration,
                    total_seats, available_seats, economy_seats, business_seats, first_class_seats,
                    economy_price, business_price, first_class_price, baggage_allowance, gate, terminal
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
                RETURNING *
            `, [
                airlineId,
                flightNumber,
                aircraftType,
                departureAirport.toUpperCase(),
                arrivalAirport.toUpperCase(),
                departureDate,
                departureTime,
                arrivalDate,
                arrivalTime,
                `${estimatedDuration.asHours().toFixed(2)} hours`,
                totalSeats,
                totalSeats, // Initially all seats are available
                economySeats,
                businessSeats,
                firstClassSeats,
                economyPrice,
                businessPrice,
                firstClassPrice,
                baggageAllowance,
                gate,
                terminal
            ]);

            res.status(201).json({
                success: true,
                message: 'Flight created successfully',
                data: { flight: result.rows[0] }
            });
        } catch (error) {
            console.error('Create flight error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create flight'
            });
        }
    },

    // Get all flights with search and filter options
    async getAllFlights(req, res) {
        try {
            const {
                page = 1,
                limit = 10,
                search = '',
                departureAirport = '',
                arrivalAirport = '',
                departureDate = '',
                status = '',
                airlineId = '',
                minPrice = '',
                maxPrice = ''
            } = req.query;

            const offset = (page - 1) * limit;
            let whereConditions = [];
            let queryParams = [];
            let paramCount = 0;

            // Base condition - only show flights from approved airlines for customers
            if (req.user.roleName === 'customer' || req.user.roleName === 'crew_member') {
                whereConditions.push('a.approval_status = \'approved\'');
            }

            // If airline admin, only show their flights
            if (req.user.roleName === 'airline_admin') {
                paramCount++;
                whereConditions.push(`a.admin_user_id = $${paramCount}`);
                queryParams.push(req.user.id);
            }

            // Search functionality
            if (search) {
                paramCount++;
                whereConditions.push(`(f.flight_number ILIKE $${paramCount} OR a.name ILIKE $${paramCount})`);
                queryParams.push(`%${search}%`);
            }

            // Filter by departure airport
            if (departureAirport) {
                paramCount++;
                whereConditions.push(`f.departure_airport = $${paramCount}`);
                queryParams.push(departureAirport.toUpperCase());
            }

            // Filter by arrival airport
            if (arrivalAirport) {
                paramCount++;
                whereConditions.push(`f.arrival_airport = $${paramCount}`);
                queryParams.push(arrivalAirport.toUpperCase());
            }

            // Filter by departure date
            if (departureDate) {
                paramCount++;
                whereConditions.push(`f.departure_date = $${paramCount}`);
                queryParams.push(departureDate);
            }

            // Filter by status
            if (status) {
                paramCount++;
                whereConditions.push(`f.status = $${paramCount}`);
                queryParams.push(status);
            }

            // Filter by airline
            if (airlineId && req.user.roleName !== 'airline_admin') {
                paramCount++;
                whereConditions.push(`f.airline_id = $${paramCount}`);
                queryParams.push(airlineId);
            }

            // Price range filter
            if (minPrice) {
                paramCount++;
                whereConditions.push(`f.economy_price >= $${paramCount}`);
                queryParams.push(parseFloat(minPrice));
            }

            if (maxPrice) {
                paramCount++;
                whereConditions.push(`f.economy_price <= $${paramCount}`);
                queryParams.push(parseFloat(maxPrice));
            }

            const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

            // Get total count
            const countQuery = `
                SELECT COUNT(*) as total
                FROM flights f
                JOIN airlines a ON f.airline_id = a.id
                ${whereClause}
            `;
            const countResult = await query(countQuery, queryParams);
            const total = parseInt(countResult.rows[0].total);

            // Get flights with pagination
            paramCount++;
            queryParams.push(limit);
            paramCount++;
            queryParams.push(offset);

            const flightsQuery = `
                SELECT f.*, a.name as airline_name, a.code as airline_code,
                       a.logo_url as airline_logo
                FROM flights f
                JOIN airlines a ON f.airline_id = a.id
                ${whereClause}
                ORDER BY f.departure_date, f.departure_time
                LIMIT $${paramCount - 1} OFFSET $${paramCount}
            `;

            const flightsResult = await query(flightsQuery, queryParams);

            res.json({
                success: true,
                data: {
                    flights: flightsResult.rows,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total,
                        pages: Math.ceil(total / limit)
                    }
                }
            });
        } catch (error) {
            console.error('Get flights error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve flights'
            });
        }
    },

    // Get flight by ID
    async getFlightById(req, res) {
        try {
            const { id } = req.params;

            let flightQuery = `
                SELECT f.*, a.name as airline_name, a.code as airline_code,
                       a.logo_url as airline_logo, a.contact_email as airline_contact
                FROM flights f
                JOIN airlines a ON f.airline_id = a.id
                WHERE f.id = $1
            `;

            // Role-based access control
            if (req.user.roleName === 'airline_admin') {
                flightQuery += ' AND a.admin_user_id = $2';
                const result = await query(flightQuery, [id, req.user.id]);
                
                if (result.rows.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'Flight not found or access denied'
                    });
                }
                
                return res.json({
                    success: true,
                    data: { flight: result.rows[0] }
                });
            } else if (req.user.roleName === 'customer' || req.user.roleName === 'crew_member') {
                flightQuery += ' AND a.approval_status = \'approved\'';
            }

            const result = await query(flightQuery, [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Flight not found'
                });
            }

            // Get crew assignments for this flight
            const crewQuery = `
                SELECT fc.role, cm.position, u.first_name, u.last_name
                FROM flight_crew_assignments fc
                JOIN crew_members cm ON fc.crew_member_id = cm.id
                JOIN users u ON cm.user_id = u.id
                WHERE fc.flight_id = $1
                ORDER BY fc.role
            `;
            
            const crewResult = await query(crewQuery, [id]);
            const flight = result.rows[0];
            flight.crew = crewResult.rows;

            res.json({
                success: true,
                data: { flight }
            });
        } catch (error) {
            console.error('Get flight by ID error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve flight'
            });
        }
    },

    // Update flight (Airline Admin only)
    async updateFlight(req, res) {
        try {
            const { id } = req.params;
            const {
                aircraftType,
                departureDate,
                departureTime,
                arrivalDate,
                arrivalTime,
                totalSeats,
                economySeats,
                businessSeats,
                firstClassSeats,
                economyPrice,
                businessPrice,
                firstClassPrice,
                baggageAllowance,
                gate,
                terminal,
                status
            } = req.body;

            // Get user's airline
            const airlineResult = await query(
                'SELECT id FROM airlines WHERE admin_user_id = $1',
                [req.user.id]
            );

            if (airlineResult.rows.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'No airline found for this user'
                });
            }

            const airlineId = airlineResult.rows[0].id;

            // Recalculate estimated duration if departure/arrival times are updated
            let estimatedDuration = null;
            if (departureDate && departureTime && arrivalDate && arrivalTime) {
                const departureDateTime = moment(`${departureDate} ${departureTime}`);
                const arrivalDateTime = moment(`${arrivalDate} ${arrivalTime}`);
                const duration = moment.duration(arrivalDateTime.diff(departureDateTime));
                estimatedDuration = `${duration.asHours().toFixed(2)} hours`;
            }

            const result = await query(`
                UPDATE flights 
                SET aircraft_type = COALESCE($1, aircraft_type),
                    departure_date = COALESCE($2, departure_date),
                    departure_time = COALESCE($3, departure_time),
                    arrival_date = COALESCE($4, arrival_date),
                    arrival_time = COALESCE($5, arrival_time),
                    estimated_duration = COALESCE($6, estimated_duration),
                    total_seats = COALESCE($7, total_seats),
                    economy_seats = COALESCE($8, economy_seats),
                    business_seats = COALESCE($9, business_seats),
                    first_class_seats = COALESCE($10, first_class_seats),
                    economy_price = COALESCE($11, economy_price),
                    business_price = COALESCE($12, business_price),
                    first_class_price = COALESCE($13, first_class_price),
                    baggage_allowance = COALESCE($14, baggage_allowance),
                    gate = COALESCE($15, gate),
                    terminal = COALESCE($16, terminal),
                    status = COALESCE($17, status),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $18 AND airline_id = $19
                RETURNING *
            `, [
                aircraftType,
                departureDate,
                departureTime,
                arrivalDate,
                arrivalTime,
                estimatedDuration,
                totalSeats,
                economySeats,
                businessSeats,
                firstClassSeats,
                economyPrice,
                businessPrice,
                firstClassPrice,
                baggageAllowance,
                gate,
                terminal,
                status,
                id,
                airlineId
            ]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Flight not found or access denied'
                });
            }

            res.json({
                success: true,
                message: 'Flight updated successfully',
                data: { flight: result.rows[0] }
            });
        } catch (error) {
            console.error('Update flight error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update flight'
            });
        }
    },

    // Update flight status (Airline Admin only)
    async updateFlightStatus(req, res) {
        try {
            const { id } = req.params;
            const { status, delayReason, actualDepartureTime, actualArrivalTime } = req.body;

            if (!status) {
                return res.status(400).json({
                    success: false,
                    message: 'Status is required'
                });
            }

            const validStatuses = ['scheduled', 'boarding', 'departed', 'in-flight', 'landed', 'cancelled', 'delayed'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid status. Valid statuses: ${validStatuses.join(', ')}`
                });
            }

            // Get user's airline
            const airlineResult = await query(
                'SELECT id FROM airlines WHERE admin_user_id = $1',
                [req.user.id]
            );

            if (airlineResult.rows.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'No airline found for this user'
                });
            }

            const airlineId = airlineResult.rows[0].id;

            const result = await query(`
                UPDATE flights 
                SET status = $1,
                    delay_reason = COALESCE($2, delay_reason),
                    actual_departure_time = COALESCE($3, actual_departure_time),
                    actual_arrival_time = COALESCE($4, actual_arrival_time),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $5 AND airline_id = $6
                RETURNING *
            `, [status, delayReason, actualDepartureTime, actualArrivalTime, id, airlineId]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Flight not found or access denied'
                });
            }

            res.json({
                success: true,
                message: 'Flight status updated successfully',
                data: { flight: result.rows[0] }
            });
        } catch (error) {
            console.error('Update flight status error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update flight status'
            });
        }
    },

    // Delete flight (Airline Admin only)
    async deleteFlight(req, res) {
        try {
            const { id } = req.params;

            // Get user's airline
            const airlineResult = await query(
                'SELECT id FROM airlines WHERE admin_user_id = $1',
                [req.user.id]
            );

            if (airlineResult.rows.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'No airline found for this user'
                });
            }

            const airlineId = airlineResult.rows[0].id;

            // Check for existing bookings
            const bookingCheck = await query(
                'SELECT COUNT(*) as booking_count FROM bookings WHERE flight_id = $1 AND booking_status != $2',
                [id, 'cancelled']
            );

            if (parseInt(bookingCheck.rows[0].booking_count) > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'Cannot delete flight with existing bookings'
                });
            }

            const result = await query(
                'DELETE FROM flights WHERE id = $1 AND airline_id = $2 RETURNING id, flight_number',
                [id, airlineId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Flight not found or access denied'
                });
            }

            res.json({
                success: true,
                message: 'Flight deleted successfully',
                data: { deletedFlight: result.rows[0] }
            });
        } catch (error) {
            console.error('Delete flight error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete flight'
            });
        }
    },

    // Search flights (for customers)
    async searchFlights(req, res) {
        try {
            const { from, to, departureDate, returnDate, passengers = 1, seatClass = 'economy' } = req.query;

            if (!from || !to || !departureDate) {
                return res.status(400).json({
                    success: false,
                    message: 'From, to, and departure date are required'
                });
            }

            let searchQuery = `
                SELECT f.*, a.name as airline_name, a.code as airline_code, a.logo_url as airline_logo,
                       (f.available_seats >= $4) as has_availability
                FROM flights f
                JOIN airlines a ON f.airline_id = a.id
                WHERE f.departure_airport = $1 
                AND f.arrival_airport = $2 
                AND f.departure_date = $3
                AND a.approval_status = 'approved'
                AND f.status IN ('scheduled', 'boarding')
                AND f.available_seats >= $4
                ORDER BY f.departure_time
            `;

            const outboundFlights = await query(searchQuery, [
                from.toUpperCase(),
                to.toUpperCase(),
                departureDate,
                parseInt(passengers)
            ]);

            let returnFlights = [];
            if (returnDate) {
                const returnSearchQuery = searchQuery.replace('$1', '$5').replace('$2', '$1').replace('$3', '$6');
                const returnResult = await query(returnSearchQuery, [
                    to.toUpperCase(),
                    from.toUpperCase(),
                    departureDate,
                    parseInt(passengers),
                    from.toUpperCase(),
                    returnDate
                ]);
                returnFlights = returnResult.rows;
            }

            res.json({
                success: true,
                data: {
                    outboundFlights: outboundFlights.rows,
                    returnFlights,
                    searchCriteria: {
                        from: from.toUpperCase(),
                        to: to.toUpperCase(),
                        departureDate,
                        returnDate,
                        passengers: parseInt(passengers),
                        seatClass
                    }
                }
            });
        } catch (error) {
            console.error('Search flights error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to search flights'
            });
        }
    }
};

module.exports = flightController;