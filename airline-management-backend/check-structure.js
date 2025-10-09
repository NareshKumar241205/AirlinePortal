const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function checkTables() {
    const client = await pool.connect();
    
    try {
        console.log('🔍 Checking database structure...');
        console.log('═══════════════════════════════════════════════');

        // Check users table structure
        console.log('\n👥 USERS TABLE STRUCTURE:');
        const usersStructure = await client.query(`
            SELECT column_name, data_type, is_nullable, column_default 
            FROM information_schema.columns 
            WHERE table_name = 'users' 
            ORDER BY ordinal_position
        `);
        
        usersStructure.rows.forEach(col => {
            console.log(`- ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULLABLE'}`);
        });

        // Check airlines table structure
        console.log('\n✈️  AIRLINES TABLE STRUCTURE:');
        const airlinesStructure = await client.query(`
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'airlines' 
            ORDER BY ordinal_position
        `);
        
        airlinesStructure.rows.forEach(col => {
            console.log(`- ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULLABLE'}`);
        });

        // Check flights table structure
        console.log('\n🛩️  FLIGHTS TABLE STRUCTURE:');
        const flightsStructure = await client.query(`
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'flights' 
            ORDER BY ordinal_position
        `);
        
        flightsStructure.rows.forEach(col => {
            console.log(`- ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULLABLE'}`);
        });

        // Check roles table
        console.log('\n🔑 ROLES TABLE:');
        const roles = await client.query('SELECT * FROM roles ORDER BY id');
        console.log('Available roles:');
        roles.rows.forEach(role => {
            console.log(`- ID: ${role.id}, Name: ${role.name}`);
        });

        console.log('\n═══════════════════════════════════════════════');
        console.log('✅ Table structure check completed!');

    } catch (error) {
        console.error('❌ Error checking tables:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

checkTables();