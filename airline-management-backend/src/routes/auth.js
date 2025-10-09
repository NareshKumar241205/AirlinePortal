const express = require('express');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Public routes (with rate limiting)
router.post('/register', authLimiter, asyncHandler(authController.register));
router.post('/login', authLimiter, asyncHandler(authController.login));
router.post('/refresh-token', authLimiter, asyncHandler(authController.refreshToken));

// Protected routes (require authentication)
router.use(authenticate); // All routes below this point require authentication

router.get('/profile', asyncHandler(authController.getProfile));
router.put('/profile', asyncHandler(authController.updateProfile));
router.put('/change-password', asyncHandler(authController.changePassword));
router.post('/logout', asyncHandler(authController.logout));

module.exports = router;