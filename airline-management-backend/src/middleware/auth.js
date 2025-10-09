const jwt = require('jsonwebtoken');
const config = require('../config/config');
const AuthService = require('../utils/authService');

// Authentication middleware
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No valid token provided.'
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        
        try {
            const decoded = jwt.verify(token, config.jwt.secret);
            
            // Get fresh user data to ensure user is still active
            const user = await AuthService.getUserById(decoded.id);
            
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            if (!user.is_active) {
                return res.status(401).json({
                    success: false,
                    message: 'Account is deactivated'
                });
            }

            // Attach user info to request
            req.user = {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                roleId: user.role_id,
                roleName: user.role_name,
                permissions: user.permissions,
                isActive: user.is_active,
                isVerified: user.is_verified
            };

            next();
        } catch (jwtError) {
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token expired'
                });
            }
            
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
    } catch (error) {
        console.error('Authentication middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Authentication error'
        });
    }
};

// Role-based authorization middleware
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const userRole = req.user.roleName;
        
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${userRole}`
            });
        }

        next();
    };
};

// Permission-based authorization middleware
const requirePermission = (resource, action) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const permissions = req.user.permissions || {};
        
        // Super admin has all permissions
        if (permissions.all) {
            return next();
        }

        // Check specific resource permissions
        const resourcePermissions = permissions[resource];
        if (!resourcePermissions || !resourcePermissions.includes(action)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Missing permission: ${resource}:${action}`
            });
        }

        next();
    };
};

// Role-specific middleware
const requireSuperAdmin = authorize('super_admin');
const requireAirlineAdmin = authorize('airline_admin', 'super_admin');
const requireCrewMember = authorize('crew_member', 'airline_admin', 'super_admin');
const requireCustomer = authorize('customer', 'crew_member', 'airline_admin', 'super_admin');

// Airline ownership verification middleware
const verifyAirlineOwnership = async (req, res, next) => {
    try {
        if (req.user.roleName === 'super_admin') {
            return next(); // Super admin can access all airlines
        }

        if (req.user.roleName !== 'airline_admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Airline admin role required.'
            });
        }

        const { query } = require('../config/database');
        const airlineId = req.params.airlineId || req.params.id || req.body.airlineId;

        if (!airlineId) {
            return res.status(400).json({
                success: false,
                message: 'Airline ID is required'
            });
        }

        // Check if user is the admin of this airline
        const result = await query(
            'SELECT id FROM airlines WHERE id = $1 AND admin_user_id = $2',
            [airlineId, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only manage your own airline.'
            });
        }

        req.airlineId = airlineId;
        next();
    } catch (error) {
        console.error('Airline ownership verification error:', error);
        return res.status(500).json({
            success: false,
            message: 'Authorization error'
        });
    }
};

// Booking ownership verification middleware
const verifyBookingOwnership = async (req, res, next) => {
    try {
        if (req.user.roleName === 'super_admin') {
            return next(); // Super admin can access all bookings
        }

        const { query } = require('../config/database');
        const bookingId = req.params.bookingId || req.params.id;

        if (!bookingId) {
            return res.status(400).json({
                success: false,
                message: 'Booking ID is required'
            });
        }

        // Check if user owns this booking or is airline admin of the flight's airline
        let checkQuery, queryParams;

        if (req.user.roleName === 'customer') {
            checkQuery = 'SELECT id FROM bookings WHERE id = $1 AND user_id = $2';
            queryParams = [bookingId, req.user.id];
        } else if (req.user.roleName === 'airline_admin') {
            checkQuery = `
                SELECT b.id FROM bookings b
                JOIN flights f ON b.flight_id = f.id
                JOIN airlines a ON f.airline_id = a.id
                WHERE b.id = $1 AND a.admin_user_id = $2
            `;
            queryParams = [bookingId, req.user.id];
        } else {
            return res.status(403).json({
                success: false,
                message: 'Access denied.'
            });
        }

        const result = await query(checkQuery, queryParams);

        if (result.rows.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only access your own bookings.'
            });
        }

        next();
    } catch (error) {
        console.error('Booking ownership verification error:', error);
        return res.status(500).json({
            success: false,
            message: 'Authorization error'
        });
    }
};

module.exports = {
    authenticate,
    authorize,
    requirePermission,
    requireSuperAdmin,
    requireAirlineAdmin,
    requireCrewMember,
    requireCustomer,
    verifyAirlineOwnership,
    verifyBookingOwnership
};