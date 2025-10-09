const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000, // 10 seconds timeout
});

console.log('Testing connection with configuration:');
console.log(`Host: ${process.env.DB_HOST}`);
console.log(`Port: ${process.env.DB_PORT}`);
console.log(`Database: ${process.env.DB_NAME}`);
console.log(`User: ${process.env.DB_USER}`);
console.log(`SSL: ${process.env.DB_SSL}`);

async function testConnection() {
    try {
        console.log('Attempting to connect to database...');
        const client = await pool.connect();
        console.log('✅ Database connection successful!');
        
        const result = await client.query('SELECT NOW() as current_time');
        console.log('✅ Query executed successfully:', result.rows[0]);
        
        client.release();
        process.exit(0);
    } catch (error) {
        console.error('❌ Database connection failed:');
        console.error(`Error code: ${error.code}`);
        console.error(`Error message: ${error.message}`);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n🔍 Possible causes:');
            console.log('1. The Aiven database instance might be stopped or deleted');
            console.log('2. Network firewall blocking the connection');
            console.log('3. Incorrect host/port configuration');
            console.log('4. Database maintenance in progress');
        }
        
        process.exit(1);
    }
}

testConnection();