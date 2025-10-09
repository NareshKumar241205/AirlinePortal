const express = require('express');
const bookingController = require('../controllers/bookingController');
const { authenticate, requireCustomer, requireAirlineAdmin, requireSuperAdmin, verifyBookingOwnership } = require('../middleware/auth');
const { bookingLimiter } = require('../middleware/rateLimiter');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Customer routes
router.post('/', requireCustomer, bookingLimiter, asyncHandler(bookingController.createBooking));
router.get('/my-bookings', requireCustomer, asyncHandler(bookingController.getUserBookings));
router.get('/:id', verifyBookingOwnership, asyncHandler(bookingController.getBookingById));
router.patch('/:id/cancel', requireCustomer, asyncHandler(bookingController.cancelBooking));

// Admin routes (Airline Admin and Super Admin)
router.get('/', requireAirlineAdmin, asyncHandler(bookingController.getAllBookings));
router.get('/admin/stats', requireAirlineAdmin, asyncHandler(bookingController.getBookingStats));

module.exports = router;