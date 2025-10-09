const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const config = require('./config/config');
const { testConnection } = require('./config/database');
const { errorHandler, notFoundHandler, requestLogger } = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const airlineRoutes = require('./routes/airlines');
const flightRoutes = require('./routes/flights');
const bookingRoutes = require('./routes/bookings');
const ticketRoutes = require('./routes/tickets');

// Create Express app
const app = express();

// Trust proxy (important for rate limiting when behind a proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));

// CORS configuration
app.use(cors(config.cors));

// Compression middleware
app.use(compression());

// Request parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (config.NODE_ENV === 'production') {
    app.use(morgan('combined'));
} else {
    app.use(morgan('dev'));
}
app.use(requestLogger);

// Rate limiting
app.use(generalLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Multi-Airline Management API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: config.NODE_ENV
    });
});

// API documentation endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to Multi-Airline Management Portal API',
        version: '1.0.0',
        documentation: '/api/docs',
        endpoints: {
            auth: '/api/v1/auth',
            users: '/api/v1/users',
            airlines: '/api/v1/airlines',
            flights: '/api/v1/flights',
            bookings: '/api/v1/bookings',
            tickets: '/api/v1/tickets'
        },
        features: [
            'User Authentication & Authorization',
            'Role-Based Access Control (RBAC)',
            'Multi-Airline Management',
            'Flight Scheduling & Management',
            'Booking System',
            'Crew Management',
            'Real-time Flight Status Updates',
            'Secure Payment Processing',
            'Administrative Dashboard'
        ]
    });
});

