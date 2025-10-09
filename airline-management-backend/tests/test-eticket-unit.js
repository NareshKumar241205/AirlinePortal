/**
 * E-Ticket System Unit Tests
 * Tests individual components without requiring server to be running
 */

const ticketGenerator = require('../src/utils/ticketGenerator');

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║  🎟️  E-TICKET SYSTEM UNIT TESTS                            ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

let testsPassed = 0;
let testsFailed = 0;

// Helper function for test results
function printResult(passed, testName, details = '') {
    if (passed) {
        console.log(`✅ PASS: ${testName}`);
        if (details) console.log(`   ${details}`);
        testsPassed++;
    } else {
        console.log(`❌ FAIL: ${testName}`);
        if (details) console.log(`   ${details}`);
        testsFailed++;
    }
}

function printSection(title) {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(title);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// Test 1: Generate Ticket Number
printSection('1️⃣  TICKET NUMBER GENERATION');

try {
    const ticketNumber = ticketGenerator.generateTicketNumber();
    const isValidFormat = /^TKT-\d{8}-\d{5}$/.test(ticketNumber);
    
    printResult(
        isValidFormat,
        'Ticket number format validation',
        `Generated: ${ticketNumber}`
    );
    
    // Test uniqueness
    const ticketNumber2 = ticketGenerator.generateTicketNumber();
    const isUnique = ticketNumber !== ticketNumber2;
    
    printResult(
        isUnique,
        'Ticket number uniqueness',
        `Generated 2 different numbers`
    );
} catch (error) {
    printResult(false, 'Ticket number generation', `Error: ${error.message}`);
}

// Test 2: Generate QR Code Data
printSection('2️⃣  QR CODE GENERATION');

try {
    const ticketInfo = {
        ticketNumber: 'TKT-20241007-12345',
        bookingReference: 'BK12345678',
        firstName: 'John',
        lastName: 'Doe',
        flightNumber: 'AA101',
        departureAirport: 'NYC',
        arrivalAirport: 'LAX',
        departureDate: '2024-01-20',
        departureTime: '08:30:00',
        seatClass: 'economy',
        seatNumber: '12A'
    };
    
    const qrCode = ticketGenerator.generateQRCodeData(ticketInfo);
    const qrData = JSON.parse(qrCode);
    
    printResult(
        qrData.ticketNumber === ticketInfo.ticketNumber,
        'QR code contains ticket number',
        `Ticket: ${qrData.ticketNumber}`
    );
    
    printResult(
        qrData.passengerName === 'John Doe',
        'QR code contains passenger name',
        `Passenger: ${qrData.passengerName}`
    );
    
    printResult(
        qrData.flightNumber === 'AA101',
        'QR code contains flight number',
        `Flight: ${qrData.flightNumber}`
    );
    
    const hasAllFields = qrData.ticketNumber && qrData.bookingReference && 
                        qrData.passengerName && qrData.flightNumber &&
                        qrData.departureAirport && qrData.arrivalAirport &&
                        qrData.departureDate && qrData.seatClass;
    
    printResult(
        hasAllFields,
        'QR code contains all required fields',
        `All critical data included`
    );
} catch (error) {
    printResult(false, 'QR code generation', `Error: ${error.message}`);
}

// Test 3: Generate Barcode Data
printSection('3️⃣  BARCODE GENERATION');

try {
    const ticketNumber = 'TKT-20241007-12345';
    const bookingRef = 'BK12345678';
    
    const barcode = ticketGenerator.generateBarcodeData(ticketNumber, bookingRef);
    const expectedFormat = `${ticketNumber}|${bookingRef}`;
    
    printResult(
        barcode === expectedFormat,
        'Barcode format validation',
        `Generated: ${barcode}`
    );
    
    const parts = barcode.split('|');
    printResult(
        parts.length === 2,
        'Barcode contains both ticket and booking reference',
        `Parts: ${parts.length}`
    );
} catch (error) {
    printResult(false, 'Barcode generation', `Error: ${error.message}`);
}

// Test 4: Calculate Valid Until
printSection('4️⃣  TICKET VALIDITY CALCULATION');

try {
    const departureDate = '2024-01-20';
    const departureTime = '08:30:00';
    
    const validUntil = ticketGenerator.calculateValidUntil(departureDate, departureTime);
    const validUntilDate = new Date(validUntil);
    const departureDateTime = new Date(`${departureDate}T${departureTime}`);
    
    // Should be 2 hours after departure
    const expectedTime = new Date(departureDateTime.getTime() + (2 * 60 * 60 * 1000));
    const timeDiff = Math.abs(validUntilDate - expectedTime);
    
    printResult(
        timeDiff < 1000, // Within 1 second
        'Validity period calculation (2 hours after departure)',
        `Valid Until: ${validUntilDate.toISOString()}`
    );
    
    const isAfterDeparture = validUntilDate > departureDateTime;
    printResult(
        isAfterDeparture,
        'Valid until is after departure time',
        `Buffer: 2 hours`
    );
} catch (error) {
    printResult(false, 'Validity calculation', `Error: ${error.message}`);
}

// Test 5: Create Ticket Data
printSection('5️⃣  COMPLETE TICKET DATA CREATION');

try {
    const booking = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        booking_reference: 'BK12345678',
        seat_class: 'economy'
    };
    
    const passenger = {
        id: '223e4567-e89b-12d3-a456-426614174001',
        first_name: 'John',
        last_name: 'Doe',
        seat_number: '12A'
    };
    
    const flight = {
        flight_number: 'AA101',
        departure_airport: 'NYC',
        arrival_airport: 'LAX',
        departure_date: '2024-01-20',
        departure_time: '08:30:00',
        gate: 'A12'
    };
    
    const ticketData = ticketGenerator.createTicketData(booking, passenger, flight);
    
    printResult(
        ticketData.ticketNumber.startsWith('TKT-'),
        'Ticket data includes valid ticket number',
        `Number: ${ticketData.ticketNumber}`
    );
    
    printResult(
        ticketData.bookingId === booking.id,
        'Ticket data includes booking ID',
        `Booking ID linked`
    );
    
    printResult(
        ticketData.passengerId === passenger.id,
        'Ticket data includes passenger ID',
        `Passenger ID linked`
    );
    
    printResult(
        ticketData.qrCode && ticketData.qrCode.length > 0,
        'Ticket data includes QR code',
        `QR Code length: ${ticketData.qrCode.length} chars`
    );
    
    printResult(
        ticketData.barcode && ticketData.barcode.length > 0,
        'Ticket data includes barcode',
        `Barcode: ${ticketData.barcode}`
    );
    
    printResult(
        ticketData.validUntil !== null,
        'Ticket data includes validity period',
        `Valid Until: ${ticketData.validUntil}`
    );
    
    printResult(
        ticketData.boardingGate === flight.gate,
        'Ticket data includes boarding gate',
        `Gate: ${ticketData.boardingGate}`
    );
} catch (error) {
    printResult(false, 'Complete ticket data creation', `Error: ${error.message}`);
}

