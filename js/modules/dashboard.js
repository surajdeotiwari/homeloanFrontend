// Dashboard Module

import { API_CONFIG, getCurrentUser } from './config.js';
import { showToast, formatCurrency, formatDate } from './utils.js';

// Dashboard Functions
export async function loadDashboardData() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    try {
        // Add loading skeleton animation
        addDashboardLoadingState();
        
        // Animate metric cards loading
        animateMetricCardsLoading();
        
        // Load application statistics with animation
        const metricsResponse = await fetch(`${API_CONFIG.TRACKER_SERVICE}/application/metric/status-counts`);
        if (metricsResponse.ok) {
            const metrics = await metricsResponse.json();
            const totalApps = Object.values(metrics).reduce((a, b) => a + b, 0);
            
            // Animate numbers counting up
            animateCountUp('total-applications', totalApps, 1000);
            animateCountUp('approved-applications', metrics.APPROVED || 0, 1200);
            animateCountUp('pending-applications', metrics.PENDING || 0, 1400);
            
            // Calculate total loan amount for animation
            const totalAmount = totalApps * 2500000; // Estimated average
            animateCountUpCurrency('total-loan-amount', totalAmount, 1600);
        }
        
        // Load recent applications with staggered animation
        if (currentUser.userId) {
            await loadRecentApplicationsWithAnimation();
        }
        
        // Update timeline with progress animation
        updateTimelineProgress();
        
        // Remove loading state
        setTimeout(() => {
            removeDashboardLoadingState();
        }, 2000);
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        removeDashboardLoadingState();
        showToast('Error loading dashboard data', 'error');
    }
}

async function loadRecentApplicationsWithAnimation() {
    try {
        const response = await fetch(`${API_CONFIG.LOAN_APPLICATION_SERVICE}/loans`);
        if (response.ok) {
            const applications = await response.json();
            const recentApps = applications.slice(-5).reverse(); // Get last 5 applications
            
            const container = document.getElementById('recent-applications-list');
            
            if (recentApps.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-inbox"></i>
                        <h4>No applications yet</h4>
                        <p>Start your loan journey by submitting your first application</p>
                        <button class="btn btn-primary btn-sm" onclick="showPage('loan-application')">
                            Apply Now
                        </button>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = '';
            
            recentApps.forEach((app, index) => {
                const appElement = document.createElement('div');
                appElement.className = 'application-item';
                appElement.style.opacity = '0';
                appElement.style.transform = 'translateX(-30px)';
                appElement.style.transition = 'all 0.5s ease';
                
                appElement.innerHTML = `
                    <div class="application-header">
                        <span class="application-id">Application #${app.applicationId}</span>
                        <span class="status-badge status-${app.status.toLowerCase()}">${app.status}</span>
                    </div>
                    <div class="application-meta">
                        <span>Amount: ${formatCurrency(app.requestedAmount)}</span>
                        <span>Applied: ${formatDate(app.applicationDate)}</span>
                    </div>
                `;
                
                container.appendChild(appElement);
                
                // Animate entrance
                setTimeout(() => {
                    appElement.style.opacity = '1';
                    appElement.style.transform = 'translateX(0)';
                }, 500 + (index * 100));
            });
        }
    } catch (error) {
        console.error('Error loading recent applications:', error);
    }
}

function addDashboardLoadingState() {
    const metricCards = document.querySelectorAll('.metric-content h3');
    metricCards.forEach(card => {
        card.classList.add('loading-skeleton');
        card.style.height = '40px';
        card.style.borderRadius = '8px';
    });
}

function removeDashboardLoadingState() {
    const metricCards = document.querySelectorAll('.metric-content h3');
    metricCards.forEach(card => {
        card.classList.remove('loading-skeleton');
        card.style.height = 'auto';
    });
}

function animateMetricCardsLoading() {
    const metricCards = document.querySelectorAll('.metric-card');
    metricCards.forEach((card, index) => {
        card.style.animation = 'none';
        setTimeout(() => {
            card.style.animation = `slideInFromBottom 0.6s ease-out ${index * 0.1}s both`;
        }, 100);
    });
}

export function animateCountUp(elementId, targetValue, duration) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const startTime = Date.now();
    const startValue = 0;
    
    function updateCount() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOutQuart);
        
        element.textContent = currentValue;
        
        if (progress < 1) {
            requestAnimationFrame(updateCount);
        } else {
            element.textContent = targetValue;
        }
    }
    
    requestAnimationFrame(updateCount);
}

export function animateCountUpCurrency(elementId, targetValue, duration) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const startTime = Date.now();
    const startValue = 0;
    
    function updateCount() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOutQuart);
        
        element.textContent = formatCurrency(currentValue);
        
        if (progress < 1) {
            requestAnimationFrame(updateCount);
        } else {
            element.textContent = formatCurrency(targetValue);
        }
    }
    
    requestAnimationFrame(updateCount);
}

function updateTimelineProgress() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    if (!timelineItems.length) return;
    
    // Simulate progress based on user data
    setTimeout(() => {
        timelineItems.forEach((item, index) => {
            if (index === 0) {
                item.classList.add('completed');
            } else if (index === 1) {
                item.classList.add('current');
            }
        });
    }, 1500);
}

// Legacy function for compatibility
export async function loadRecentApplications() {
    // This function is now replaced by loadRecentApplicationsWithAnimation
    await loadRecentApplicationsWithAnimation();
}
