#!/bin/bash

echo "🔍 Testing Frontend-Backend Connection..."
echo "============================================"

# Test 1: Check if backend is running
echo "1. Checking if backend is running on http://localhost:3000..."
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "   ✅ Backend is running"
else
    echo "   ❌ Backend is not running on port 3000"
    echo "   💡 Start backend with: cd airline-management-backend && npm run dev"
fi

# Test 2: Test API endpoint
echo ""
echo "2. Testing API health endpoint..."
response=$(curl -s -w "%{http_code}" http://localhost:3000/api/v1/health -o /tmp/api_response.txt 2>/dev/null)
if [ "$response" = "200" ]; then
    echo "   ✅ API is responding (HTTP 200)"
    echo "   📄 Response: $(cat /tmp/api_response.txt)"
else
    echo "   ❌ API not responding (HTTP $response)"
fi

# Test 3: Test login endpoint with demo credentials
echo ""
echo "3. Testing login endpoint with demo credentials..."
login_response=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"superadmin@airportal.com","password":"Password123!"}' \
    -w "%{http_code}" -o /tmp/login_response.txt 2>/dev/null)

if [ "$login_response" = "200" ]; then
    echo "   ✅ Login endpoint working (HTTP 200)"
    echo "   📄 Login Response: $(cat /tmp/login_response.txt)"
else
    echo "   ❌ Login failed (HTTP $login_response)"
    echo "   📄 Error Response: $(cat /tmp/login_response.txt)"
fi

# Test 4: Check frontend environment
echo ""
echo "4. Checking frontend environment..."
if [ -f "/home/naresh/Desktop/CLG/SEM-5/PROJECT/DBMS/DBMS/airline-frontend/.env" ]; then
    echo "   ✅ Frontend .env file exists"
    echo "   📄 Contents:"
    cat /home/naresh/Desktop/CLG/SEM-5/PROJECT/DBMS/DBMS/airline-frontend/.env | sed 's/^/      /'
else
    echo "   ❌ Frontend .env file missing"
fi

echo ""
echo "🔧 TROUBLESHOOTING STEPS:"
echo "========================="
echo "1. Make sure backend is running:"
echo "   cd airline-management-backend && npm run dev"
echo ""
echo "2. Make sure database is seeded:"
echo "   cd airline-management-backend && node database/seed-final.js"
echo ""
echo "3. Demo credentials to test:"
echo "   Email: superadmin@airportal.com"
echo "   Password: Password123!"
echo ""
echo "4. Frontend should redirect to appropriate portal after login"

# Cleanup
rm -f /tmp/api_response.txt /tmp/login_response.txt