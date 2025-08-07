// API Configuration and Global State Management

// API Configuration - Updated with Eureka Server endpoints
export const API_CONFIG = {
    // Using Eureka Server on localhost:8080
    BASE_URL: 'http://localhost:8080',  
    USER_SERVICE: 'http://localhost:8080',  
    ADMIN_SERVICE: 'http://localhost:8080',  
    LOAN_APPLICATION_SERVICE: 'http://localhost:8080',  
    PROPERTY_SERVICE: 'http://localhost:8080',  
    HOME_LOAN_SERVICE: 'http://localhost:8080',  
    INCOME_DETAIL_SERVICE: 'http://localhost:8080',  
    TRACKER_SERVICE: 'http://localhost:8080',  
    LOAN_ACCOUNT_SERVICE: 'http://localhost:8080',  
    HOMELOAN_NEW_SERVICE: 'http://localhost:8080',  
    API_GATEWAY: 'http://localhost:8080'
};

// Global State
export let currentUser = null;
export let isAdmin = false;

// State management functions
export function setCurrentUser(user) {
    currentUser = user;
}

export function setAdminStatus(status) {
    isAdmin = status;
}

export function getCurrentUser() {
    return currentUser;
}

export function getAdminStatus() {
    return isAdmin;
}

// Debug: Log when script loads
console.log('Config module loaded successfully!');
