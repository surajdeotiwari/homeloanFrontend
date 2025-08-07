// API Service Module

import { showToast } from './utils.js';

// Enhanced API call function with better error handling
export async function makeAPICall(endpoint, options = {}) {
    const defaultOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        credentials: 'same-origin'  // Same origin since using proxy
    };

    const finalOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...(options.headers || {})
        }
    };

    try {
        console.log(`🌐 Making API call to: ${endpoint}`);
        console.log(`📊 Options:`, finalOptions);
        
        const response = await fetch(endpoint, finalOptions);
        
        console.log(`📈 Response status: ${response.status}`);
        console.log(`📈 Response headers:`, response.headers);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            console.log(`✅ API call successful:`, data);
            return data;
        } else {
            const text = await response.text();
            console.log(`✅ API call successful (text):`, text);
            return text;
        }
    } catch (error) {
        console.error(`❌ API call failed:`, error);
        
        // Handle specific CORS errors
        if (error.message.includes('CORS') || error.name === 'TypeError' && error.message.includes('fetch')) {
            showToast('CORS Error: Please ensure the backend services are running and accessible.', 'error');
        } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
            showToast('Network Error: Cannot connect to backend services. Please check if they are running.', 'error');
        } else {
            showToast(`API Error: ${error.message}`, 'error');
        }
        
        throw error;
    }
}

// Add connection status indicator
export function checkBackendStatus() {
    const API_CONFIG = {
        USER_SERVICE: '/api',
        ADMIN_SERVICE: '',
        LOAN_APPLICATION_SERVICE: '/api'
    };

    const services = [
        { name: 'UserService', url: `${API_CONFIG.USER_SERVICE}/users/test` },
        { name: 'AdminService', url: `${API_CONFIG.ADMIN_SERVICE}/admin/test` },
        { name: 'LoanApplication-Service', url: `${API_CONFIG.LOAN_APPLICATION_SERVICE}/loans` }
    ];
    
    services.forEach(async (service) => {
        try {
            const response = await fetch(service.url, { method: 'GET' });
            console.log(`✅ ${service.name}: Connected`);
        } catch (error) {
            console.log(`❌ ${service.name}: Disconnected`);
        }
    });
}
