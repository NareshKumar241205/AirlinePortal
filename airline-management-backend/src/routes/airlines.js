const express = require('express');
const airlineController = require('../controllers/airlineController');
const { authenticate, requireSuperAdmin, requireAirlineAdmin, verifyAirlineOwnership } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Public routes (for authenticated users)
router.get('/', asyncHandler(airlineController.getAllAirlines));
router.get('/stats', asyncHandler(airlineController.getAirlineStats));
router.get('/:id', asyncHandler(airlineController.getAirlineById));

// Airline registration (requires airline admin role)
router.post('/register', requireAirlineAdmin, asyncHandler(airlineController.registerAirline));

// Airline management routes (requires airline ownership verification)
router.put('/:id', requireAirlineAdmin, verifyAirlineOwnership, asyncHandler(airlineController.updateAirline));

// Super Admin only routes
router.put('/:id/approval', requireSuperAdmin, asyncHandler(airlineController.updateAirlineApproval));
router.delete('/:id', requireSuperAdmin, asyncHandler(airlineController.deleteAirline));

module.exports = router;