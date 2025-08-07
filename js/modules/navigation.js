// Navigation Module

import { getCurrentUser } from './config.js';
import { loadDashboardData } from './dashboard.js';
import { loadAdminData } from './admin.js';
import { prefillUserData } from './auth.js';
import { initializeEMICalculator } from './emiCalculator.js';

// Navigation Functions
export function showPage(pageId) {
    console.log('Showing page:', pageId); // Debug log
    
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const targetPage = document.getElementById(pageId + '-page');
    if (targetPage) {
        targetPage.classList.add('active');
        console.log('Page activated:', pageId); // Debug log
    } else {
        console.error('Page not found:', pageId + '-page'); // Debug log
    }
    
    // Load page-specific data
    switch(pageId) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'admin-panel':
            loadAdminData();
            break;
        case 'loan-application':
            // Prefill user data for loan application
            const currentUser = getCurrentUser();
            if (currentUser) {
                prefillUserData();
            }
            break;
        case 'loan-tracker':
            // Auto-fill if user is logged in
            const user = getCurrentUser();
            if (user) {
                const searchType = document.getElementById('search-type');
                const searchValue = document.getElementById('search-value');
                if (searchType) searchType.value = 'customer';
                if (searchValue) searchValue.value = user.userId;
            }
            break;
        case 'emi-calculator':
            // Initialize EMI calculator with default values
            initializeEMICalculator();
            break;
    }
}

// Debug functions
export function updateDebugInfo() {
    const debugPanel = document.getElementById('debug-info');
    if (debugPanel) {
        const pages = document.querySelectorAll('.page');
        const activePages = document.querySelectorAll('.page.active');
        const navLinks = document.querySelectorAll('.nav-link');
        
        debugPanel.innerHTML = `
            <div>Total Pages: ${pages.length}</div>
            <div>Active Pages: ${activePages.length}</div>
            <div>Nav Links: ${navLinks.length}</div>
            <div>Active Page ID: ${activePages.length > 0 ? activePages[0].id : 'None'}</div>
            <div>Script Loaded: Yes</div>
        `;
    }
}

export function testNavigation() {
    const debugInfo = document.getElementById('debug-info');
    if (debugInfo) {
        debugInfo.innerHTML += '<div>Testing EMI Calculator...</div>';
        showPage('emi-calculator');
        setTimeout(() => {
            updateDebugInfo();
            debugInfo.innerHTML += '<div>Testing Track Status...</div>';
            showPage('loan-tracker');
            setTimeout(() => {
                updateDebugInfo();
            }, 500);
        }, 500);
    }
}

// Make functions globally available (only in browser environment)
if (typeof window !== 'undefined') {
    window.showPage = showPage;
    window.testNavigation = testNavigation;
}
