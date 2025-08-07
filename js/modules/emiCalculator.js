// EMI Calculator Module

import { showToast } from './utils.js';

// Initialize EMI Calculator
export function initializeEMICalculator() {
    // Set default values for demonstration
    const loanAmountInput = document.getElementById('calc-loan-amount');
    const interestRateInput = document.getElementById('calc-interest-rate');
    const tenureInput = document.getElementById('calc-tenure');
    
    if (loanAmountInput && !loanAmountInput.value) {
        loanAmountInput.value = '2500000';
    }
    if (interestRateInput && !interestRateInput.value) {
        interestRateInput.value = '8.5';
    }
    if (tenureInput && !tenureInput.value) {
        tenureInput.value = '20';
    }
    
    // Calculate EMI with default values
    setTimeout(() => {
        calculateEMI();
    }, 100);
}

// Enhanced EMI Calculator Functions with Animations
export function calculateEMI() {
    const loanAmount = parseFloat(document.getElementById('calc-loan-amount')?.value || document.getElementById('loan-amount')?.value) || 0;
    const interestRate = parseFloat(document.getElementById('calc-interest-rate')?.value || document.getElementById('interest-rate')?.value) || 0;
    const tenure = parseFloat(document.getElementById('calc-tenure')?.value || document.getElementById('tenure')?.value) || 0;
    
    // Validate inputs
    if (!loanAmount || !interestRate || !tenure || 
        loanAmount <= 0 || interestRate <= 0 || tenure <= 0) {
        // Show validation error with animation
        showCalculatorError('Please enter valid values for all fields');
        // Reset display values
        const monthlyEmi = document.getElementById('monthly-emi');
        const totalInterest = document.getElementById('total-interest');
        const totalAmount = document.getElementById('total-amount');
        
        if (monthlyEmi) monthlyEmi.textContent = '₹ 0';
        if (totalInterest) totalInterest.textContent = '₹ 0';
        if (totalAmount) totalAmount.textContent = '₹ 0';
        return;
    }
    
    // Add loading animation to result values
    const resultValues = document.querySelectorAll('.result-value');
    resultValues.forEach(value => {
        value.classList.add('loading');
        value.textContent = 'Calculating...';
    });
    
    // Simulate calculation delay for smooth animation
    setTimeout(() => {
        // Calculate EMI
        const monthlyRate = interestRate / 12 / 100;
        const totalMonths = tenure * 12;
        
        const emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
                    (Math.pow(1 + monthlyRate, totalMonths) - 1);
        
        const totalAmount = emi * totalMonths;
        const totalInterest = totalAmount - loanAmount;
        
        // Remove loading state and animate values
        resultValues.forEach(value => value.classList.remove('loading'));
        
        // Animate the display of results
        animateValue('monthly-emi', 0, emi, 1000, '₹', true);
        animateValue('total-interest', 0, totalInterest, 1200, '₹', true);
        animateValue('total-amount', 0, totalAmount, 1400, '₹', true);
        
        // Update chart after a small delay
        setTimeout(() => {
            updateEMIChart(loanAmount, totalInterest);
        }, 500);
        
    }, 300);
}

// Enhanced value animation function
function animateValue(elementId, start, end, duration, prefix = '', formatNumber = false) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const startTime = performance.now();
    const startValue = start;
    const endValue = end;
    
    function updateValue(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Use easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = startValue + (endValue - startValue) * easeOutQuart;
        
        if (formatNumber) {
            element.textContent = prefix + ' ' + currentValue.toLocaleString('en-IN', {
                maximumFractionDigits: 0
            });
        } else {
            element.textContent = prefix + ' ' + Math.round(currentValue);
        }
        
        if (progress < 1) {
            requestAnimationFrame(updateValue);
        } else {
            // Final value with proper formatting
            if (formatNumber) {
                element.textContent = prefix + ' ' + endValue.toLocaleString('en-IN', {
                    maximumFractionDigits: 0
                });
            } else {
                element.textContent = prefix + ' ' + Math.round(endValue);
            }
        }
    }
    
    requestAnimationFrame(updateValue);
}

function updateEMIChart(principal, interest) {
    const chartElement = document.getElementById('emi-chart');
    if (!chartElement) return;
    
    const ctx = chartElement.getContext('2d');
    
    // Destroy existing chart if it exists (only in browser environment)
    if (typeof window !== 'undefined' && window.emiChart) {
        window.emiChart.destroy();
    }
    
    // Create new chart with enhanced styling (only if Chart.js is available)
    if (typeof Chart !== 'undefined' && typeof window !== 'undefined') {
        window.emiChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Principal Amount', 'Interest Amount'],
                datasets: [{
                    data: [principal, interest],
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(16, 185, 129, 0.8)'
                    ],
                    borderColor: [
                        'rgba(59, 130, 246, 1)',
                        'rgba(16, 185, 129, 1)'
                    ],
                    borderWidth: 3,
                    hoverBackgroundColor: [
                        'rgba(59, 130, 246, 0.9)',
                        'rgba(16, 185, 129, 0.9)'
                    ],
                    hoverBorderWidth: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: 'white',
                            font: {
                                size: 14,
                                weight: 600
                            },
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    title: {
                        display: true,
                        text: 'Loan Breakdown',
                        color: 'white',
                        font: {
                            size: 18,
                            weight: 700
                        },
                        padding: 20
                    },
                    tooltip: {
                        backgroundColor: 'rgba(30, 41, 59, 0.95)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        borderWidth: 1,
                        cornerRadius: 12,
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed;
                                return context.label + ': ₹' + value.toLocaleString('en-IN');
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 1500,
                    easing: 'easeOutQuart'
                },
                cutout: '60%'
            }
        });
    }
}

// Error display function with animation
function showCalculatorError(message) {
    // Remove existing error if any
    const existingError = document.querySelector('.calculator-error');
    if (existingError) {
        existingError.remove();
    }
    
    // Create error element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'calculator-error';
    errorDiv.innerHTML = `
        <div class="error-content">
            <i class="fas fa-exclamation-triangle"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add error styles
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(220, 38, 38, 0.95));
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3);
        z-index: 10000;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        transform: translateX(400px);
        transition: transform 0.3s ease;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 12px;
    `;
    
    document.body.appendChild(errorDiv);
    
    // Animate in
    setTimeout(() => {
        errorDiv.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        errorDiv.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 300);
    }, 4000);
}

// Initialize Chart.js defaults if available
if (typeof Chart !== 'undefined') {
    Chart.defaults.font.family = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
}

// Make functions globally available (only in browser environment)
if (typeof window !== 'undefined') {
    window.calculateEMI = calculateEMI;
}