// API routes
const apiPrefix = `${config.API_PREFIX}/${config.API_VERSION}`;
app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/users`, userRoutes);
app.use(`${apiPrefix}/airlines`, airlineRoutes);
app.use(`${apiPrefix}/flights`, flightRoutes);
app.use(`${apiPrefix}/bookings`, bookingRoutes);
app.use(`${apiPrefix}/tickets`, ticketRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
    try {
        // Test database connection
        const dbConnected = await testConnection();
        if (!dbConnected) {
            console.error('❌ Failed to connect to database. Exiting...');
            process.exit(1);
        }

        // Start the server
        const server = app.listen(config.PORT, () => {
            console.log('🚀 Multi-Airline Management Portal API Started!');
            console.log('═══════════════════════════════════════════════');
            console.log(`📡 Server running on port: ${config.PORT}`);
            console.log(`🌍 Environment: ${config.NODE_ENV}`);
            console.log(`📚 API Documentation: http://localhost:${config.PORT}/`);
            console.log(`🔗 Base URL: http://localhost:${config.PORT}${apiPrefix}`);
            console.log('═══════════════════════════════════════════════');
            console.log('📋 AVAILABLE API ENDPOINTS:');
            console.log('');
            console.log('🔐 AUTHENTICATION ROUTES (/api/v1/auth):');
            console.log('  POST   /register           - User registration');
            console.log('  POST   /login              - User login');
            console.log('  POST   /refresh-token      - Refresh JWT token');
            console.log('  GET    /profile            - Get user profile (Auth)');
            console.log('  PUT    /profile            - Update profile (Auth)');
            console.log('  PUT    /change-password    - Change password (Auth)');
            console.log('  POST   /logout             - User logout (Auth)');
            console.log('');
            console.log('👥 USER MANAGEMENT ROUTES (/api/v1/users):');
            console.log('  GET    /roles              - Get all roles (Auth)');
            console.log('  GET    /                   - Get all users (Super Admin)');
            console.log('  GET    /stats              - User statistics (Super Admin)');
            console.log('  GET    /:id                - Get user by ID (Super Admin)');
            console.log('  PUT    /:id/role           - Update user role (Super Admin)');
            console.log('  PUT    /:id/status         - Toggle user status (Super Admin)');
            console.log('  DELETE /:id                - Delete user (Super Admin)');
            console.log('');
            console.log('✈️  AIRLINE MANAGEMENT ROUTES (/api/v1/airlines):');
            console.log('  GET    /                   - Get all airlines (Auth)');
            console.log('  GET    /stats              - Airline statistics (Auth)');
            console.log('  GET    /:id                - Get airline by ID (Auth)');
            console.log('  POST   /register           - Register airline (Airline Admin)');
            console.log('  PUT    /:id                - Update airline (Airline Admin + Owner)');
            console.log('  PUT    /:id/approval       - Update approval status (Super Admin)');
            console.log('  DELETE /:id                - Delete airline (Super Admin)');
            console.log('');
            console.log('🛩️  FLIGHT MANAGEMENT ROUTES (/api/v1/flights):');
            console.log('  GET    /                   - Get all flights (Auth)');
            console.log('  GET    /search             - Search flights (Auth)');
            console.log('  GET    /:id                - Get flight by ID (Auth)');
            console.log('  POST   /                   - Create flight (Airline Admin)');
            console.log('  PUT    /:id                - Update flight (Airline Admin)');
            console.log('  PATCH  /:id/status         - Update flight status (Airline Admin)');
            console.log('  DELETE /:id                - Delete flight (Airline Admin)');
            console.log('');
            console.log('🎫 BOOKING MANAGEMENT ROUTES (/api/v1/bookings):');
            console.log('  POST   /                   - Create booking (Customer)');
            console.log('  GET    /my-bookings        - Get user bookings (Customer)');
            console.log('  GET    /:id                - Get booking by ID (Owner/Admin)');
            console.log('  PATCH  /:id/cancel         - Cancel booking (Customer)');
            console.log('  GET    /                   - Get all bookings (Airline Admin)');
            console.log('  GET    /admin/stats        - Booking statistics (Airline Admin)');
            console.log('');
            console.log('🎟️  E-TICKET MANAGEMENT ROUTES (/api/v1/tickets):');
            console.log('  GET    /my-tickets         - Get user tickets (Customer)');
            console.log('  GET    /booking/:bookingId - Get tickets by booking ID (Auth)');
            console.log('  GET    /:ticketNumber      - Get ticket by number (Auth)');
            console.log('  POST   /:ticketNumber/check-in - Check-in with ticket (Auth)');
            console.log('  PATCH  /:ticketNumber/cancel   - Cancel ticket (Auth)');
            console.log('');
            console.log('🏥 HEALTH & INFO ROUTES:');
            console.log('  GET    /                   - API documentation & info');
            console.log('  GET    /health             - Health check endpoint');
            console.log('');
            console.log('🔑 ROLE PERMISSIONS:');
            console.log('  🔴 Super Admin    - Full system access');
            console.log('  🟡 Airline Admin  - Airline & flight management');
            console.log('  🔵 Crew Member    - Flight operations (view)');
            console.log('  🟢 Customer       - Booking & profile management');
            console.log('');
            console.log('🛡️  SECURITY FEATURES:');
            console.log('  • JWT Authentication with refresh tokens');
            console.log('  • Role-based access control (RBAC)');
            console.log('  • Rate limiting on sensitive endpoints');
            console.log('  • Request logging and monitoring');
            console.log('  • Input validation and sanitization');
            console.log('');
            console.log('═══════════════════════════════════════════════');
            console.log('✅ Ready to handle requests!');
        });

        // Graceful shutdown
        const gracefulShutdown = (signal) => {
            console.log(`\n🛑 ${signal} received. Starting graceful shutdown...`);
            
            server.close(() => {
                console.log('✅ HTTP server closed');
                
                // Close database connections
                const { closePool } = require('./config/database');
                closePool().then(() => {
                    console.log('✅ Database connections closed');
                    console.log('👋 Goodbye!');
                    process.exit(0);
                }).catch((error) => {
                    console.error('❌ Error closing database:', error);
                    process.exit(1);
                });
            });
        };

        // Handle shutdown signals
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            console.error('💥 Uncaught Exception:', error);
            process.exit(1);
        });

        process.on('unhandledRejection', (reason, promise) => {
            console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
            process.exit(1);
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Start the server
startServer();

module.exports = app;