// Admin Module

import { API_CONFIG, getAdminStatus } from './config.js';
import { showToast, showLoading, formatCurrency } from './utils.js';

// Admin Functions
export async function loadAdminData() {
    console.log('🔄 Loading admin data - isAdmin:', getAdminStatus());
    
    // Load data regardless of admin status for testing purposes
    // In production, you should enforce: if (!getAdminStatus()) return;
    
    await Promise.all([
        loadPendingApplications(),
        loadAnalytics(),
        loadAllLoans()
    ]);
}

async function loadPendingApplications() {
    try {
        showLoading(true);
        console.log('🔄 Loading pending applications...');
        console.log('🔒 isAdmin:', getAdminStatus());
        
        // Use the proxy endpoint to avoid CORS issues
        const response = await fetch('/api/admin/applications', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📡 Response status:', response.status);
        console.log('📡 Response headers:', response.headers);
        
        if (response.ok) {
            const applications = await response.json();
            console.log('📋 Applications loaded:', applications);
            console.log('📋 Applications count:', applications.length);
            
            // Filter for pending applications or show all if no status filtering needed
            const pendingApps = Array.isArray(applications) ? 
                applications : 
                [];
            
            console.log('⏳ Pending applications:', pendingApps);
            
            const tbody = document.getElementById('pending-applications-tbody');
            if (!tbody) {
                console.error('❌ Table body element not found!');
                return;
            }
            
            tbody.innerHTML = '';
            
            if (pendingApps.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align: center; padding: 2rem; color: white;">
                            <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
                            No pending applications found
                            <br><small style="opacity: 0.7;">Total applications received: ${applications.length || 0}</small>
                        </td>
                    </tr>
                `;
            } else {
                pendingApps.forEach((app, index) => {
                    console.log(`📄 Processing application ${index + 1}:`, app);
                    const row = document.createElement('tr');
                    
                    // Use exact data structure: amountRequested, applicationId, monthlyIncome, status, createdDate
                    const appId = app.applicationId || 'N/A';
                    const amountRequested = app.amountRequested || 0;
                    const monthlyIncome = app.monthlyIncome || 0;
                    const status = app.status || 'PENDING';
                    const dateApplied = app.createdDate || 'N/A';
                    
                    row.innerHTML = `
                        <td style="color: white !important;">${appId}</td>
                        <td style="color: white !important;">${formatCurrency(amountRequested)}</td>
                        <td style="color: white !important;">${formatCurrency(monthlyIncome)}</td>
                        <td style="color: white !important;"><span class="status-badge status-${status.toLowerCase()}">${status}</span></td>
                        <td style="color: white !important;">${dateApplied || 'Not provided'}</td>
                        <td>
                            <button class="btn btn-success" onclick="approveApplication('${appId}')">
                                <i class="fas fa-check"></i> Approve
                            </button>
                            <button class="btn btn-danger" onclick="rejectApplication('${appId}')">
                                <i class="fas fa-times"></i> Reject
                            </button>
                        </td>
                    `;
                    tbody.appendChild(row);
                });
                
                console.log('✅ Applications table updated successfully');
            }
        } else {
            console.error('❌ Failed to load applications:', response.status, response.statusText);
            const errorText = await response.text();
            console.error('❌ Error response:', errorText);
            
            const tbody = document.getElementById('pending-applications-tbody');
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align: center; padding: 2rem; color: white;">
                            <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem; display: block; color: #ef4444;"></i>
                            Error loading applications (${response.status})
                            <br><small style="opacity: 0.7;">Please check if the services are running</small>
                        </td>
                    </tr>
                `;
            }
        }
    } catch (error) {
        console.error('💥 Error loading pending applications:', error);
        const tbody = document.getElementById('pending-applications-tbody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 2rem; color: white;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem; display: block; color: #ef4444;"></i>
                        Network Error: ${error.message}
                        <br><small style="opacity: 0.7;">Please check your connection and server status</small>
                    </td>
                </tr>
            `;
        }
    } finally {
        showLoading(false);
    }
}

async function loadAnalytics() {
    try {
        // Load various analytics data from TrackerService
        const [totalCount, avgAmount, totalDisbursed, avgTenure, statusCounts] = await Promise.all([
            fetch(`${API_CONFIG.TRACKER_SERVICE}/application/metric/total-count`).catch(() => null),
            fetch(`${API_CONFIG.TRACKER_SERVICE}/application/metric/average-approved-amount`).catch(() => null),
            fetch(`${API_CONFIG.TRACKER_SERVICE}/application/metric/total-disbursed-amount`).catch(() => null),
            fetch(`${API_CONFIG.TRACKER_SERVICE}/application/metric/average-tenure`).catch(() => null),
            fetch(`${API_CONFIG.TRACKER_SERVICE}/application/metric/status-counts`).catch(() => null)
        ]);
        
        if (totalCount && totalCount.ok) {
            const data = await totalCount.json();
            const element = document.getElementById('admin-total-apps');
            if (element) element.textContent = data.totalApplications || data.count || 0;
        }
        
        if (avgAmount && avgAmount.ok) {
            const data = await avgAmount.json();
            const element = document.getElementById('admin-avg-amount');
            if (element) element.textContent = formatCurrency(data.averageApprovedAmount || data.amount || 0);
        }
        
        if (totalDisbursed && totalDisbursed.ok) {
            const data = await totalDisbursed.json();
            const element = document.getElementById('admin-total-disbursed');
            if (element) element.textContent = formatCurrency(data.totalDisbursedAmount || data.amount || 0);
        }
        
        if (avgTenure && avgTenure.ok) {
            const data = await avgTenure.json();
            const element = document.getElementById('admin-avg-tenure');
            if (element) element.textContent = `${Math.round(data.averageTenureInMonths || data.tenure || 0)} months`;
        }
        
        if (statusCounts && statusCounts.ok) {
            const data = await statusCounts.json();
            updateStatusChart(data);
        }
        
    } catch (error) {
        console.error('Error loading analytics:', error);
        // Set default values if analytics fail
        const elements = {
            'admin-total-apps': 'N/A',
            'admin-avg-amount': 'N/A',
            'admin-total-disbursed': 'N/A',
            'admin-avg-tenure': 'N/A'
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    }
}

async function loadAllLoans() {
    try {
        // Temporarily disabled - endpoint not available yet
        console.log('📋 All loans loading disabled - endpoint not implemented');
        
        const tbody = document.getElementById('all-loans-tbody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 2rem; color: white;">
                        <i class="fas fa-info-circle" style="font-size: 2rem; margin-bottom: 1rem; display: block; color: #3b82f6;"></i>
                        Loan accounts feature coming soon
                        <br><small style="opacity: 0.7;">Backend endpoint not yet implemented</small>
                    </td>
                </tr>
            `;
        }
    } catch (error) {
        console.error('Error in loadAllLoans:', error);
    }
}

function updateStatusChart(data) {
    const chartElement = document.getElementById('status-chart');
    if (!chartElement) return;
    
    const ctx = chartElement.getContext('2d');
    
    if (typeof window !== 'undefined' && window.statusChart) {
        window.statusChart.destroy();
    }
    
    // Only create chart if Chart.js is available and in browser environment
    if (typeof Chart !== 'undefined' && typeof window !== 'undefined') {
        window.statusChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(data),
                datasets: [{
                    data: Object.values(data),
                    backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: 'Application Status Distribution'
                    }
                }
            }
        });
    }
}

