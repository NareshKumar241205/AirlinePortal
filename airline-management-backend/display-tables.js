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

async function displayAllTables() {
    const client = await pool.connect();
    
    try {
        console.log('📊 MULTI-AIRLINE MANAGEMENT PORTAL - DATABASE OVERVIEW');
        console.log('═══════════════════════════════════════════════════════════');

        // 1. Users Table
        console.log('\\n👥 USERS TABLE:');
        console.log('─'.repeat(130));
        const users = await client.query(`
            SELECT u.id, u.email, u.first_name, u.last_name, u.phone, r.name as role, 
                   u.is_active, u.created_at::date as created_date
            FROM users u
            JOIN roles r ON u.role_id = r.id
            ORDER BY r.id, u.first_name
        `);
        
        console.log('ID                                   | Email                      | Name              | Phone        | Role          | Active | Created');
        console.log('─'.repeat(130));
        users.rows.forEach(user => {
            console.log(`${user.id.substring(0,8)}... | ${user.email.padEnd(26)} | ${(user.first_name + ' ' + user.last_name).padEnd(17)} | ${(user.phone || 'N/A').padEnd(12)} | ${user.role.padEnd(13)} | ${user.is_active ? 'Yes' : 'No'.padEnd(6)} | ${user.created_date}`);
        });

        // 2. Airlines Table  
        console.log('\\n\\n✈️  AIRLINES TABLE:');
        console.log('─'.repeat(130));
        const airlines = await client.query(`
            SELECT a.id, a.name, a.code, a.country, a.contact_email, 
                   a.approval_status, u.first_name || ' ' || u.last_name as admin_name,
                   a.created_at::date as created_date
            FROM airlines a
            LEFT JOIN users u ON a.admin_user_id = u.id
            ORDER BY a.approval_status DESC, a.name
        `);
        
        console.log('ID                                   | Name                  | Code | Country       | Admin             | Status   | Created');
        console.log('─'.repeat(130));
        airlines.rows.forEach(airline => {
            console.log(`${airline.id.substring(0,8)}... | ${airline.name.padEnd(21)} | ${airline.code.padEnd(4)} | ${airline.country.padEnd(13)} | ${(airline.admin_name || 'Unassigned').padEnd(17)} | ${airline.approval_status.padEnd(8)} | ${airline.created_date}`);
        });

        // 3. Flights Table
        console.log('\\n\\n🛩️  FLIGHTS TABLE:');
        console.log('─'.repeat(150));
        const flights = await client.query(`
            SELECT f.id, a.code as airline_code, f.flight_number, 
                   f.departure_airport, f.arrival_airport, 
                   f.departure_date, f.departure_time, f.arrival_time,
                   f.aircraft_type, f.total_seats, f.available_seats, 
                   f.economy_price, f.status
            FROM flights f
            JOIN airlines a ON f.airline_id = a.id
            ORDER BY f.departure_date, f.departure_time
        `);
        
        console.log('ID       | Code | Flight   | Route     | Date       | Dep Time | Arr Time | Aircraft        | Seats   | Economy | Status');
        console.log('─'.repeat(150));
        flights.rows.forEach(flight => {
            const route = `${flight.departure_airport}-${flight.arrival_airport}`;
            const seats = `${flight.available_seats}/${flight.total_seats}`;
            console.log(`${flight.id.substring(0,8)} | ${flight.airline_code.padEnd(4)} | ${flight.flight_number.padEnd(8)} | ${route.padEnd(9)} | ${flight.departure_date} | ${flight.departure_time.substring(0,5).padEnd(8)} | ${flight.arrival_time.substring(0,5).padEnd(8)} | ${flight.aircraft_type.padEnd(15)} | ${seats.padEnd(7)} | $${flight.economy_price.toString().padEnd(6)} | ${flight.status}`);
        });

        // 4. Roles Table
        console.log('\\n\\n🔑 ROLES & PERMISSIONS:');
        console.log('─'.repeat(80));
        const roles = await client.query('SELECT * FROM roles ORDER BY id');
        const userCounts = await client.query(`
            SELECT r.name, COUNT(u.id) as user_count
            FROM roles r
            LEFT JOIN users u ON r.id = u.role_id
            GROUP BY r.id, r.name
            ORDER BY r.id
        `);
        
        console.log('ID | Role Name     | Description                                      | Users');
        console.log('─'.repeat(80));
        userCounts.rows.forEach(role => {
            let description = '';
            switch(role.name) {
                case 'super_admin': description = 'Full system access and management'; break;
                case 'airline_admin': description = 'Airline and flight management'; break;
                case 'crew_member': description = 'Flight operations and schedules'; break;
                case 'customer': description = 'Flight booking and profile management'; break;
            }
            console.log(`${roles.rows.find(r => r.name === role.name).id}  | ${role.name.padEnd(13)} | ${description.padEnd(48)} | ${role.user_count}`);
        });

        // 5. Summary Statistics
        console.log('\\n\\n📊 DATABASE SUMMARY STATISTICS:');
        console.log('─'.repeat(60));
        
        // User statistics
        const userStats = await client.query(`
            SELECT 
                COUNT(*) as total_users,
                COUNT(CASE WHEN r.name = 'super_admin' THEN 1 END) as super_admins,
                COUNT(CASE WHEN r.name = 'airline_admin' THEN 1 END) as airline_admins,
                COUNT(CASE WHEN r.name = 'crew_member' THEN 1 END) as crew_members,
                COUNT(CASE WHEN r.name = 'customer' THEN 1 END) as customers,
                COUNT(CASE WHEN u.is_active = true THEN 1 END) as active_users
            FROM users u
            JOIN roles r ON u.role_id = r.id
        `);
        
        // Airline statistics
        const airlineStats = await client.query(`
            SELECT 
                COUNT(*) as total_airlines,
                COUNT(CASE WHEN approval_status = 'approved' THEN 1 END) as approved,
                COUNT(CASE WHEN approval_status = 'pending' THEN 1 END) as pending,
                COUNT(CASE WHEN approval_status = 'rejected' THEN 1 END) as rejected
            FROM airlines
        `);
        
        // Flight statistics
        const flightStats = await client.query(`
            SELECT 
                COUNT(*) as total_flights,
                COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled,
                COUNT(CASE WHEN status = 'delayed' THEN 1 END) as delayed,
                COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
                SUM(total_seats) as total_seats,
                SUM(available_seats) as available_seats,
                ROUND(AVG(economy_price), 2) as avg_economy_price
            FROM flights
        `);
        
        const us = userStats.rows[0];
        const as = airlineStats.rows[0];
        const fs = flightStats.rows[0];
        
        console.log(`👥 USERS:`);
        console.log(`   Total: ${us.total_users} (${us.active_users} active)`);
        console.log(`   Super Admins: ${us.super_admins} | Airline Admins: ${us.airline_admins}`);
        console.log(`   Crew Members: ${us.crew_members} | Customers: ${us.customers}`);
        
        console.log(`\\n✈️  AIRLINES:`);
        console.log(`   Total: ${as.total_airlines}`);
        console.log(`   Approved: ${as.approved} | Pending: ${as.pending} | Rejected: ${as.rejected}`);
        
        console.log(`\\n🛩️  FLIGHTS:`);
        console.log(`   Total: ${fs.total_flights}`);
        console.log(`   Scheduled: ${fs.scheduled} | Delayed: ${fs.delayed} | Cancelled: ${fs.cancelled || 0}`);
        console.log(`   Total Seats: ${fs.total_seats} | Available: ${fs.available_seats}`);
        console.log(`   Average Economy Price: $${fs.avg_economy_price}`);
        console.log(`   Load Factor: ${(((fs.total_seats - fs.available_seats) / fs.total_seats) * 100).toFixed(1)}%`);

        // System health
        console.log(`\\n🔧 SYSTEM HEALTH:`);
        const activeAirlines = as.approved;
        const totalCapacity = fs.total_seats;
        const bookingCapacity = totalCapacity - fs.available_seats;
        
        console.log(`   Active Airlines: ${activeAirlines}`);
        console.log(`   Fleet Status: ${fs.scheduled} scheduled flights`);
        console.log(`   Booking Utilization: ${bookingCapacity}/${totalCapacity} seats (${((bookingCapacity/totalCapacity)*100).toFixed(1)}%)`);

        console.log('\\n═══════════════════════════════════════════════════════════');
        console.log('✅ Multi-Airline Management Portal Database Ready!');
        console.log('📡 Backend API Server: http://localhost:3000');
        console.log('📚 API Documentation: http://localhost:3000/');
        console.log('🔗 API Base: http://localhost:3000/api/v1');
        console.log('═══════════════════════════════════════════════════════════');

    } catch (error) {
        console.error('❌ Error displaying tables:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

displayAllTables();