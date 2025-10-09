require('dotenv').config();

const config = {
    // Environment
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT, 10) || 3000,
    
    // API Configuration
    API_VERSION: process.env.API_VERSION || 'v1',
    API_PREFIX: process.env.API_PREFIX || '/api',
    
    // Database Configuration
    database: {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT, 10) || 5432,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        ssl: process.env.DB_SSL === 'true'
    },
    
    // JWT Configuration
    jwt: {
        secret: process.env.JWT_SECRET || 'your-fallback-secret',
        expiresIn: process.env.JWT_EXPIRE || '24h',
        refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-fallback-refresh-secret',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRE || '7d'
    },
    
    // Security Configuration
    bcrypt: {
        saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12
    },
    
    // Rate Limiting
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100
    },
    
    // Authentication Settings
    auth: {
        maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS, 10) || 5,
        lockoutTimeHours: parseInt(process.env.LOCKOUT_TIME_HOURS, 10) || 2
    },
    
    // Logging Configuration
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        file: process.env.LOG_FILE || 'logs/app.log'
    },
    
    // Email Configuration (Optional)
    email: {
        service: process.env.EMAIL_SERVICE,
        user: process.env.EMAIL_USER,
        password: process.env.EMAIL_PASSWORD
    },
    
    // CORS Configuration
    cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true
    }
};

// Validate required environment variables
const requiredEnvVars = [
    'DB_HOST',
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD',
    'JWT_SECRET'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars.join(', '));
    console.error('Please check your .env file and ensure all required variables are set.');
    process.exit(1);
}

module.exports = config;