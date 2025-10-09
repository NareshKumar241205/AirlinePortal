const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Database connection
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function insertSampleData() {
    const client = await pool.connect();
    
    try {
        console.log('🚀 Starting to insert sample data...');
        console.log('═══════════════════════════════════════════════');

        // Hash password for all users
        const hashedPassword = await bcrypt.hash('Password123!', 12);

        // 1. Insert Users with different roles
        console.log('👥 Inserting Users...');
        const usersResult = await client.query(`
            INSERT INTO users (email, password_hash, first_name, last_name, phone_number, role, status, created_at) VALUES
            ('superadmin@airportal.com', $1, 'Super', 'Administrator', '+1234567890', 'super_admin', 'active', NOW()),
            ('admin@skyways.com', $1, 'James', 'Wilson', '+1234567891', 'airline_admin', 'active', NOW()),
            ('admin@bluesky.com', $1, 'Sarah', 'Johnson', '+1234567892', 'airline_admin', 'active', NOW()),
            ('admin@rapidair.com', $1, 'Michael', 'Brown', '+1234567893', 'airline_admin', 'active', NOW()),
            ('pilot@skyways.com', $1, 'Captain', 'Thompson', '+1234567894', 'crew_member', 'active', NOW()),
            ('pilot@bluesky.com', $1, 'Captain', 'Davis', '+1234567895', 'crew_member', 'active', NOW()),
            ('crew@rapidair.com', $1, 'Flight', 'Attendant', '+1234567896', 'crew_member', 'active', NOW()),
            ('john.doe@email.com', $1, 'John', 'Doe', '+1234567897', 'customer', 'active', NOW()),
            ('jane.smith@email.com', $1, 'Jane', 'Smith', '+1234567898', 'customer', 'active', NOW()),
            ('alice.johnson@email.com', $1, 'Alice', 'Johnson', '+1234567899', 'customer', 'active', NOW()),
            ('bob.wilson@email.com', $1, 'Bob', 'Wilson', '+1234567800', 'customer', 'active', NOW()),
            ('emma.davis@email.com', $1, 'Emma', 'Davis', '+1234567801', 'customer', 'active', NOW()),
            ('david.miller@email.com', $1, 'David', 'Miller', '+1234567802', 'customer', 'active', NOW()),
            ('lisa.garcia@email.com', $1, 'Lisa', 'Garcia', '+1234567803', 'customer', 'active', NOW()),
            ('mark.martinez@email.com', $1, 'Mark', 'Martinez', '+1234567804', 'customer', 'active', NOW())
            ON CONFLICT (email) DO NOTHING
            RETURNING id, email, role;
        `, [hashedPassword]);
        
        console.log(`✅ Inserted ${usersResult.rows.length} users`);
        usersResult.rows.forEach(user => {
            console.log(`   - ${user.email} (${user.role})`);
        });

        // 2. Insert Airlines
        console.log('\n✈️  Inserting Airlines...');
        const airlinesResult = await client.query(`
            INSERT INTO airlines (name, code, description, country, headquarters, contact_email, contact_phone, website, admin_user_id, approval_status, created_at) VALUES
            ('Skyways International', 'SKY', 'Premium international airline offering luxury travel experiences', 'United States', 'New York, NY', 'info@skyways.com', '+1-800-SKY-WAYS', 'https://www.skyways.com', 2, 'approved', NOW()),
            ('BlueSky Airways', 'BSA', 'Regional airline connecting major cities with excellent service', 'United States', 'Los Angeles, CA', 'contact@bluesky.com', '+1-800-BLUE-SKY', 'https://www.bluesky.com', 3, 'approved', NOW()),
            ('RapidAir Express', 'RAE', 'Fast and efficient domestic flights at affordable prices', 'United States', 'Chicago, IL', 'support@rapidair.com', '+1-800-RAPID-AIR', 'https://www.rapidair.com', 4, 'pending', NOW()),
            ('Atlantic Wings', 'ATW', 'Transatlantic flights with modern fleet and comfort', 'United Kingdom', 'London, UK', 'booking@atlanticwings.co.uk', '+44-800-ATLANTIC', 'https://www.atlanticwings.co.uk', NULL, 'pending', NOW()),
            ('Pacific Airlines', 'PAC', 'Connecting Asia-Pacific region with world-class service', 'Singapore', 'Singapore', 'reservations@pacific.com.sg', '+65-800-PACIFIC', 'https://www.pacific.com.sg', NULL, 'rejected', NOW())
            ON CONFLICT (code) DO NOTHING
            RETURNING id, name, code, approval_status;
        `);
        
        console.log(`✅ Inserted ${airlinesResult.rows.length} airlines`);
        airlinesResult.rows.forEach(airline => {
            console.log(`   - ${airline.name} (${airline.code}) - ${airline.approval_status}`);
        });

        // 3. Insert Flights
        console.log('\n🛩️  Inserting Flights...');
        const flightsResult = await client.query(`
            INSERT INTO flights (airline_id, flight_number, origin, destination, departure_time, arrival_time, aircraft_type, total_seats, available_seats, economy_price, business_price, first_class_price, status, created_at) VALUES
            (1, 'SKY001', 'JFK', 'LAX', '2024-12-20 08:00:00', '2024-12-20 11:30:00', 'Boeing 777-300ER', 350, 285, 449.99, 1299.99, 2499.99, 'scheduled', NOW()),
            (1, 'SKY002', 'LAX', 'JFK', '2024-12-20 14:00:00', '2024-12-20 22:30:00', 'Boeing 777-300ER', 350, 298, 479.99, 1349.99, 2599.99, 'scheduled', NOW()),
            (1, 'SKY101', 'JFK', 'LHR', '2024-12-21 20:00:00', '2024-12-22 07:30:00', 'Airbus A350-900', 300, 267, 699.99, 2199.99, 4299.99, 'scheduled', NOW()),
            (1, 'SKY102', 'LHR', 'JFK', '2024-12-22 10:00:00', '2024-12-22 13:30:00', 'Airbus A350-900', 300, 289, 729.99, 2299.99, 4499.99, 'scheduled', NOW()),
            (2, 'BSA201', 'LAX', 'SFO', '2024-12-20 09:00:00', '2024-12-20 10:30:00', 'Boeing 737-800', 180, 156, 199.99, 699.99, 1299.99, 'scheduled', NOW()),
            (2, 'BSA202', 'SFO', 'LAX', '2024-12-20 12:00:00', '2024-12-20 13:30:00', 'Boeing 737-800', 180, 167, 189.99, 679.99, 1249.99, 'scheduled', NOW()),
            (2, 'BSA301', 'LAX', 'MIA', '2024-12-21 06:00:00', '2024-12-21 13:45:00', 'Airbus A321neo', 220, 198, 389.99, 999.99, 1899.99, 'scheduled', NOW()),
            (2, 'BSA302', 'MIA', 'LAX', '2024-12-21 15:00:00', '2024-12-21 18:15:00', 'Airbus A321neo', 220, 203, 399.99, 1029.99, 1949.99, 'scheduled', NOW()),
            (1, 'SKY301', 'JFK', 'CDG', '2024-12-23 21:30:00', '2024-12-24 10:45:00', 'Boeing 787-9', 280, 245, 799.99, 2499.99, 4799.99, 'scheduled', NOW()),
            (2, 'BSA401', 'ORD', 'DEN', '2024-12-20 07:30:00', '2024-12-20 09:15:00', 'Boeing 737 MAX 8', 172, 158, 249.99, 749.99, 1399.99, 'delayed', NOW()),
            (1, 'SKY501', 'LAX', 'NRT', '2024-12-25 11:00:00', '2024-12-26 15:30:00', 'Boeing 777-300ER', 350, 312, 899.99, 2799.99, 5499.99, 'scheduled', NOW()),
            (2, 'BSA501', 'SEA', 'LAX', '2024-12-22 16:00:00', '2024-12-22 18:45:00', 'Airbus A320neo', 150, 134, 299.99, 849.99, 1599.99, 'scheduled', NOW())
            ON CONFLICT (flight_number, departure_time) DO NOTHING
            RETURNING id, flight_number, origin, destination, status;
        `);
        
        console.log(`✅ Inserted ${flightsResult.rows.length} flights`);
        flightsResult.rows.forEach(flight => {
            console.log(`   - ${flight.flight_number}: ${flight.origin} → ${flight.destination} (${flight.status})`);
        });

        // 4. Insert Crew Assignments (only if we have crew and flights)
        const crewCheck = await client.query('SELECT COUNT(*) as count FROM users WHERE role = $1', ['crew_member']);
        const flightCheck = await client.query('SELECT COUNT(*) as count FROM flights');
        
        if (crewCheck.rows[0].count > 0 && flightCheck.rows[0].count > 0) {
            console.log('\n👨‍✈️ Inserting Crew Assignments...');
            const crewResult = await client.query(`
                INSERT INTO crew_flights (user_id, flight_id, role, assigned_at) 
                SELECT u.id, f.id, 'pilot', NOW()
                FROM users u, flights f 
                WHERE u.role = 'crew_member' AND u.email = 'pilot@skyways.com' AND f.id IN (1, 2, 3)
                ON CONFLICT (user_id, flight_id) DO NOTHING
                RETURNING id, user_id, flight_id, role;
            `);
            
            const attendantResult = await client.query(`
                INSERT INTO crew_flights (user_id, flight_id, role, assigned_at) 
                SELECT u.id, f.id, 'flight_attendant', NOW()
                FROM users u, flights f 
                WHERE u.role = 'crew_member' AND u.email = 'crew@rapidair.com' AND f.id IN (7, 8, 12)
                ON CONFLICT (user_id, flight_id) DO NOTHING
                RETURNING id, user_id, flight_id, role;
            `);
            
            console.log(`✅ Inserted ${crewResult.rows.length + attendantResult.rows.length} crew assignments`);
        }

        // 5. Insert Bookings (only if we have customers and flights)
        const customerCheck = await client.query('SELECT COUNT(*) as count FROM users WHERE role = $1', ['customer']);
        
        if (customerCheck.rows[0].count > 0 && flightCheck.rows[0].count > 0) {
            console.log('\n🎫 Inserting Bookings...');
            const bookingsResult = await client.query(`
                INSERT INTO bookings (user_id, flight_id, booking_reference, seat_class, total_amount, booking_status, passengers, created_at) 
                SELECT 
                    u.id,
                    f.id,
                    f.flight_number || 'BK00' || u.id,
                    'economy',
                    f.economy_price,
                    'confirmed',
                    jsonb_build_array(
                        jsonb_build_object(
                            'firstName', u.first_name,
                            'lastName', u.last_name,
                            'dateOfBirth', '1990-01-01',
                            'passportNumber', 'US' || lpad(u.id::text, 9, '0'),
                            'seatNumber', (10 + u.id) || 'A'
                        )
                    ),
                    NOW()
                FROM users u
                CROSS JOIN flights f
                WHERE u.role = 'customer' 
                AND u.id <= 12  -- Limit to first few customers
                AND f.id <= 8   -- Limit to first few flights
                ON CONFLICT DO NOTHING
                RETURNING id, booking_reference, seat_class, total_amount, booking_status;
            `);
            
            console.log(`✅ Inserted ${bookingsResult.rows.length} bookings`);
        }

        console.log('\n═══════════════════════════════════════════════');
        console.log('✅ Sample data insertion completed successfully!');
        console.log('═══════════════════════════════════════════════');

        // Now let's display all tables
        await displayAllTables(client);

    } catch (error) {
        console.error('❌ Error inserting sample data:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function displayAllTables(client) {
    console.log('\n📊 DISPLAYING ALL DATABASE TABLES');
    console.log('═══════════════════════════════════════════════');

    try {
        // 1. Users Table
        console.log('\n👥 USERS TABLE:');
        console.log('─'.repeat(120));
        const users = await client.query(`
            SELECT id, email, first_name, last_name, phone_number, role, status, 
                   created_at::date as created_date
            FROM users 
            ORDER BY id
        `);
        
        console.log('ID | Email                      | Name              | Phone        | Role          | Status | Created');
        console.log('─'.repeat(120));
        users.rows.forEach(user => {
            console.log(`${user.id.toString().padEnd(2)} | ${user.email.padEnd(26)} | ${(user.first_name + ' ' + user.last_name).padEnd(17)} | ${user.phone_number.padEnd(12)} | ${user.role.padEnd(13)} | ${user.status.padEnd(6)} | ${user.created_date}`);
        });

        // 2. Airlines Table
        console.log('\n\n✈️  AIRLINES TABLE:');
        console.log('─'.repeat(120));
        const airlines = await client.query(`
            SELECT id, name, code, country, headquarters, approval_status, 
                   admin_user_id, created_at::date as created_date
            FROM airlines 
            ORDER BY id
        `);
        
        console.log('ID | Name                  | Code | Country       | Headquarters    | Status   | Admin | Created');
        console.log('─'.repeat(120));
        airlines.rows.forEach(airline => {
            console.log(`${airline.id.toString().padEnd(2)} | ${airline.name.padEnd(21)} | ${airline.code.padEnd(4)} | ${airline.country.padEnd(13)} | ${airline.headquarters.padEnd(15)} | ${airline.approval_status.padEnd(8)} | ${(airline.admin_user_id || 'N/A').toString().padEnd(5)} | ${airline.created_date}`);
        });

        // 3. Flights Table
        console.log('\n\n🛩️  FLIGHTS TABLE:');
        console.log('─'.repeat(150));
        const flights = await client.query(`
            SELECT f.id, a.code as airline_code, f.flight_number, f.origin, f.destination, 
                   f.departure_time::timestamp::date as dep_date,
                   f.departure_time::time as dep_time,
                   f.arrival_time::time as arr_time,
                   f.aircraft_type, f.total_seats, f.available_seats, 
                   f.economy_price, f.status
            FROM flights f
            JOIN airlines a ON f.airline_id = a.id
            ORDER BY f.id
        `);
        
        console.log('ID | Code | Flight   | Route     | Date       | Departure | Arrival | Aircraft        | Seats   | Economy | Status');
        console.log('─'.repeat(150));
        flights.rows.forEach(flight => {
            const route = `${flight.origin}-${flight.destination}`;
            const seats = `${flight.available_seats}/${flight.total_seats}`;
            console.log(`${flight.id.toString().padEnd(2)} | ${flight.airline_code.padEnd(4)} | ${flight.flight_number.padEnd(8)} | ${route.padEnd(9)} | ${flight.dep_date} | ${flight.dep_time.substring(0,5).padEnd(9)} | ${flight.arr_time.substring(0,5).padEnd(7)} | ${flight.aircraft_type.padEnd(15)} | ${seats.padEnd(7)} | $${flight.economy_price.toString().padEnd(6)} | ${flight.status}`);
        });

        // 4. Bookings Table
        console.log('\n\n🎫 BOOKINGS TABLE:');
        console.log('─'.repeat(120));
        const bookings = await client.query(`
            SELECT b.id, b.booking_reference, u.first_name || ' ' || u.last_name as customer_name,
                   f.flight_number, b.seat_class, b.total_amount, b.booking_status,
                   b.created_at::date as booking_date
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN flights f ON b.flight_id = f.id
            ORDER BY b.id
            LIMIT 20
        `);
        
        console.log('ID | Reference      | Customer Name     | Flight   | Class    | Amount  | Status    | Date');
        console.log('─'.repeat(120));
        bookings.rows.forEach(booking => {
            console.log(`${booking.id.toString().padEnd(2)} | ${booking.booking_reference.padEnd(14)} | ${booking.customer_name.padEnd(17)} | ${booking.flight_number.padEnd(8)} | ${booking.seat_class.padEnd(8)} | $${booking.total_amount.toString().padEnd(6)} | ${booking.booking_status.padEnd(9)} | ${booking.booking_date}`);
        });

        // 5. Crew Assignments Table
        console.log('\n\n👨‍✈️ CREW ASSIGNMENTS TABLE:');
        console.log('─'.repeat(100));
        const crew = await client.query(`
            SELECT cf.id, u.first_name || ' ' || u.last_name as crew_name,
                   f.flight_number, cf.role, cf.assigned_at::date as assigned_date
            FROM crew_flights cf
            JOIN users u ON cf.user_id = u.id
            JOIN flights f ON cf.flight_id = f.id
            ORDER BY cf.id
        `);
        
        console.log('ID | Crew Member Name  | Flight   | Role              | Assigned Date');
        console.log('─'.repeat(100));
        crew.rows.forEach(member => {
            console.log(`${member.id.toString().padEnd(2)} | ${member.crew_name.padEnd(17)} | ${member.flight_number.padEnd(8)} | ${member.role.padEnd(17)} | ${member.assigned_date}`);
        });

        // 6. Summary Statistics
        console.log('\n\n📊 DATABASE SUMMARY:');
        console.log('─'.repeat(50));
        console.log(`👥 Total Users: ${users.rows.length}`);
        console.log(`✈️  Total Airlines: ${airlines.rows.length}`);
        console.log(`🛩️  Total Flights: ${flights.rows.length}`);
        console.log(`🎫 Total Bookings: ${bookings.rows.length}`);
        console.log(`👨‍✈️ Total Crew Assignments: ${crew.rows.length}`);
        
        if (bookings.rows.length > 0) {
            const totalRevenue = bookings.rows
                .filter(b => b.booking_status === 'confirmed')
                .reduce((sum, b) => sum + parseFloat(b.total_amount), 0);
            console.log(`💰 Total Revenue: $${totalRevenue.toFixed(2)}`);
        }

        console.log('\n═══════════════════════════════════════════════');
        console.log('✅ Database display completed successfully!');
        console.log('═══════════════════════════════════════════════');

    } catch (error) {
        console.error('❌ Error displaying tables:', error);
    }
}