export async function approveApplication(applicationId) {
    if (!confirm('Are you sure you want to approve this application?')) return;
    
    showLoading(true);
    
    try {
        const response = await fetch(`${API_CONFIG.ADMIN_SERVICE}/api/admin/application/${applicationId}/approve`, {
            method: 'PUT'
        });
        
        if (response.ok) {
            showToast('Application approved successfully!');
            loadPendingApplications();
        } else {
            showToast('Failed to approve application', 'error');
        }
    } catch (error) {
        console.error('Error approving application:', error);
        showToast('Error approving application', 'error');
    } finally {
        showLoading(false);
    }
}

export async function rejectApplication(applicationId) {
    if (!confirm('Are you sure you want to reject this application?')) return;
    
    showLoading(true);
    
    try {
        const response = await fetch(`${API_CONFIG.ADMIN_SERVICE}/api/admin/application/${applicationId}/reject`, {
            method: 'PUT'
        });
        
        if (response.ok) {
            showToast('Application rejected successfully!');
            loadPendingApplications();
        } else {
            showToast('Failed to reject application', 'error');
        }
    } catch (error) {
        console.error('Error rejecting application:', error);
        showToast('Error rejecting application', 'error');
    } finally {
        showLoading(false);
    }
}

export function showAdminTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.admin-tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    const tabElement = document.getElementById(`admin-${tabName}`);
    if (tabElement) tabElement.classList.add('active');
    
    // Add active class to clicked button
    if (event && event.target) {
        event.target.classList.add('active');
    }
}

export async function viewLoanDetails(accountNumber) {
    try {
        const response = await fetch(`${API_CONFIG.HOME_LOAN_SERVICE}/api/loan/account/${accountNumber}/details`);
        if (response.ok) {
            const loan = await response.json();
            
            // Create modal or detailed view
            alert(`Loan Details for Account: ${accountNumber}\n` +
                  `Principal: ${formatCurrency(loan.principal)}\n` +
                  `Interest Rate: ${loan.interestRate}%\n` +
                  `Outstanding: ${formatCurrency(loan.outstandingAmount)}`);
        }
    } catch (error) {
        console.error('Error viewing loan details:', error);
    }
}

// Make functions globally available (only in browser environment)
if (typeof window !== 'undefined') {
    window.approveApplication = approveApplication;
    window.rejectApplication = rejectApplication;
    window.showAdminTab = showAdminTab;
    window.viewLoanDetails = viewLoanDetails;
}
