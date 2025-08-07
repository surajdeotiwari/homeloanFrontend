// Simple HTTP Server for Loan Management System
// Run with: node server.js
// Access at: http://localhost:5000
// Connects to Eureka Server at: http://localhost:8080

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;
const EUREKA_SERVER = 'http://localhost:8080';

// MIME types for different file extensions
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

// Mock API data for testing
const mockData = {
    users: [
        { id: 1, email: 'user@example.com', password: 'password', type: 'user', firstName: 'John', lastName: 'Doe' },
        { id: 2, email: 'admin@example.com', password: 'admin', type: 'admin', firstName: 'Admin', lastName: 'User' }
    ],
    applications: [
        {
            applicationId: 'APP001',
            amountRequested: 500000,
            monthlyIncome: 50000,
            status: 'PENDING',
            createdDate: '2025-01-15',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            loanPurpose: 'Home Purchase'
        },
        {
            applicationId: 'APP002',
            amountRequested: 750000,
            monthlyIncome: 75000,
            status: 'APPROVED',
            createdDate: '2025-01-10',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane@example.com',
            loanPurpose: 'Home Construction'
        },
        {
            applicationId: 'APP003',
            amountRequested: 300000,
            monthlyIncome: 30000,
            status: 'REJECTED',
            createdDate: '2025-01-05',
            firstName: 'Bob',
            lastName: 'Johnson',
            email: 'bob@example.com',
            loanPurpose: 'Home Renovation'
        }
    ]
};

function serveFile(req, res, filePath) {
    const extname = path.extname(filePath);
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - File Not Found</h1>');
            } else {
                res.writeHead(500);
                res.end('Server Error: ' + err.code);
            }
        } else {
            res.writeHead(200, { 
                'Content-Type': contentType,
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            });
            res.end(content, 'utf-8');
        }
    });
}

// Proxy function to forward requests to Eureka Server
function proxyToEureka(req, res, targetPath) {
    const eurekaUrl = new URL(targetPath);
    
    console.log(`🔗 Proxying to Eureka: ${req.method} ${targetPath}`);
    
    const options = {
        hostname: eurekaUrl.hostname,
        port: eurekaUrl.port || (eurekaUrl.protocol === 'https:' ? 443 : 80),
        path: eurekaUrl.pathname + (eurekaUrl.search || ''),
        method: req.method,
        headers: {
            ...req.headers,
            'Host': eurekaUrl.host
        }
    };

    // Remove host header to avoid conflicts
    delete options.headers.host;
    
    const protocol = eurekaUrl.protocol === 'https:' ? https : http;
    
    const proxyReq = protocol.request(options, (proxyRes) => {
        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        
        // Copy response headers
        Object.keys(proxyRes.headers).forEach(key => {
            res.setHeader(key, proxyRes.headers[key]);
        });
        
        res.writeHead(proxyRes.statusCode);
        proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
        console.error('❌ Proxy error:', err.message);
        res.writeHead(500, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({ 
            success: false, 
            message: 'Service unavailable - Unable to connect to microservice',
            error: err.message 
        }));
    });

    // Forward request body if present
    if (req.method === 'POST' || req.method === 'PUT') {
        req.pipe(proxyReq);
    } else {
        proxyReq.end();
    }
}

function handleAPIRequest(req, res, pathname) {
    // Enable CORS for all API requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    console.log(`🔗 API Request: ${req.method} ${pathname}`);

    // Simple direct routing - just pass the path as-is to Eureka
    // No transformations, no replacements, just direct proxy
    const targetUrl = `${EUREKA_SERVER}${pathname}`;
    
    console.log(`🎯 Direct routing ${pathname} → ${targetUrl}`);
    
    // Proxy the request directly to Eureka
    proxyToEureka(req, res, targetUrl);
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url);
    const pathname = parsedUrl.pathname;

    console.log(`📡 ${req.method} ${pathname}`);

    // Handle API requests
    if (pathname.startsWith('/api/') || pathname.startsWith('/application/')) {
        handleAPIRequest(req, res, pathname);
        return;
    }

    // Serve static files
    let filePath = pathname === '/' ? './index.html' : `.${pathname}`;
    
    // Security check - prevent directory traversal
    if (filePath.includes('..')) {
        res.writeHead(400);
        res.end('Invalid path');
        return;
    }

    serveFile(req, res, filePath);
});

server.listen(PORT, () => {
    console.log('🚀 Loan Management System Server Started!');
    console.log(`📡 Server running at http://localhost:${PORT}/`);
    console.log(`🔗 Eureka Server: ${EUREKA_SERVER}`);
    console.log(`🌐 Open http://localhost:${PORT} in your browser to test the application`);
    console.log('');
    console.log('🔄 Simple Direct Proxy:');
    console.log('   Frontend Request → Direct to Eureka (No Path Changes)');
    console.log('   • /api/application/status/1 → http://localhost:8080/api/application/status/1');
    console.log('   • /api/user/login → http://localhost:8080/api/user/login');
    console.log('   • /application/metrics → http://localhost:8080/application/metrics');
    console.log('   • Any path → http://localhost:8080{same-path}');
    console.log('');
    console.log('📊 Mock data loaded:');
    console.log(`   • ${mockData.users.length} test users (user@example.com/password, admin@example.com/admin)`);
    console.log(`   • ${mockData.applications.length} sample loan applications`);
    console.log('');
    console.log('✨ Ready for testing!');
    console.log('⚠️  Ensure your Eureka server is running on localhost:8080');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    server.close(() => {
        console.log('✅ Server closed gracefully');
        process.exit(0);
    });
});

module.exports = server;
