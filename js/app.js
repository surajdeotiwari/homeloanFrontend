// Main Application Entry Point

// Import all modules
import './modules/config.js';
import './modules/utils.js';
import './modules/apiService.js';
import './modules/auth.js';
import './modules/navigation.js';
import './modules/dashboard.js';
import './modules/loanApplication.js';
import './modules/loanTracker.js';
import './modules/emiCalculator.js';
import './modules/admin.js';
import { initializeEventListeners } from './modules/eventHandlers.js';
import { updateDebugInfo } from './modules/navigation.js';

// Initialize the application
console.log('🚀 Main application loading...');

// Initialize when page loads (only in browser environment)
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', function() {
        console.log('DOM loaded, initializing application...');
        
        // Initialize event listeners
        initializeEventListeners();
        
        // Test navigation
        const navLinks = document.querySelectorAll('.nav-link');
        console.log('Found navigation links:', navLinks.length);
        
        navLinks.forEach((link, index) => {
            console.log(`Nav link ${index}:`, link.textContent, link.onclick);
        });
        
        // Test if pages exist
        const pages = document.querySelectorAll('.page');
        console.log('Found pages:', pages.length);
        pages.forEach((page, index) => {
            console.log(`Page ${index}:`, page.id, page.classList.contains('active'));
        });
        
        // Update debug panel
        updateDebugInfo();
        
        console.log('✅ Application initialized successfully!');
    });
} else {
    console.log('📋 Running in Node.js environment - DOM initialization skipped');
}

console.log('📦 All modules loaded successfully!');
