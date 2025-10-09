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

        // 1. Insert Users with correct column names and role_ids
        console.log('👥 Inserting Users...');
        const usersResult = await client.query(`
            INSERT INTO users (email, password_hash, first_name, last_name, phone, role_id, is_active, is_verified, created_at) VALUES
            ('superadmin@airportal.com', $1, 'Super', 'Administrator', '+1234567890', 1, true, true, NOW()),
            ('admin@skyways.com', $1, 'James', 'Wilson', '+1234567891', 2, true, true, NOW()),
            ('admin@bluesky.com', $1, 'Sarah', 'Johnson', '+1234567892', 2, true, true, NOW()),
            ('admin@rapidair.com', $1, 'Michael', 'Brown', '+1234567893', 2, true, true, NOW()),
            ('pilot@skyways.com', $1, 'Captain', 'Thompson', '+1234567894', 3, true, true, NOW()),
            ('pilot@bluesky.com', $1, 'Captain', 'Davis', '+1234567895', 3, true, true, NOW()),
            ('crew@rapidair.com', $1, 'Flight', 'Attendant', '+1234567896', 3, true, true, NOW()),
            ('john.doe@email.com', $1, 'John', 'Doe', '+1234567897', 4, true, true, NOW()),
            ('jane.smith@email.com', $1, 'Jane', 'Smith', '+1234567898', 4, true, true, NOW()),
            ('alice.johnson@email.com', $1, 'Alice', 'Johnson', '+1234567899', 4, true, true, NOW()),
            ('bob.wilson@email.com', $1, 'Bob', 'Wilson', '+1234567800', 4, true, true, NOW()),
            ('emma.davis@email.com', $1, 'Emma', 'Davis', '+1234567801', 4, true, true, NOW()),
            ('david.miller@email.com', $1, 'David', 'Miller', '+1234567802', 4, true, true, NOW()),
            ('lisa.garcia@email.com', $1, 'Lisa', 'Garcia', '+1234567803', 4, true, true, NOW()),
            ('mark.martinez@email.com', $1, 'Mark', 'Martinez', '+1234567804', 4, true, true, NOW())
            ON CONFLICT (email) DO NOTHING
            RETURNING id, email, role_id;
        `, [hashedPassword]);
        
        console.log(`✅ Inserted ${usersResult.rows.length} users`);
        usersResult.rows.forEach(user => {
            const roleName = user.role_id === 1 ? 'super_admin' : user.role_id === 2 ? 'airline_admin' : user.role_id === 3 ? 'crew_member' : 'customer';
            console.log(`   - ${user.email} (${roleName})`);
        });

        // Get user IDs for airlines
        const adminUsers = await client.query('SELECT id, email FROM users WHERE role_id = 2 ORDER BY created_at');

        // 2. Insert Airlines with correct column names
        console.log('\\n✈️  Inserting Airlines...');
        const airlinesResult = await client.query(`
            INSERT INTO airlines (
                name, code, country, headquarters_address, contact_email, contact_phone, 
                website_url, description, admin_user_id, is_approved, approval_status, created_at
            ) VALUES
            ('Skyways International', 'SKY', 'United States', '123 Aviation Blvd, New York, NY 10001', 'info@skyways.com', '+1-800-SKY-WAYS', 'https://www.skyways.com', 'Premium international airline offering luxury travel experiences', $1, true, 'approved', NOW()),
            ('BlueSky Airways', 'BSA', 'United States', '456 Terminal Way, Los Angeles, CA 90045', 'contact@bluesky.com', '+1-800-BLUE-SKY', 'https://www.bluesky.com', 'Regional airline connecting major cities with excellent service', $2, true, 'approved', NOW()),
            ('RapidAir Express', 'RAE', 'United States', '789 Runway St, Chicago, IL 60666', 'support@rapidair.com', '+1-800-RAPID-AIR', 'https://www.rapidair.com', 'Fast and efficient domestic flights at affordable prices', $3, false, 'pending', NOW()),
            ('Atlantic Wings', 'ATW', 'United Kingdom', '321 Heathrow Ave, London, UK', 'booking@atlanticwings.co.uk', '+44-800-ATLANTIC', 'https://www.atlanticwings.co.uk', 'Transatlantic flights with modern fleet and comfort', $1, false, 'pending', NOW()),
            ('Pacific Airlines', 'PAC', 'Singapore', '654 Changi Way, Singapore', 'reservations@pacific.com.sg', '+65-800-PACIFIC', 'https://www.pacific.com.sg', 'Connecting Asia-Pacific region with world-class service', $2, false, 'rejected', NOW())
            ON CONFLICT (code) DO NOTHING
            RETURNING id, name, code, approval_status;
        `, [
            adminUsers.rows[0]?.id || null,
            adminUsers.rows[1]?.id || null,
            adminUsers.rows[2]?.id || null
        ]);
        
        console.log(`✅ Inserted ${airlinesResult.rows.length} airlines`);
        airlinesResult.rows.forEach(airline => {
            console.log(`   - ${airline.name} (${airline.code}) - ${airline.approval_status}`);
        });

        // 3. Insert Flights with correct column names
        console.log('\\n🛩️  Inserting Flights...');
        const flightsResult = await client.query(`
            INSERT INTO flights (
                airline_id, flight_number, aircraft_type, departure_airport, arrival_airport,
                departure_date, departure_time, arrival_date, arrival_time,
                total_seats, available_seats, economy_seats, business_seats, first_class_seats,
                economy_price, business_price, first_class_price, status, created_at
            ) VALUES
            ((SELECT id FROM airlines WHERE code = 'SKY' LIMIT 1), 'SKY001', 'Boeing 777-300ER', 'JFK', 'LAX', '2024-12-20', '08:00:00', '2024-12-20', '11:30:00', 350, 285, 280, 50, 20, 449.99, 1299.99, 2499.99, 'scheduled', NOW()),
            ((SELECT id FROM airlines WHERE code = 'SKY' LIMIT 1), 'SKY002', 'Boeing 777-300ER', 'LAX', 'JFK', '2024-12-20', '14:00:00', '2024-12-20', '22:30:00', 350, 298, 280, 50, 20, 479.99, 1349.99, 2599.99, 'scheduled', NOW()),
            ((SELECT id FROM airlines WHERE code = 'SKY' LIMIT 1), 'SKY101', 'Airbus A350-900', 'JFK', 'LHR', '2024-12-21', '20:00:00', '2024-12-22', '07:30:00', 300, 267, 240, 40, 20, 699.99, 2199.99, 4299.99, 'scheduled', NOW()),
            ((SELECT id FROM airlines WHERE code = 'SKY' LIMIT 1), 'SKY102', 'Airbus A350-900', 'LHR', 'JFK', '2024-12-22', '10:00:00', '2024-12-22', '13:30:00', 300, 289, 240, 40, 20, 729.99, 2299.99, 4499.99, 'scheduled', NOW()),
            ((SELECT id FROM airlines WHERE code = 'BSA' LIMIT 1), 'BSA201', 'Boeing 737-800', 'LAX', 'SFO', '2024-12-20', '09:00:00', '2024-12-20', '10:30:00', 180, 156, 150, 20, 10, 199.99, 699.99, 1299.99, 'scheduled', NOW()),
            ((SELECT id FROM airlines WHERE code = 'BSA' LIMIT 1), 'BSA202', 'Boeing 737-800', 'SFO', 'LAX', '2024-12-20', '12:00:00', '2024-12-20', '13:30:00', 180, 167, 150, 20, 10, 189.99, 679.99, 1249.99, 'scheduled', NOW()),
            ((SELECT id FROM airlines WHERE code = 'BSA' LIMIT 1), 'BSA301', 'Airbus A321neo', 'LAX', 'MIA', '2024-12-21', '06:00:00', '2024-12-21', '13:45:00', 220, 198, 180, 30, 10, 389.99, 999.99, 1899.99, 'scheduled', NOW()),
            ((SELECT id FROM airlines WHERE code = 'BSA' LIMIT 1), 'BSA302', 'Airbus A321neo', 'MIA', 'LAX', '2024-12-21', '15:00:00', '2024-12-21', '18:15:00', 220, 203, 180, 30, 10, 399.99, 1029.99, 1949.99, 'scheduled', NOW()),
            ((SELECT id FROM airlines WHERE code = 'SKY' LIMIT 1), 'SKY301', 'Boeing 787-9', 'JFK', 'CDG', '2024-12-23', '21:30:00', '2024-12-24', '10:45:00', 280, 245, 240, 30, 10, 799.99, 2499.99, 4799.99, 'scheduled', NOW()),
            ((SELECT id FROM airlines WHERE code = 'BSA' LIMIT 1), 'BSA401', 'Boeing 737 MAX 8', 'ORD', 'DEN', '2024-12-20', '07:30:00', '2024-12-20', '09:15:00', 172, 158, 150, 18, 4, 249.99, 749.99, 1399.99, 'delayed', NOW()),
            ((SELECT id FROM airlines WHERE code = 'SKY' LIMIT 1), 'SKY501', 'Boeing 777-300ER', 'LAX', 'NRT', '2024-12-25', '11:00:00', '2024-12-26', '15:30:00', 350, 312, 280, 50, 20, 899.99, 2799.99, 5499.99, 'scheduled', NOW()),
            ((SELECT id FROM airlines WHERE code = 'BSA' LIMIT 1), 'BSA501', 'Airbus A320neo', 'SEA', 'LAX', '2024-12-22', '16:00:00', '2024-12-22', '18:45:00', 150, 134, 130, 15, 5, 299.99, 849.99, 1599.99, 'scheduled', NOW())
            RETURNING id, flight_number, departure_airport, arrival_airport, status;
        `);
        
        console.log(`✅ Inserted ${flightsResult.rows.length} flights`);
        flightsResult.rows.forEach(flight => {
            console.log(`   - ${flight.flight_number}: ${flight.departure_airport} → ${flight.arrival_airport} (${flight.status})`);
        });

        // 4. Insert Bookings
        const customerUsers = await client.query('SELECT id, first_name, last_name FROM users WHERE role_id = 4 LIMIT 5');
        const flights = await client.query('SELECT id, flight_number, economy_price FROM flights LIMIT 6');
        
        if (customerUsers.rows.length > 0 && flights.rows.length > 0) {
            console.log('\\n🎫 Inserting Bookings...');
            
            const bookingsData = [];
            for (let i = 0; i < Math.min(customerUsers.rows.length, flights.rows.length); i++) {
                const customer = customerUsers.rows[i];
                const flight = flights.rows[i];
                
                bookingsData.push([
                    customer.id,
                    flight.id,
                    `${flight.flight_number}BK00${i + 1}`,
                    'economy',
                    flight.economy_price,
                    'confirmed',
                    JSON.stringify([{
                        firstName: customer.first_name,
                        lastName: customer.last_name,
                        dateOfBirth: '1990-01-01',
                        passportNumber: `US${String(i + 1).padStart(9, '0')}`,
                        seatNumber: `${10 + i}A`
                    }])
                ]);
            }

            for (const booking of bookingsData) {
                await client.query(`
                    INSERT INTO bookings (
                        user_id, flight_id, booking_reference, seat_class, 
                        total_amount, booking_status, passengers, created_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
                    ON CONFLICT DO NOTHING
                `, booking);
            }
            
            console.log(`✅ Inserted ${bookingsData.length} bookings`);
        }

        console.log('\\n═══════════════════════════════════════════════');
        console.log('✅ Sample data insertion completed successfully!');
        console.log('═══════════════════════════════════════════════');

        await displayAllTables(client);

    } catch (error) {
        console.error('❌ Error inserting sample data:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function displayAllTables(client) {
    console.log('\\n📊 DISPLAYING ALL DATABASE TABLES');
    console.log('═══════════════════════════════════════════════');

    try {
        // 1. Users Table
        console.log('\\n👥 USERS TABLE:');
        console.log('─'.repeat(130));
        const users = await client.query(`
            SELECT u.id, u.email, u.first_name, u.last_name, u.phone, r.name as role, 
                   u.is_active, u.created_at::date as created_date
            FROM users u
            JOIN roles r ON u.role_id = r.id
            ORDER BY u.created_at
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
            SELECT id, name, code, country, headquarters_address, approval_status, 
                   created_at::date as created_date
            FROM airlines 
            ORDER BY created_at
        `);
        
        console.log('ID                                   | Name                  | Code | Country       | Headquarters         | Status   | Created');
        console.log('─'.repeat(130));
        airlines.rows.forEach(airline => {
            console.log(`${airline.id.substring(0,8)}... | ${airline.name.padEnd(21)} | ${airline.code.padEnd(4)} | ${airline.country.padEnd(13)} | ${(airline.headquarters_address || 'N/A').substring(0,20).padEnd(20)} | ${airline.approval_status.padEnd(8)} | ${airline.created_date}`);
        });

        // 3. Flights Table
        console.log('\\n\\n🛩️  FLIGHTS TABLE:');
        console.log('─'.repeat(160));
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
        console.log('─'.repeat(160));
        flights.rows.forEach(flight => {
            const route = `${flight.departure_airport}-${flight.arrival_airport}`;
            const seats = `${flight.available_seats}/${flight.total_seats}`;
            console.log(`${flight.id.substring(0,8)} | ${flight.airline_code.padEnd(4)} | ${flight.flight_number.padEnd(8)} | ${route.padEnd(9)} | ${flight.departure_date} | ${flight.departure_time.substring(0,5).padEnd(8)} | ${flight.arrival_time.substring(0,5).padEnd(8)} | ${flight.aircraft_type.padEnd(15)} | ${seats.padEnd(7)} | $${flight.economy_price.toString().padEnd(6)} | ${flight.status}`);
        });

        // 4. Bookings Table
        console.log('\\n\\n🎫 BOOKINGS TABLE:');
        console.log('─'.repeat(140));
        const bookings = await client.query(`
            SELECT b.id, b.booking_reference, u.first_name || ' ' || u.last_name as customer_name,
                   f.flight_number, b.seat_class, b.total_amount, b.booking_status,
                   b.created_at::date as booking_date
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN flights f ON b.flight_id = f.id
            ORDER BY b.created_at
            LIMIT 20
        `);
        
        console.log('ID       | Reference      | Customer Name     | Flight   | Class    | Amount  | Status    | Date');
        console.log('─'.repeat(140));
        bookings.rows.forEach(booking => {
            console.log(`${booking.id.substring(0,8)} | ${booking.booking_reference.padEnd(14)} | ${booking.customer_name.padEnd(17)} | ${booking.flight_number.padEnd(8)} | ${booking.seat_class.padEnd(8)} | $${booking.total_amount.toString().padEnd(6)} | ${booking.booking_status.padEnd(9)} | ${booking.booking_date}`);
        });

        // 5. Summary Statistics
        console.log('\\n\\n📊 DATABASE SUMMARY:');
        console.log('─'.repeat(50));
        console.log(`👥 Total Users: ${users.rows.length}`);
        console.log(`   - Super Admins: ${users.rows.filter(u => u.role === 'super_admin').length}`);
        console.log(`   - Airline Admins: ${users.rows.filter(u => u.role === 'airline_admin').length}`);
        console.log(`   - Crew Members: ${users.rows.filter(u => u.role === 'crew_member').length}`);
        console.log(`   - Customers: ${users.rows.filter(u => u.role === 'customer').length}`);
        console.log(`✈️  Total Airlines: ${airlines.rows.length}`);
        console.log(`   - Approved: ${airlines.rows.filter(a => a.approval_status === 'approved').length}`);
        console.log(`   - Pending: ${airlines.rows.filter(a => a.approval_status === 'pending').length}`);
        console.log(`   - Rejected: ${airlines.rows.filter(a => a.approval_status === 'rejected').length}`);
        console.log(`🛩️  Total Flights: ${flights.rows.length}`);
        console.log(`   - Scheduled: ${flights.rows.filter(f => f.status === 'scheduled').length}`);
        console.log(`   - Delayed: ${flights.rows.filter(f => f.status === 'delayed').length}`);
        console.log(`🎫 Total Bookings: ${bookings.rows.length}`);
        
        if (bookings.rows.length > 0) {
            const totalRevenue = bookings.rows
                .filter(b => b.booking_status === 'confirmed')
                .reduce((sum, b) => sum + parseFloat(b.total_amount), 0);
            console.log(`💰 Total Revenue: $${totalRevenue.toFixed(2)}`);
        }

        console.log('\\n═══════════════════════════════════════════════');
        console.log('✅ Database display completed successfully!');
        console.log('═══════════════════════════════════════════════');

    } catch (error) {
        console.error('❌ Error displaying tables:', error);
    }
}

async function main() {
    try {
        await insertSampleData();
    } catch (error) {
        console.error('❌ Script failed:', error);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

// Run the script
main();