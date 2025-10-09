-- Multi-Airline Management Portal Database Schema
-- PostgreSQL Database Design with proper relationships and constraints

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables (for fresh setup)
DROP TABLE IF EXISTS booking_passengers CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS flight_crew_assignments CASCADE;
DROP TABLE IF EXISTS flights CASCADE;
DROP TABLE IF EXISTS crew_members CASCADE;
DROP TABLE IF EXISTS airlines CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- Create Roles table
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    role_id INTEGER NOT NULL REFERENCES roles(id),
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Airlines table
CREATE TABLE airlines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE, -- IATA code
    country VARCHAR(100) NOT NULL,
    headquarters_address TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    website_url VARCHAR(255),
    logo_url VARCHAR(500),
    description TEXT,
    admin_user_id UUID NOT NULL REFERENCES users(id),
    is_approved BOOLEAN DEFAULT false,
    approval_status VARCHAR(20) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Crew Members table
CREATE TABLE crew_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    airline_id UUID NOT NULL REFERENCES airlines(id),
    employee_id VARCHAR(50) NOT NULL,
    position VARCHAR(100) NOT NULL, -- Pilot, Co-pilot, Flight Attendant, etc.
    license_number VARCHAR(100),
    experience_years INTEGER DEFAULT 0,
    qualifications TEXT[],
    base_location VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    hire_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(airline_id, employee_id)
);

-- Create Flights table
CREATE TABLE flights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    airline_id UUID NOT NULL REFERENCES airlines(id),
    flight_number VARCHAR(20) NOT NULL,
    aircraft_type VARCHAR(100),
    departure_airport VARCHAR(10) NOT NULL, -- IATA airport code
    arrival_airport VARCHAR(10) NOT NULL,   -- IATA airport code
    departure_date DATE NOT NULL,
    departure_time TIME NOT NULL,
    arrival_date DATE NOT NULL,
    arrival_time TIME NOT NULL,
    estimated_duration INTERVAL,
    actual_departure_time TIMESTAMP WITH TIME ZONE,
    actual_arrival_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'boarding', 'departed', 'in-flight', 'landed', 'cancelled', 'delayed')),
    total_seats INTEGER NOT NULL,
    available_seats INTEGER,
    economy_seats INTEGER DEFAULT 0,
    business_seats INTEGER DEFAULT 0,
    first_class_seats INTEGER DEFAULT 0,
    economy_price DECIMAL(10, 2),
    business_price DECIMAL(10, 2),
    first_class_price DECIMAL(10, 2),
    baggage_allowance INTEGER DEFAULT 23, -- kg
    gate VARCHAR(10),
    terminal VARCHAR(10),
    delay_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(airline_id, flight_number, departure_date)
);

-- Create Flight Crew Assignments table
CREATE TABLE flight_crew_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flight_id UUID NOT NULL REFERENCES flights(id) ON DELETE CASCADE,
    crew_member_id UUID NOT NULL REFERENCES crew_members(id),
    role VARCHAR(50) NOT NULL, -- Captain, First Officer, Flight Attendant, etc.
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID REFERENCES users(id),
    UNIQUE(flight_id, crew_member_id)
);

