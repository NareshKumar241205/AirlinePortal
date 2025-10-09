const express = require('express');
const flightController = require('../controllers/flightController');
const { authenticate, requireAirlineAdmin, requireCustomer } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Public routes (for authenticated users)
router.get('/', asyncHandler(flightController.getAllFlights));
router.get('/search', asyncHandler(flightController.searchFlights));
router.get('/:id', asyncHandler(flightController.getFlightById));

// Airline Admin only routes
router.post('/', requireAirlineAdmin, asyncHandler(flightController.createFlight));
router.put('/:id', requireAirlineAdmin, asyncHandler(flightController.updateFlight));
router.patch('/:id/status', requireAirlineAdmin, asyncHandler(flightController.updateFlightStatus));
router.delete('/:id', requireAirlineAdmin, asyncHandler(flightController.deleteFlight));

module.exports = router;