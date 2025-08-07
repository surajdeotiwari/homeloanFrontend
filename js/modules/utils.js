// Utility Functions

// Helper function to clean numeric values before parsing
export function parseCleanInt(value) {
    if (!value) return 0; // Handle null, undefined, empty string
    if (typeof value === 'string') {
        // Remove commas, spaces, and other formatting characters
        const cleanValue = value.replace(/[,\s]/g, '');
        const parsed = parseInt(cleanValue, 10);
        return isNaN(parsed) ? 0 : parsed;
    }
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? 0 : parsed;
}

export function showLoading(show = true) {
    document.getElementById('loading-spinner').style.display = show ? 'flex' : 'none';
}

export function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'check-circle' : 
                 type === 'error' ? 'exclamation-circle' : 
                 type === 'warning' ? 'exclamation-triangle' : 'info-circle';
    
    toast.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

export function formatCurrency(amount) {
    if (!amount || isNaN(amount)) {
        return '₹0';
    }
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
}

export function formatDate(dateString) {
    if (!dateString) {
        return 'Invalid Date';
    }
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        return 'Invalid Date';
    }
}

// Validation Functions
export function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

export function validatePhone(phone) {
    const re = /^[0-9]{10}$/;
    return re.test(phone.replace(/\D/g, ''));
}

export function validateForm(formData, requiredFields) {
    for (const field of requiredFields) {
        if (!formData[field] || formData[field].toString().trim() === '') {
            showToast(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`, 'warning');
            return false;
        }
    }
    return true;
}

// Enhanced form validation
export function validateLoanApplication(formData) {
    const requiredFields = [
        'firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'gender',
        'monthlyIncome', 'employmentType', 'employerName',
        'loanAmount', 'loanTenure', 'loanPurpose',
        'propertyAddress', 'propertyValue', 'propertyType'
    ];
    
    if (!validateForm(formData, requiredFields)) {
        return false;
    }
    
    if (!validateEmail(formData.email)) {
        showToast('Please enter a valid email address', 'warning');
        return false;
    }
    
    if (!validatePhone(formData.phone)) {
        showToast('Please enter a valid 10-digit phone number', 'warning');
        return false;
    }
    
    if (formData.loanAmount <= 0 || formData.loanAmount > 50000000) {
        showToast('Loan amount must be between ₹1 and ₹5 crore', 'warning');
        return false;
    }
    
    if (formData.monthlyIncome <= 0) {
        showToast('Monthly income must be greater than 0', 'warning');
        return false;
    }
    
    if (formData.propertyValue <= 0) {
        showToast('Property value must be greater than 0', 'warning');
        return false;
    }
    
    // Check loan to value ratio
    const ltv = (formData.loanAmount / formData.propertyValue) * 100;
    if (ltv > 90) {
        showToast('Loan amount cannot exceed 90% of property value', 'warning');
        return false;
    }
    
    return true;
}

// Debounce function for performance
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Form data persistence
export function saveFormData(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    const formData = new FormData(form);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    localStorage.setItem(`saved_${formId}`, JSON.stringify(data));
}

export function loadFormData(formId) {
    const savedData = localStorage.getItem(`saved_${formId}`);
    if (!savedData) return;
    
    try {
        const data = JSON.parse(savedData);
        Object.keys(data).forEach(key => {
            const element = document.getElementById(key);
            if (element && element.value !== '') {
                // Don't overwrite if user has already entered data
                return;
            }
            if (element) {
                element.value = data[key];
            }
        });
    } catch (error) {
        console.error('Error loading saved form data:', error);
    }
}

export function clearSavedFormData(formId) {
    localStorage.removeItem(`saved_${formId}`);
}
