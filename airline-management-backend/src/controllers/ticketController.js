const { query } = require('../config/database');
const { formatTicketResponse } = require('../utils/ticketGenerator');

const ticketController = {
    // Get ticket by ticket number
    async getTicketByNumber(req, res) {
        try {
            const { ticketNumber } = req.params;

            const result = await query(`
                SELECT 
                    t.*,
                    b.booking_reference, b.seat_class, b.total_amount, b.payment_status, b.booking_status,
                    bp.first_name, bp.last_name, bp.date_of_birth, bp.gender, 
                    bp.passport_number, bp.nationality, bp.seat_number, bp.meal_preference,
                    f.flight_number, f.aircraft_type, f.departure_airport, f.arrival_airport,
                    f.departure_date, f.departure_time, f.arrival_date, f.arrival_time,
                    f.gate, f.terminal,
                    a.name as airline_name
                FROM tickets t
                JOIN bookings b ON t.booking_id = b.id
                JOIN booking_passengers bp ON t.passenger_id = bp.id
                JOIN flights f ON b.flight_id = f.id
                JOIN airlines a ON f.airline_id = a.id
                WHERE t.ticket_number = $1
            `, [ticketNumber]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Ticket not found'
                });
            }

            const ticketData = result.rows[0];
            const formattedTicket = formatTicketResponse(
                ticketData,
                ticketData,
                ticketData,
                ticketData
            );

            res.status(200).json({
                success: true,
                data: formattedTicket
            });
        } catch (error) {
            console.error('Get ticket error:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to retrieve ticket'
            });
        }
    },

    // Get all tickets for a booking
    async getTicketsByBooking(req, res) {
        try {
            const { bookingId } = req.params;
            const userId = req.user.id;
            const userRole = req.user.role;

            // Check if user has access to this booking
            const bookingCheck = await query(`
                SELECT user_id FROM bookings WHERE id = $1
            `, [bookingId]);

            if (bookingCheck.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking not found'
                });
            }

            // Customers can only see their own bookings
            if (userRole === 'customer' && bookingCheck.rows[0].user_id !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            const result = await query(`
                SELECT 
                    t.*,
                    b.booking_reference, b.seat_class, b.total_amount, b.payment_status, b.booking_status,
                    bp.first_name, bp.last_name, bp.date_of_birth, bp.gender,
                    bp.passport_number, bp.nationality, bp.seat_number, bp.meal_preference,
                    f.flight_number, f.aircraft_type, f.departure_airport, f.arrival_airport,
                    f.departure_date, f.departure_time, f.arrival_date, f.arrival_time,
                    f.gate, f.terminal,
                    a.name as airline_name
                FROM tickets t
                JOIN bookings b ON t.booking_id = b.id
                JOIN booking_passengers bp ON t.passenger_id = bp.id
                JOIN flights f ON b.flight_id = f.id
                JOIN airlines a ON f.airline_id = a.id
                WHERE t.booking_id = $1
                ORDER BY bp.first_name, bp.last_name
            `, [bookingId]);

            const tickets = result.rows.map(row => formatTicketResponse(row, row, row, row));

            res.status(200).json({
                success: true,
                count: tickets.length,
                data: tickets
            });
        } catch (error) {
            console.error('Get tickets by booking error:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to retrieve tickets'
            });
        }
    },

    // Get user's tickets (all tickets from user's bookings)
    async getMyTickets(req, res) {
        try {
            const userId = req.user.id;
            const { status } = req.query; // Filter by ticket status if provided

            let queryText = `
                SELECT 
                    t.*,
                    b.booking_reference, b.seat_class, b.total_amount, b.payment_status, b.booking_status,
                    bp.first_name, bp.last_name, bp.date_of_birth, bp.gender,
                    bp.passport_number, bp.nationality, bp.seat_number, bp.meal_preference,
                    f.flight_number, f.aircraft_type, f.departure_airport, f.arrival_airport,
                    f.departure_date, f.departure_time, f.arrival_date, f.arrival_time,
                    f.gate, f.terminal,
                    a.name as airline_name
                FROM tickets t
                JOIN bookings b ON t.booking_id = b.id
                JOIN booking_passengers bp ON t.passenger_id = bp.id
                JOIN flights f ON b.flight_id = f.id
                JOIN airlines a ON f.airline_id = a.id
                WHERE b.user_id = $1
            `;

            const params = [userId];

            if (status) {
                queryText += ` AND t.ticket_status = $2`;
                params.push(status);
            }

            queryText += ` ORDER BY f.departure_date DESC, f.departure_time DESC`;

            const result = await query(queryText, params);

            const tickets = result.rows.map(row => formatTicketResponse(row, row, row, row));

            res.status(200).json({
                success: true,
                count: tickets.length,
                data: tickets
            });
        } catch (error) {
            console.error('Get my tickets error:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to retrieve tickets'
            });
        }
    },

    // Check-in using ticket
    async checkInTicket(req, res) {
        try {
            const { ticketNumber } = req.params;
            const userId = req.user.id;

            // Get ticket and verify ownership
            const ticketResult = await query(`
                SELECT t.*, b.user_id, b.booking_status, f.status as flight_status
                FROM tickets t
                JOIN bookings b ON t.booking_id = b.id
                JOIN flights f ON b.flight_id = f.id
                WHERE t.ticket_number = $1
            `, [ticketNumber]);

            if (ticketResult.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Ticket not found'
                });
            }

            const ticket = ticketResult.rows[0];

            // Verify ownership (customer can only check-in their own ticket)
            if (req.user.role === 'customer' && ticket.user_id !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            // Check if booking is confirmed
            if (ticket.booking_status !== 'confirmed') {
                return res.status(400).json({
                    success: false,
                    message: 'Booking must be confirmed to check-in'
                });
            }

            // Check if flight is available for check-in
            if (!['scheduled', 'boarding'].includes(ticket.flight_status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Flight is not available for check-in'
                });
            }

            // Check if already checked in
            if (ticket.checked_in) {
                return res.status(400).json({
                    success: false,
                    message: 'Ticket already checked in',
                    checkInTime: ticket.check_in_time
                });
            }

            // Perform check-in
            const updateResult = await query(`
                UPDATE tickets
                SET checked_in = true,
                    check_in_time = CURRENT_TIMESTAMP,
                    updated_at = CURRENT_TIMESTAMP
                WHERE ticket_number = $1
                RETURNING *
            `, [ticketNumber]);

            res.status(200).json({
                success: true,
                message: 'Check-in successful',
                data: {
                    ticketNumber: updateResult.rows[0].ticket_number,
                    checkedIn: true,
                    checkInTime: updateResult.rows[0].check_in_time
                }
            });
        } catch (error) {
            console.error('Check-in ticket error:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to check-in'
            });
        }
    },

    // Cancel ticket (admin or owner)
    async cancelTicket(req, res) {
        try {
            const { ticketNumber } = req.params;
            const userId = req.user.id;

            // Get ticket and verify ownership
            const ticketResult = await query(`
                SELECT t.*, b.user_id, b.booking_status
                FROM tickets t
                JOIN bookings b ON t.booking_id = b.id
                WHERE t.ticket_number = $1
            `, [ticketNumber]);

            if (ticketResult.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Ticket not found'
                });
            }

            const ticket = ticketResult.rows[0];

            // Verify ownership
            if (req.user.role === 'customer' && ticket.user_id !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            // Check if already cancelled
            if (ticket.ticket_status === 'cancelled') {
                return res.status(400).json({
                    success: false,
                    message: 'Ticket already cancelled'
                });
            }

            // Cancel ticket
            const updateResult = await query(`
                UPDATE tickets
                SET ticket_status = 'cancelled',
                    updated_at = CURRENT_TIMESTAMP
                WHERE ticket_number = $1
                RETURNING *
            `, [ticketNumber]);

            res.status(200).json({
                success: true,
                message: 'Ticket cancelled successfully',
                data: {
                    ticketNumber: updateResult.rows[0].ticket_number,
                    status: updateResult.rows[0].ticket_status
                }
            });
        } catch (error) {
            console.error('Cancel ticket error:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to cancel ticket'
            });
        }
    }
};

module.exports = ticketController;
