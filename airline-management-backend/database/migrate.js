const fs = require('fs');
const path = require('path');
const { pool } = require('../src/config/database');

async function runMigrations() {
    try {
        console.log('🔄 Starting database migrations...');
        
        // Read and execute schema.sql
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        
        console.log('📄 Executing database schema...');
        await pool.query(schemaSql);
        
        console.log('✅ Database migrations completed successfully!');
        
        // Verify tables were created
        const tablesQuery = `
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        `;
        
        const result = await pool.query(tablesQuery);
        console.log('📊 Created tables:', result.rows.map(row => row.table_name).join(', '));
        
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Run migrations if called directly
if (require.main === module) {
    runMigrations();
}

module.exports = { runMigrations };