-- Create Bookings table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_reference VARCHAR(10) NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES users(id),
    flight_id UUID NOT NULL REFERENCES flights(id),
    seat_class VARCHAR(20) NOT NULL CHECK (seat_class IN ('economy', 'business', 'first_class')),
    seat_number VARCHAR(10),
    number_of_passengers INTEGER NOT NULL DEFAULT 1,
    total_amount DECIMAL(10, 2) NOT NULL,
    booking_status VARCHAR(20) DEFAULT 'confirmed' CHECK (booking_status IN ('pending', 'confirmed', 'cancelled', 'refunded')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_method VARCHAR(50),
    special_requests TEXT,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    refund_amount DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Booking Passengers table (for multiple passengers per booking)
CREATE TABLE booking_passengers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    passport_number VARCHAR(50),
    nationality VARCHAR(100),
    seat_number VARCHAR(10),
    meal_preference VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Tickets table (e-tickets for passengers)
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_number VARCHAR(20) NOT NULL UNIQUE,
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    passenger_id UUID NOT NULL REFERENCES booking_passengers(id) ON DELETE CASCADE,
    qr_code TEXT,
    barcode TEXT,
    ticket_status VARCHAR(20) DEFAULT 'valid' CHECK (ticket_status IN ('valid', 'used', 'cancelled', 'expired')),
    issue_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP WITH TIME ZONE,
    checked_in BOOLEAN DEFAULT false,
    check_in_time TIMESTAMP WITH TIME ZONE,
    boarding_gate VARCHAR(10),
    boarding_time TIME,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_airlines_code ON airlines(code);
CREATE INDEX idx_airlines_approval_status ON airlines(approval_status);
CREATE INDEX idx_crew_members_user_id ON crew_members(user_id);
CREATE INDEX idx_crew_members_airline_id ON crew_members(airline_id);
CREATE INDEX idx_flights_airline_id ON flights(airline_id);
CREATE INDEX idx_flights_departure_date ON flights(departure_date);
CREATE INDEX idx_flights_departure_airport ON flights(departure_airport);
CREATE INDEX idx_flights_arrival_airport ON flights(arrival_airport);
CREATE INDEX idx_flights_status ON flights(status);
CREATE INDEX idx_flight_crew_assignments_flight_id ON flight_crew_assignments(flight_id);
CREATE INDEX idx_flight_crew_assignments_crew_member_id ON flight_crew_assignments(crew_member_id);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_flight_id ON bookings(flight_id);
CREATE INDEX idx_bookings_booking_reference ON bookings(booking_reference);
CREATE INDEX idx_bookings_booking_status ON bookings(booking_status);
CREATE INDEX idx_booking_passengers_booking_id ON booking_passengers(booking_id);
CREATE INDEX idx_tickets_booking_id ON tickets(booking_id);
CREATE INDEX idx_tickets_passenger_id ON tickets(passenger_id);
CREATE INDEX idx_tickets_ticket_number ON tickets(ticket_number);
CREATE INDEX idx_tickets_ticket_status ON tickets(ticket_status);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_airlines_updated_at BEFORE UPDATE ON airlines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_crew_members_updated_at BEFORE UPDATE ON crew_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_flights_updated_at BEFORE UPDATE ON flights FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update available seats when booking is made
CREATE OR REPLACE FUNCTION update_available_seats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.booking_status = 'confirmed' THEN
        UPDATE flights 
        SET available_seats = available_seats - NEW.number_of_passengers
        WHERE id = NEW.flight_id;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.booking_status = 'confirmed' AND NEW.booking_status = 'cancelled' THEN
            UPDATE flights 
            SET available_seats = available_seats + OLD.number_of_passengers
            WHERE id = OLD.flight_id;
        ELSIF OLD.booking_status = 'cancelled' AND NEW.booking_status = 'confirmed' THEN
            UPDATE flights 
            SET available_seats = available_seats - NEW.number_of_passengers
            WHERE id = NEW.flight_id;
        END IF;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Create trigger for seat availability updates
CREATE TRIGGER update_available_seats_trigger
    AFTER INSERT OR UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_available_seats();

-- Function to generate booking reference
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.booking_reference IS NULL OR NEW.booking_reference = '' THEN
        NEW.booking_reference := 'BK' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for booking reference generation
CREATE TRIGGER generate_booking_reference_trigger
    BEFORE INSERT ON bookings
    FOR EACH ROW EXECUTE FUNCTION generate_booking_reference();

-- Function to generate ticket number
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.ticket_number IS NULL OR NEW.ticket_number = '' THEN
        NEW.ticket_number := 'TKT' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0');
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for ticket number generation
CREATE TRIGGER generate_ticket_number_trigger
    BEFORE INSERT ON tickets
    FOR EACH ROW EXECUTE FUNCTION generate_ticket_number();

-- Insert initial roles
INSERT INTO roles (name, description, permissions) VALUES 
('super_admin', 'System administrator with full access', '{"all": true}'),
('airline_admin', 'Airline administrator can manage their airline operations', '{"flights": ["create", "read", "update", "delete"], "crew": ["create", "read", "update", "delete"], "bookings": ["read"]}'),
('crew_member', 'Airline crew member with limited access', '{"flights": ["read"], "schedules": ["read"]}'),
('customer', 'Regular customer who can book flights', '{"bookings": ["create", "read", "update"], "flights": ["read"]}');

-- Insert default Super Admin user (password: admin123)
INSERT INTO users (email, password_hash, first_name, last_name, role_id, is_active, is_verified) 
VALUES ('admin@airline-portal.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj58rAsPvCae', 'System', 'Administrator', 1, true, true);