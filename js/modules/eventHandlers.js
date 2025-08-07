// Event Handlers Module

import { validateEmail, validatePhone, validateLoanApplication, showToast } from './utils.js';
import { login, register, logout } from './auth.js';
import { getCurrentUser } from './config.js';
import { submitLoanApplication } from './loanApplication.js';
import { calculateEMI } from './emiCalculator.js';
import { checkBackendStatus } from './apiService.js';

// Event Listeners Setup
export function initializeEventListeners() {
    document.addEventListener('DOMContentLoaded', function() {
        // Set max date for DOB to today's date
        const today = new Date();
        const maxDate = today.toISOString().split('T')[0];
        const dobInput = document.getElementById('dob');
        if (dobInput) {
            dobInput.setAttribute('max', maxDate);
        }
        
        // Check backend connectivity
        checkBackendStatus();
        
        // Initialize EMI Calculator Event Listeners
        initializeEMICalculatorEvents();
        
        // Initialize form event listeners
        initializeFormEvents();
    });
}

function initializeEMICalculatorEvents() {
    // Enhanced EMI Calculator Event Listeners
    const calculatorInputs = ['calc-loan-amount', 'calc-interest-rate', 'calc-tenure', 'loan-amount', 'interest-rate', 'tenure'];
    
    calculatorInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            // Add debounced auto-calculation
            let timeoutId;
            input.addEventListener('input', function() {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    const loanAmount = document.getElementById('calc-loan-amount')?.value || document.getElementById('loan-amount')?.value;
                    const interestRate = document.getElementById('calc-interest-rate')?.value || document.getElementById('interest-rate')?.value;
                    const tenure = document.getElementById('calc-tenure')?.value || document.getElementById('tenure')?.value;
                    
                    if (loanAmount && interestRate && tenure) {
                        calculateEMI();
                    }
                }, 800); // Wait 800ms after user stops typing
            });
            
            // Add input validation styling
            input.addEventListener('blur', function() {
                const value = parseFloat(this.value);
                if (value <= 0 || isNaN(value)) {
                    this.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                    this.style.boxShadow = '0 0 0 2px rgba(239, 68, 68, 0.1)';
                } else {
                    this.style.borderColor = 'rgba(16, 185, 129, 0.5)';
                    this.style.boxShadow = '0 0 0 2px rgba(16, 185, 129, 0.1)';
                }
            });
            
            // Add focus effects
            input.addEventListener('focus', function() {
                this.style.borderColor = 'var(--primary)';
                this.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.2)';
            });
            
            // Add number formatting on blur
            if (inputId.includes('amount') || inputId.includes('loan-amount')) {
                input.addEventListener('blur', function() {
                    const value = parseFloat(this.value);
                    if (!isNaN(value) && value > 0) {
                        // Format large numbers with commas
                        this.value = value;
                    }
                });
                
                input.addEventListener('focus', function() {
                    // Remove formatting for editing
                    this.value = this.value.replace(/,/g, '');
                });
            }
        }
    });
    
    // Add calculate button event listener if it exists
    const calculateButton = document.querySelector('[onclick="calculateEMI()"]') || 
                           document.querySelector('.calculate-emi-btn') ||
                           document.getElementById('calculate-emi');
    
    if (calculateButton) {
        calculateButton.addEventListener('click', function(e) {
            e.preventDefault();
            calculateEMI();
        });
    }
}

function initializeFormEvents() {
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const userTypeElement = document.querySelector('input[name="user-type"]:checked');
            
            if (!userTypeElement) {
                showToast('Please select user type', 'warning');
                return;
            }
            
            const userType = userTypeElement.value;
            
            if (!validateEmail(email)) {
                showToast('Please enter a valid email address', 'warning');
                return;
            }
            
            if (password.length < 4) {
                showToast('Password must be at least 4 characters long', 'warning');
                return;
            }
            
            await login(email, password, userType);
        });
    }
    
    // Register form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const dob = document.getElementById('dob').value;
            const gender = document.getElementById('gender').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // Validation
            if (!firstName.trim() || !lastName.trim()) {
                showToast('Please enter your full name', 'warning');
                return;
            }
            
            if (!validateEmail(email)) {
                showToast('Please enter a valid email address', 'warning');
                return;
            }
            
            if (!validatePhone(phone)) {
                showToast('Please enter a valid 10-digit phone number', 'warning');
                return;
            }
            
            if (!dob) {
                showToast('Please select your date of birth', 'warning');
                return;
            }
            
            if (!gender) {
                showToast('Please select your gender', 'warning');
                return;
            }
            
            // Age validation (must be at least 18 years old and not more than 100 years old)
            const birthDate = new Date(dob);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            
            if (age < 18) {
                showToast('You must be at least 18 years old to register', 'warning');
                return;
            }
            
            if (age > 100) {
                showToast('Please enter a valid date of birth', 'warning');
                return;
            }
            
            if (birthDate > today) {
                showToast('Date of birth cannot be in the future', 'warning');
                return;
            }
            
            if (password.length < 6) {
                showToast('Password must be at least 6 characters long', 'warning');
                return;
            }
            
            if (password !== confirmPassword) {
                showToast('Passwords do not match', 'error');
                return;
            }
            
            const userData = {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim(),
                phoneNumber: phone.replace(/\D/g, ''),
                dateOfBirth: dob,
                gender: gender,
                passwordHash: password
            };
            
            console.log('📝 Registration data:', userData);
            
            await register(userData);
        });
    }
    
    // Loan application form
    const loanApplicationForm = document.getElementById('loan-application-form');
    if (loanApplicationForm) {
        loanApplicationForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const currentUser = getCurrentUser();
            if (!currentUser) {
                showToast('Please login first', 'error');
                return;
            }
            
            const formData = {
                firstName: document.getElementById('app-firstName').value.trim(),
                lastName: document.getElementById('app-lastName').value.trim(),
                email: document.getElementById('app-email').value.trim(),
                phone: document.getElementById('app-phone').value.replace(/\D/g, ''),
                dateOfBirth: document.getElementById('app-dob').value,
                gender: document.getElementById('app-gender').value,
                // Fixed field IDs to match HTML
                monthlyIncome: document.getElementById('monthlySalary').value.replace(/[,\s]/g, ''),
                employmentType: document.getElementById('employerType').value,
                employerName: document.getElementById('employerName').value.trim(),
                loanAmount: document.getElementById('loan-amount').value.replace(/[,\s]/g, ''),
                loanTenure: document.getElementById('loan-tenure').value,
                loanPurpose: document.getElementById('loan-purpose').value,
                propertyAddress: document.getElementById('property-address').value.trim(),
                propertyValue: document.getElementById('property-value').value.replace(/[,\s]/g, ''),
                propertyType: document.getElementById('property-type').value
            };
            
            if (!validateLoanApplication(formData)) {
                return;
            }
            
            await submitLoanApplication(formData);
        });
    }
    
    // Logout functionality
    const logoutButton = document.getElementById('logout-btn');
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }
}
