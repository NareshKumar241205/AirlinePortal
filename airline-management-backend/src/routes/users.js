const express = require('express');
const userController = require('../controllers/userController');
const { authenticate, requireSuperAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all roles (accessible to all authenticated users)
router.get('/roles', asyncHandler(userController.getRoles));

// Routes that require Super Admin access
router.use(requireSuperAdmin);

// User management routes
router.get('/', asyncHandler(userController.getAllUsers));
router.get('/stats', asyncHandler(userController.getUserStats));
router.get('/:id', asyncHandler(userController.getUserById));
router.put('/:id/role', asyncHandler(userController.updateUserRole));
router.put('/:id/status', asyncHandler(userController.toggleUserStatus));
router.delete('/:id', asyncHandler(userController.deleteUser));

module.exports = router;