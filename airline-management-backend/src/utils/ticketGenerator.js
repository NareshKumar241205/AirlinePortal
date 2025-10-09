const crypto = require('crypto');

/**
 * Generate a unique ticket number
 * Format: TKT-YYYYMMDD-XXXXX
 */
function generateTicketNumber() {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `TKT-${date}-${random}`;
}

/**
 * Generate QR code data for a ticket
 * This will contain essential ticket information that can be scanned at the airport
 */
function generateQRCodeData(ticketInfo) {
    const data = {
        ticketNumber: ticketInfo.ticketNumber,
        bookingReference: ticketInfo.bookingReference,
        passengerName: `${ticketInfo.firstName} ${ticketInfo.lastName}`,
        flightNumber: ticketInfo.flightNumber,
        departureAirport: ticketInfo.departureAirport,
        arrivalAirport: ticketInfo.arrivalAirport,
        departureDate: ticketInfo.departureDate,
        departureTime: ticketInfo.departureTime,
        seatClass: ticketInfo.seatClass,
        seatNumber: ticketInfo.seatNumber || 'TBA'
    };
    
    // Convert to JSON string for QR code
    return JSON.stringify(data);
}

/**
 * Generate barcode data for a ticket
 * This creates a simple barcode-compatible string
 */
function generateBarcodeData(ticketNumber, bookingReference) {
    return `${ticketNumber}|${bookingReference}`;
}

/**
 * Calculate ticket validity period
 * Tickets are valid until 2 hours after flight departure
 */
function calculateValidUntil(departureDate, departureTime) {
    // Combine date and time
    const departureDateTimeStr = `${departureDate}T${departureTime}`;
    const departureDateTime = new Date(departureDateTimeStr);
    
    // Add 2 hours buffer
    const validUntil = new Date(departureDateTime.getTime() + (2 * 60 * 60 * 1000));
    
    return validUntil;
}

/**
 * Create ticket data object for database insertion
 */
function createTicketData(bookingInfo, passenger, flight) {
    const ticketNumber = generateTicketNumber();
    const bookingReference = bookingInfo.booking_reference;
    
    const ticketInfo = {
        ticketNumber,
        bookingReference,
        firstName: passenger.first_name,
        lastName: passenger.last_name,
        flightNumber: flight.flight_number,
        departureAirport: flight.departure_airport,
        arrivalAirport: flight.arrival_airport,
        departureDate: flight.departure_date,
        departureTime: flight.departure_time,
        seatClass: bookingInfo.seat_class,
        seatNumber: passenger.seat_number
    };
    
    const qrCode = generateQRCodeData(ticketInfo);
    const barcode = generateBarcodeData(ticketNumber, bookingReference);
    const validUntil = calculateValidUntil(flight.departure_date, flight.departure_time);
    
    return {
        ticketNumber,
        bookingId: bookingInfo.id,
        passengerId: passenger.id,
        qrCode,
        barcode,
        validUntil,
        boardingGate: flight.gate,
        boardingTime: flight.departure_time
    };
}

/**
 * Format ticket data for API response
 */
function formatTicketResponse(ticket, booking, passenger, flight) {
    return {
        ticketNumber: ticket.ticket_number,
        bookingReference: booking.booking_reference,
        passenger: {
            firstName: passenger.first_name,
            lastName: passenger.last_name,
            dateOfBirth: passenger.date_of_birth,
            passportNumber: passenger.passport_number,
            nationality: passenger.nationality,
            seatNumber: passenger.seat_number,
            mealPreference: passenger.meal_preference
        },
        flight: {
            flightNumber: flight.flight_number,
            airlineName: flight.airline_name,
            aircraftType: flight.aircraft_type,
            departureAirport: flight.departure_airport,
            arrivalAirport: flight.arrival_airport,
            departureDate: flight.departure_date,
            departureTime: flight.departure_time,
            arrivalDate: flight.arrival_date,
            arrivalTime: flight.arrival_time,
            gate: ticket.boarding_gate || flight.gate,
            terminal: flight.terminal,
            seatClass: booking.seat_class
        },
        ticketDetails: {
            issueDate: ticket.issue_date,
            validUntil: ticket.valid_until,
            status: ticket.ticket_status,
            qrCode: ticket.qr_code,
            barcode: ticket.barcode,
            checkedIn: ticket.checked_in,
            checkInTime: ticket.check_in_time
        },
        booking: {
            totalAmount: booking.total_amount,
            paymentStatus: booking.payment_status,
            bookingStatus: booking.booking_status
        }
    };
}

module.exports = {
    generateTicketNumber,
    generateQRCodeData,
    generateBarcodeData,
    calculateValidUntil,
    createTicketData,
    formatTicketResponse
};