// Test 6: Format Ticket Response
printSection('6️⃣  TICKET RESPONSE FORMATTING');

try {
    const ticket = {
        ticket_number: 'TKT-20241007-12345',
        issue_date: new Date().toISOString(),
        valid_until: new Date(Date.now() + 86400000).toISOString(),
        ticket_status: 'valid',
        qr_code: '{"ticketNumber":"TKT-20241007-12345"}',
        barcode: 'TKT-20241007-12345|BK12345678',
        checked_in: false,
        check_in_time: null,
        boarding_gate: 'A12'
    };
    
    const booking = {
        booking_reference: 'BK12345678',
        seat_class: 'economy',
        total_amount: 450.00,
        payment_status: 'completed',
        booking_status: 'confirmed'
    };
    
    const passenger = {
        first_name: 'John',
        last_name: 'Doe',
        date_of_birth: '1990-01-15',
        passport_number: 'AB123456',
        nationality: 'United States',
        seat_number: '12A',
        meal_preference: 'vegetarian'
    };
    
    const flight = {
        flight_number: 'AA101',
        airline_name: 'American Airlines',
        aircraft_type: 'Boeing 737-800',
        departure_airport: 'NYC',
        arrival_airport: 'LAX',
        departure_date: '2024-01-20',
        departure_time: '08:30:00',
        arrival_date: '2024-01-20',
        arrival_time: '11:45:00',
        gate: 'A12',
        terminal: 'Terminal 1'
    };
    
    const formatted = ticketGenerator.formatTicketResponse(ticket, booking, passenger, flight);
    
    printResult(
        formatted.ticketNumber === ticket.ticket_number,
        'Formatted response includes ticket number',
        `Ticket: ${formatted.ticketNumber}`
    );
    
    printResult(
        formatted.passenger && formatted.passenger.firstName === 'John',
        'Formatted response includes passenger details',
        `Passenger: ${formatted.passenger.firstName} ${formatted.passenger.lastName}`
    );
    
    printResult(
        formatted.flight && formatted.flight.flightNumber === 'AA101',
        'Formatted response includes flight details',
        `Flight: ${formatted.flight.flightNumber}`
    );
    
    printResult(
        formatted.ticketDetails && formatted.ticketDetails.status === 'valid',
        'Formatted response includes ticket status',
        `Status: ${formatted.ticketDetails.status}`
    );
    
    printResult(
        formatted.booking && formatted.booking.totalAmount === 450.00,
        'Formatted response includes booking details',
        `Amount: $${formatted.booking.totalAmount}`
    );
} catch (error) {
    printResult(false, 'Ticket response formatting', `Error: ${error.message}`);
}

