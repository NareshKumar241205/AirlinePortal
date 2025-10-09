const { Pool } = require('pg');
require('dotenv').config();

// Database configuration for Aiven PostgreSQL
const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    max: 20, // Maximum number of connections in the pool
    idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
    connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
    statement_timeout: 60000, // Terminate any statement that takes more than 60 seconds
    query_timeout: 60000, // Terminate any query that takes more than 60 seconds
};

// Create connection pool
const pool = new Pool(dbConfig);

// Handle pool errors
pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

// Test database connection
const testConnection = async () => {
    try {
        const client = await pool.connect();
        console.log('✅ Successfully connected to Aiven PostgreSQL database');
        
        // Test query
        const result = await client.query('SELECT NOW() as current_time');
        console.log('🕒 Database time:', result.rows[0].current_time);
        
        client.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
};

// Query helper function
const query = async (text, params = []) => {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('Executed query', { text, duration, rows: result.rowCount });
        return result;
    } catch (error) {
        console.error('Database query error:', error.message);
        console.error('Query:', text);
        console.error('Params:', params);
        throw error;
    }
};

// Transaction helper function
const transaction = async (callback) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

// Close database connections gracefully
const closePool = async () => {
    try {
        await pool.end();
        console.log('✅ Database pool closed successfully');
    } catch (error) {
        console.error('❌ Error closing database pool:', error.message);
    }
};

module.exports = {
    pool,
    query,
    transaction,
    testConnection,
    closePool
};