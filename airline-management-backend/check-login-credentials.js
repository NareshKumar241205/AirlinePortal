const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

async function checkLoginCredentials() {
  try {
    console.log('🔍 Checking Database Login Credentials...\n');
    console.log('=' .repeat(100));

    // Check if roles exist
    console.log('\n📋 Step 1: Checking Roles Table...');
    const rolesResult = await pool.query('SELECT * FROM roles ORDER BY id');
    
    if (rolesResult.rows.length === 0) {
      console.log('⚠️  No roles found! Database might not be seeded.');
      console.log('   Run: node database/seed.js');
    } else {
      console.log(`✅ Found ${rolesResult.rows.length} roles:`);
      rolesResult.rows.forEach(role => {
        console.log(`   - ${role.name} (ID: ${role.id})`);
      });
    }

    // Check if users exist
    console.log('\n👥 Step 2: Checking Users Table...');
    const usersResult = await pool.query(`
      SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        r.name as role,
        u.is_active,
        u.is_verified,
        u.last_login,
        u.created_at
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      ORDER BY r.id, u.email
    `);

    if (usersResult.rows.length === 0) {
      console.log('⚠️  No users found! Database might not be seeded.');
      console.log('   Run: node database/seed.js');
    } else {
      console.log(`✅ Found ${usersResult.rows.length} users:\n`);
      
      usersResult.rows.forEach((user, index) => {
        console.log(`${index + 1}. ${'-'.repeat(80)}`);
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   👤 Name: ${user.first_name} ${user.last_name}`);
        console.log(`   🎭 Role: ${user.role || 'UNKNOWN'}`);
        console.log(`   ✓ Active: ${user.is_active ? '✅' : '❌'}`);
        console.log(`   ✓ Verified: ${user.is_verified ? '✅' : '❌'}`);
        console.log(`   🕐 Last Login: ${user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}`);
        console.log(`   📅 Created: ${new Date(user.created_at).toLocaleString()}`);
      });
    }

    // Summary by role
    console.log('\n' + '='.repeat(100));
    console.log('📊 Summary by Role:\n');
    const summaryResult = await pool.query(`
      SELECT 
        r.name as role,
        COUNT(u.id) as user_count,
        COUNT(CASE WHEN u.is_active = true THEN 1 END) as active_count
      FROM roles r
      LEFT JOIN users u ON r.id = u.role_id
      GROUP BY r.name
      ORDER BY r.name
    `);

    summaryResult.rows.forEach(row => {
      console.log(`   ${row.role}: ${row.user_count} total (${row.active_count} active)`);
    });

    // Demo user suggestions
    console.log('\n' + '='.repeat(100));
    console.log('💡 Demo Users for Testing:\n');
    console.log('   These users should be in your database:');
    console.log('   1. superadmin@airportal.com  (Super Admin)');
    console.log('   2. admin@skyways.com         (Airline Admin)');
    console.log('   3. pilot@skyways.com         (Crew Member)');
    console.log('   4. john.doe@email.com        (Passenger)');
    console.log('\n   Default password for demo users: password123');
    
    // Check if demo users exist
    console.log('\n🔍 Checking Demo Users...\n');
    const demoEmails = [
      'superadmin@airportal.com',
      'admin@skyways.com',
      'pilot@skyways.com',
      'john.doe@email.com'
    ];

    for (const email of demoEmails) {
      const check = await pool.query('SELECT email, is_active FROM users WHERE email = $1', [email]);
      if (check.rows.length > 0) {
        console.log(`   ✅ ${email} - EXISTS ${check.rows[0].is_active ? '(Active)' : '(Inactive)'}`);
      } else {
        console.log(`   ❌ ${email} - NOT FOUND`);
      }
    }

    console.log('\n' + '='.repeat(100));
    console.log('\n✨ Done! Database check complete.\n');

    await pool.end();
  } catch (error) {
    console.error('\n❌ Error connecting to database:');
    console.error('   Message:', error.message);
    console.error('\n💡 Tips:');
    console.error('   - Check your .env file has correct database credentials');
    console.error('   - Make sure your IP is whitelisted in Aiven console');
    console.error('   - Verify database is running');
    process.exit(1);
  }
}

checkLoginCredentials();
