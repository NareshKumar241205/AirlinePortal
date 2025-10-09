#!/bin/bash

# Multi-Airline Management Portal - Quick Setup Script
# This script helps you set up the backend API quickly

echo "🚀 Multi-Airline Management Portal - Backend Setup"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Node.js is installed
check_node() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_status "Node.js is installed: $NODE_VERSION"
        
        # Check if version is 16 or higher
        MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        if [ "$MAJOR_VERSION" -ge 16 ]; then
            print_status "Node.js version is compatible"
        else
            print_warning "Node.js version should be 16 or higher. Current: $NODE_VERSION"
        fi
    else
        print_error "Node.js is not installed. Please install Node.js 16+ from https://nodejs.org/"
        exit 1
    fi
}

# Check if npm is installed
check_npm() {
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_status "npm is installed: v$NPM_VERSION"
    else
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
}

# Install dependencies
install_dependencies() {
    print_info "Installing project dependencies..."
    if npm install; then
        print_status "Dependencies installed successfully"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
}

# Setup environment file
setup_env() {
    if [ ! -f .env ]; then
        print_info "Creating environment configuration file..."
        cp .env.example .env
        print_warning "Please update the .env file with your database credentials and JWT secrets"
        print_info "Required configuration:"
        echo "  - DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD (Aiven PostgreSQL)"
        echo "  - JWT_SECRET, JWT_REFRESH_SECRET (Generate strong secrets)"
    else
        print_status "Environment file already exists"
    fi
}

# Create logs directory
setup_logs() {
    if [ ! -d "logs" ]; then
        mkdir -p logs
        print_status "Created logs directory"
    else
        print_status "Logs directory already exists"
    fi
}

# Display next steps
show_next_steps() {
    echo ""
    echo "🎉 Setup completed successfully!"
    echo "================================="
    echo ""
    print_info "Next steps:"
    echo "1. Update your .env file with actual database credentials"
    echo "2. Run database migrations: npm run db:migrate"
    echo "3. Seed sample data (optional): npm run db:seed"
    echo "4. Start the development server: npm run dev"
    echo ""
    print_info "Available scripts:"
    echo "  npm run dev        - Start development server with auto-reload"
    echo "  npm start          - Start production server"
    echo "  npm run db:migrate - Run database migrations"
    echo "  npm run db:seed    - Seed sample data"
    echo "  npm test           - Run tests"
    echo ""
    print_info "API will be available at: http://localhost:3000"
    echo "API documentation: http://localhost:3000/"
    echo ""
    print_info "Test credentials (after seeding):"
    echo "  Super Admin: admin@airline-portal.com / admin123"
    echo "  Customer: john.doe@email.com / customer123"
    echo "  Airline Admin: admin1@skyways.com / admin123"
    echo ""
    print_warning "Remember to:"
    echo "  - Set strong JWT secrets in production"
    echo "  - Use SSL/TLS for database connections"
    echo "  - Configure proper CORS settings"
    echo "  - Set up monitoring and logging"
}

# Main setup process
main() {
    echo ""
    print_info "Starting setup process..."
    echo ""
    
    check_node
    check_npm
    echo ""
    
    install_dependencies
    echo ""
    
    setup_env
    setup_logs
    echo ""
    
    show_next_steps
}

# Run main function
main