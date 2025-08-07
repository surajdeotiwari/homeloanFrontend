// Test script to start the HTTP server and show configuration
console.log('🚀 Starting HTTP Server with Eureka Integration...\n');

console.log('📋 Server Configuration:');
console.log('- Frontend Server: http://localhost:5000');
console.log('- Eureka Server: http://localhost:8080');
console.log('- Static Files: index.html, dashboard.html, admin.html, etc.');
console.log('- API Proxy: All /api/* requests forwarded to Eureka microservices\n');

console.log('🔗 Microservice Mapping:');
console.log('- /api/user/* → USER-SERVICE');
console.log('- /api/admin/* → ADMIN-SERVICE');
console.log('- /api/loan/* → LOAN-APPLICATION-SERVICE');
console.log('- /api/property/* → PROPERTY-SERVICE');
console.log('- /api/income/* → INCOME-DETAIL-SERVICE');
console.log('- /application/* → TRACKER-SERVICE');
console.log('- /api/homeloan/* → HOME-LOAN-SERVICE\n');

console.log('⚠️  Make sure your Eureka server is running on localhost:8080 before testing APIs\n');

// Import and start the actual server
require('./http-server.js');
