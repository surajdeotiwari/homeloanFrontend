// Loan Tracker Module

import { API_CONFIG } from './config.js';
import { showToast, showLoading, formatCurrency, formatDate } from './utils.js';
import { showPage } from './navigation.js';

// Application Tracking Functions
export async function trackApplication() {
    const searchType = document.getElementById('search-type').value;
    const searchValue = document.getElementById('search-value').value;
    
    if (!searchValue) {
        showToast('Please enter an ID to search', 'warning');
        return;
    }
    
    showLoading(true);
    
    try {
        let response;
        
        if (searchType === 'application') {
            response = await fetch(`${API_CONFIG.TRACKER_SERVICE}/api/application/status/${searchValue}`);
        } else {
            response = await fetch(`${API_CONFIG.TRACKER_SERVICE}/api/application/status/customer/${searchValue}`);
        }
        
        if (response.ok) {
            const application = await response.json();
            displayApplicationDetails(application);
        } else {
            showApplicationNotFound();
            showToast('Application not found', 'error');
        }
    } catch (error) {
        console.error('Error tracking application:', error);
        showApplicationNotFound();
        showToast('Error tracking application. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

function showApplicationNotFound() {
    const container = document.getElementById('application-details');
    container.style.display = 'block';
    
    container.innerHTML = `
        <div class="application-not-found">
            <div class="not-found-icon">
                <i class="fas fa-search"></i>
            </div>
            <h3 class="not-found-title">No Application Found</h3>
            <p class="not-found-message">
                We couldn't find any application with the provided ID. 
                Please check your ID and try again.
            </p>
            <div class="application-actions">
                <a href="#" onclick="showPage('loan-application')" class="action-btn primary">
                    <i class="fas fa-plus"></i> Apply for New Loan
                </a>
                <a href="#" onclick="clearSearch()" class="action-btn secondary">
                    <i class="fas fa-search"></i> Try Another Search
                </a>
            </div>
        </div>
    `;
}

export function clearSearch() {
    document.getElementById('search-value').value = '';
    document.getElementById('application-details').style.display = 'none';
    document.getElementById('search-value').focus();
}

function displayApplicationDetails(application) {
    const container = document.getElementById('application-details');
    container.style.display = 'block';
    
    // Calculate progress percentage based on status
    const statusSteps = {
        'SUBMITTED': 20,
        'UNDER_REVIEW': 40,
        'APPROVED': 80,
        'DISBURSED': 100,
        'REJECTED': 0
    };
    
    const progressPercentage = statusSteps[application.status] || 0;
    const isRejected = application.status === 'REJECTED';
    
    // Format status for timeline
    const timelineSteps = [
        { key: 'SUBMITTED', label: 'Submitted', icon: 'fas fa-file-alt' },
        { key: 'UNDER_REVIEW', label: 'Under Review', icon: 'fas fa-search' },
        { key: 'APPROVED', label: 'Approved', icon: 'fas fa-check-circle' },
        { key: 'DISBURSED', label: 'Disbursed', icon: 'fas fa-money-check-alt' }
    ];
    
    // Parse the actual API response fields
    const loanAmount = application.amountRequested || application.loanAmount || 0;
    const customerId = application.userId || application.customerId || 'N/A';
    const applicationDate = application.createDate || application.applicationDate;
    const tenureYears = application.tenureMonths ? Math.round(application.tenureMonths / 12) : 'N/A';
    
    container.innerHTML = `
        <div class="application-details-section">
            <div class="application-details-header">
                <h2><i class="fas fa-file-contract"></i> Application Details</h2>
                <p>Complete overview of your loan application status and progress</p>
            </div>
            
            <div class="application-details-container">
                <div class="application-status-card">
                    <div class="status-card-header">
                        <h3><i class="fas fa-info-circle"></i> Application Overview</h3>
                        <div class="application-id">ID: ${application.applicationId}</div>
                    </div>
                    
                    <div class="status-card-content">
                        <div class="application-overview">
                            <div class="overview-item">
                                <div class="overview-icon">
                                    <i class="fas fa-user"></i>
                                </div>
                                <div class="overview-label">Customer ID</div>
                                <div class="overview-value">${customerId}</div>
                            </div>
                            
                            <div class="overview-item">
                                <div class="overview-icon">
                                    <i class="fas fa-rupee-sign"></i>
                                </div>
                                <div class="overview-label">Loan Amount</div>
                                <div class="overview-value">${formatCurrency(loanAmount)}</div>
                            </div>
                            
                            <div class="overview-item">
                                <div class="overview-icon">
                                    <i class="fas fa-home"></i>
                                </div>
                                <div class="overview-label">Loan Type</div>
                                <div class="overview-value">Home Loan</div>
                            </div>
                            
                            <div class="overview-item">
                                <div class="overview-icon">
                                    <i class="fas fa-calendar"></i>
                                </div>
                                <div class="overview-label">Applied On</div>
                                <div class="overview-value">${formatDate(applicationDate)}</div>
                            </div>
                        </div>
                        
                        <div class="application-overview" style="margin-top: var(--space-6);">
                            <div class="overview-item">
                                <div class="overview-icon">
                                    <i class="fas fa-clock"></i>
                                </div>
                                <div class="overview-label">Tenure</div>
                                <div class="overview-value">${tenureYears} years</div>
                            </div>
                            
                            <div class="overview-item">
                                <div class="overview-icon">
                                    <i class="fas fa-building"></i>
                                </div>
                                <div class="overview-label">Property ID</div>
                                <div class="overview-value">${application.propertyId || 'N/A'}</div>
                            </div>
                            
                            <div class="overview-item">
                                <div class="overview-icon">
                                    <i class="fas fa-file-invoice-dollar"></i>
                                </div>
                                <div class="overview-label">Income Detail ID</div>
                                <div class="overview-value">${application.incomeDetailId || 'N/A'}</div>
                            </div>
                            
                            <div class="overview-item">
                                <div class="overview-icon">
                                    <i class="fas fa-info-circle"></i>
                                </div>
                                <div class="overview-label">Status</div>
                                <div class="overview-value" style="color: ${application.status === 'REJECTED' ? '#ef4444' : 
                                    application.status === 'APPROVED' ? '#10b981' : 
                                    application.status === 'DISBURSED' ? '#059669' : '#f59e0b'};">
                                    ${application.status}
                                </div>
                            </div>
                        </div>
                        
                        ${!isRejected ? `
                        <div class="application-progress">
                            <div class="progress-header">
                                <div class="progress-title">Application Progress</div>
                                <div class="progress-percentage">${progressPercentage}%</div>
                            </div>
                            <div class="progress-bar-container">
                                <div class="progress-bar" style="width: ${progressPercentage}%"></div>
                            </div>
                        </div>
                        ` : ''}
                        
                        <div class="status-timeline">
                            <div class="timeline-title">
                                <i class="fas fa-route"></i>
                                Application Timeline
                            </div>
                            <div class="timeline-steps">
                                ${timelineSteps.map(step => {
                                    const isCompleted = statusSteps[application.status] >= statusSteps[step.key];
                                    const isCurrent = application.status === step.key;
                                    const stepClass = isRejected ? '' : 
                                                    isCurrent ? 'current' : 
                                                    isCompleted ? 'completed' : '';
                                    
                                    return `
                                        <div class="timeline-step ${stepClass}">
                                            <div class="timeline-dot">
                                                <i class="${step.icon}"></i>
                                            </div>
                                            <div class="timeline-label">${step.label}</div>
                                        </div>
                                    `;
                                }).join('')}
                                
                                ${isRejected ? `
                                <div class="timeline-step rejected">
                                    <div class="timeline-dot" style="background: #ef4444; color: white;">
                                        <i class="fas fa-times"></i>
                                    </div>
                                    <div class="timeline-label" style="color: #ef4444; font-weight: 700;">Rejected</div>
                                </div>
                                ` : ''}
                            </div>
                        </div>
                        
                        <div class="application-actions">
                            ${application.status === 'DISBURSED' ? `
                                <a href="loan-details.html?loanId=${application.loanId || application.applicationId}" class="action-btn primary">
                                    <i class="fas fa-eye"></i> View Loan Details
                                </a>
                            ` : ''}
                            
                            <a href="#" onclick="downloadApplicationPDF('${application.applicationId}')" class="action-btn secondary">
                                <i class="fas fa-download"></i> Download Application
                            </a>
                            
                            ${application.status === 'UNDER_REVIEW' ? `
                                <a href="#" onclick="updateApplication('${application.applicationId}')" class="action-btn secondary">
                                    <i class="fas fa-edit"></i> Update Application
                                </a>
                            ` : ''}
                            
                            ${application.status === 'REJECTED' ? `
                                <a href="#" onclick="showPage('loan-application')" class="action-btn primary">
                                    <i class="fas fa-plus"></i> Apply Again
                                </a>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Make functions globally available (only in browser environment)
if (typeof window !== 'undefined') {
    window.trackApplication = trackApplication;
    window.clearSearch = clearSearch;
}