// Test 7: Database Schema Validation
printSection('7️⃣  DATABASE SCHEMA VERIFICATION');

const fs = require('fs');
const path = require('path');

try {
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    printResult(
        schema.includes('CREATE TABLE tickets'),
        'Tickets table defined in schema',
        'Table definition found'
    );
    
    const requiredFields = [
        'ticket_number',
        'booking_id',
        'passenger_id',
        'qr_code',
        'barcode',
        'ticket_status',
        'issue_date',
        'valid_until',
        'checked_in',
        'check_in_time'
    ];
    
    let allFieldsPresent = true;
    let missingFields = [];
    
    requiredFields.forEach(field => {
        if (!schema.includes(field)) {
            allFieldsPresent = false;
            missingFields.push(field);
        }
    });
    
    printResult(
        allFieldsPresent,
        'All required fields in tickets table',
        allFieldsPresent ? 'All fields present' : `Missing: ${missingFields.join(', ')}`
    );
    
    printResult(
        schema.includes('generate_ticket_number'),
        'Ticket number generation function exists',
        'Database function defined'
    );
    
    printResult(
        schema.includes('CREATE INDEX idx_tickets_ticket_number'),
        'Ticket number index created',
        'Performance optimization present'
    );
} catch (error) {
    printResult(false, 'Schema verification', `Error: ${error.message}`);
}

// Test 8: Routes Configuration
printSection('8️⃣  API ROUTES VERIFICATION');

try {
    const routesPath = path.join(__dirname, '../src/routes/tickets.js');
    const routes = fs.readFileSync(routesPath, 'utf8');
    
    printResult(
        routes.includes('router.get'),
        'GET routes defined',
        'Ticket retrieval endpoints exist'
    );
    
    printResult(
        routes.includes('/my-tickets'),
        'Customer tickets endpoint exists',
        'GET /my-tickets route found'
    );
    
    printResult(
        routes.includes('/booking/:bookingId'),
        'Booking tickets endpoint exists',
        'GET /booking/:bookingId route found'
    );
    
    printResult(
        routes.includes('/:ticketNumber/check-in'),
        'Check-in endpoint exists',
        'POST /:ticketNumber/check-in route found'
    );
    
    printResult(
        routes.includes('authenticate'),
        'Authentication middleware applied',
        'Routes protected with auth'
    );
} catch (error) {
    printResult(false, 'Routes verification', `Error: ${error.message}`);
}

// Test 9: Controller Functions
printSection('9️⃣  CONTROLLER FUNCTIONS VERIFICATION');

try {
    const controllerPath = path.join(__dirname, '../src/controllers/ticketController.js');
    const controller = fs.readFileSync(controllerPath, 'utf8');
    
    const requiredFunctions = [
        'getTicketByNumber',
        'getTicketsByBooking',
        'getMyTickets',
        'checkInTicket',
        'cancelTicket'
    ];
    
    requiredFunctions.forEach(func => {
        const exists = controller.includes(func);
        printResult(
            exists,
            `${func} function defined`,
            exists ? 'Function implemented' : 'Function missing'
        );
    });
} catch (error) {
    printResult(false, 'Controller verification', `Error: ${error.message}`);
}

// Test 10: Booking Controller Integration
printSection('🔟 BOOKING CONTROLLER INTEGRATION');

try {
    const bookingControllerPath = path.join(__dirname, '../src/controllers/bookingController.js');
    const bookingController = fs.readFileSync(bookingControllerPath, 'utf8');
    
    printResult(
        bookingController.includes('ticketGenerator'),
        'Ticket generator imported in booking controller',
        'Integration setup correct'
    );
    
    printResult(
        bookingController.includes('createTicketData'),
        'Ticket creation called in booking flow',
        'Auto-generation implemented'
    );
    
    printResult(
        bookingController.includes('INSERT INTO tickets'),
        'Ticket database insertion in booking',
        'Tickets saved after booking'
    );
} catch (error) {
    printResult(false, 'Booking integration verification', `Error: ${error.message}`);
}

// Final Summary
printSection('📊 TEST SUMMARY');

const totalTests = testsPassed + testsFailed;
const successRate = totalTests > 0 ? Math.round((testsPassed / totalTests) * 100) : 0;

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║                    FINAL RESULTS                           ║');
console.log('╠════════════════════════════════════════════════════════════╣');
console.log(`║  Total Tests:        ${totalTests}                         ║`);
console.log(`║  Passed:             ${testsPassed} ✅                     ║`);
console.log(`║  Failed:             ${testsFailed} ❌                     ║`);
console.log(`║  Success Rate:       ${successRate}%                       ║`);
console.log('╚════════════════════════════════════════════════════════════╝\n');

if (testsFailed === 0) {
    console.log('🎉 All tests passed! E-Ticket system is ready for deployment!');
    process.exit(0);
} else {
    console.log('⚠️  Some tests failed. Please review the implementation.');
    process.exit(1);
}
