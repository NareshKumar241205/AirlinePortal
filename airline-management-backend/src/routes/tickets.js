const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { authenticate, requireCustomer } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// Apply authentication to all routes
router.use(authenticate);

// Get user's tickets (customer only)
router.get('/my-tickets', requireCustomer, asyncHandler(ticketController.getMyTickets));

// Get tickets by booking ID
router.get('/booking/:bookingId', asyncHandler(ticketController.getTicketsByBooking));

// Get single ticket by ticket number
router.get('/:ticketNumber', asyncHandler(ticketController.getTicketByNumber));

// Check-in with ticket
router.post('/:ticketNumber/check-in', asyncHandler(ticketController.checkInTicket));

// Cancel ticket
router.patch('/:ticketNumber/cancel', asyncHandler(ticketController.cancelTicket));

module.exports = router;
