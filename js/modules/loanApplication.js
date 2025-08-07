// Loan Application Module

import { API_CONFIG, getCurrentUser } from './config.js';
import { showToast, showLoading, parseCleanInt, clearSavedFormData } from './utils.js';
import { showPage } from './navigation.js';
import { loadDashboardData } from './dashboard.js';

// Fixed Loan Application Functions with proper field mapping
export async function submitLoanApplication(formData) {
    showLoading(true);
    
    try {
        console.log('Submitting loan application with data:', formData);
        
        // First create the property with correct field mapping
        const propertyData = {
            location: formData.propertyAddress,  // Backend expects 'location' not 'address'
            name: `${formData.propertyType} Property`, // Backend expects 'name' field
            estimatedCost: parseCleanInt(formData.propertyValue),    // Convert string to integer, removing formatting
            type: formData.propertyType
        };
        
        console.log('Creating property with data:', propertyData);
        
        const propertyResponse = await fetch(`${API_CONFIG.PROPERTY_SERVICE}/properties`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(propertyData)
        });
        
        let propertyId = null;
        if (propertyResponse.ok) {
            const property = await propertyResponse.json();
            propertyId = property.propertyId;
            console.log('Property created successfully, ID:', propertyId);
        } else {
            const error = await propertyResponse.text();
            console.error('Property creation failed:', error);
            showToast(`Failed to create property: ${error}`, 'error');
            return false;
        }
        
        // Create income detail with correct field mapping
        const currentUser = getCurrentUser();
        const incomeData = {
            userId: currentUser.userId,           // Backend expects userId
            monthlySalary: parseCleanInt(formData.monthlyIncome), // Convert string to integer, removing formatting
            otherIncome: 0,                       // Backend expects this field
            employerName: formData.employerName,
            employerType: formData.employmentType // Backend expects 'employerType' not 'employmentType'
        };
        
        console.log('Creating income detail with data:', incomeData);
        
        const incomeResponse = await fetch(`${API_CONFIG.INCOME_DETAIL_SERVICE}/income-details`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(incomeData)
        });
        
        let incomeDetailId = null;
        if (incomeResponse.ok) {
            const income = await incomeResponse.json();
            incomeDetailId = income.incomeDetailId;
            console.log('Income detail created successfully, ID:', incomeDetailId);
        } else {
            const error = await incomeResponse.text();
            console.error('Income detail creation failed:', error);
            showToast(`Failed to create income detail: ${error}`, 'error');
            return false;
        }
        
        // Create loan application with correct field mapping
        const applicationData = {
            userId: currentUser.userId,
            propertyId: propertyId,
            incomeDetailId: incomeDetailId,
            amountRequested: parseCleanInt(formData.loanAmount),    // Convert string to integer, removing formatting
            tenureMonths: parseCleanInt(formData.loanTenure) * 12,  // Convert to integer and then to months
            status: 'PENDING'
            // Backend auto-generates createDate via @PrePersist
        };
        
        console.log('Creating loan application with data:', applicationData);
        
        const applicationResponse = await fetch(`${API_CONFIG.LOAN_APPLICATION_SERVICE}/loans`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(applicationData)
        });
        
        if (applicationResponse.ok) {
            const application = await applicationResponse.json();
            console.log('Loan application created successfully:', application);
            
            // Clear saved form data
            clearSavedFormData('loan-application-form');
            
            // Reset form
            document.getElementById('loan-application-form').reset();
            
            showToast(`Loan application submitted successfully! Application ID: ${application.applicationId}`, 'success');
            showPage('dashboard');
            loadDashboardData();
            return true;
        } else {
            const error = await applicationResponse.text();
            console.error('Loan application creation failed:', error);
            showToast(`Failed to submit loan application: ${error}`, 'error');
            return false;
        }
    } catch (error) {
        console.error('Error submitting loan application:', error);
        showToast('Error submitting application. Please check your connection and try again.', 'error');
        return false;
    } finally {
        showLoading(false);
    }
}

// Helper Functions for Application Details
export function downloadApplicationPDF(applicationId) {
    showToast('Downloading application PDF...', 'info');
    // Implementation for PDF download
    console.log(`Downloading PDF for application: ${applicationId}`);
}

export function updateApplication(applicationId) {
    showToast('Redirecting to update form...', 'info');
    // Implementation to redirect to update form
    console.log(`Updating application: ${applicationId}`);
}

// Make functions globally available (only in browser environment)
if (typeof window !== 'undefined') {
    window.submitLoanApplication = submitLoanApplication;
    window.downloadApplicationPDF = downloadApplicationPDF;
    window.updateApplication = updateApplication;
}
