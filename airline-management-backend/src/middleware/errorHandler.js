const winston = require('winston');
const config = require('../config/config');

// Create winston logger
const logger = winston.createLogger({
    level: config.logging.level,
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: 'airline-management-api' },
    transports: [
        new winston.transports.File({ 
            filename: 'logs/error.log', 
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        new winston.transports.File({ 
            filename: 'logs/combined.log',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        })
    ],
});

// Add console transport in development
if (config.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }));
}

// Error handling middleware
const errorHandler = (error, req, res, next) => {
    // Log the error
    logger.error('API Error', {
        error: error.message,
        stack: error.stack,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id,
        timestamp: new Date().toISOString()
    });

    // Handle specific error types
    if (error.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: error.details || error.message
        });
    }

    if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }

    if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expired'
        });
    }

    if (error.code === '23505') { // PostgreSQL unique constraint violation
        return res.status(409).json({
            success: false,
            message: 'Resource already exists'
        });
    }

    if (error.code === '23503') { // PostgreSQL foreign key constraint violation
        return res.status(400).json({
            success: false,
            message: 'Referenced resource does not exist'
        });
    }

    if (error.code === '23502') { // PostgreSQL not null constraint violation
        return res.status(400).json({
            success: false,
            message: 'Required field is missing'
        });
    }

    // Default error response
    const statusCode = error.statusCode || 500;
    const message = config.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : error.message || 'Something went wrong';

    res.status(statusCode).json({
        success: false,
        message,
        ...(config.NODE_ENV !== 'production' && { stack: error.stack })
    });
};

// 404 handler
const notFoundHandler = (req, res) => {
    logger.warn('404 Error', {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
    });

    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
};

// Request logging middleware
const requestLogger = (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        
        logger.info('HTTP Request', {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            userId: req.user?.id,
            timestamp: new Date().toISOString()
        });
    });

    next();
};

// Async error wrapper
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

module.exports = {
    logger,
    errorHandler,
    notFoundHandler,
    requestLogger,
    asyncHandler
};