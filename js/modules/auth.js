// Authentication Module

import { makeAPICall } from './apiService.js';
import { showToast, showLoading, validateEmail } from './utils.js';
import { setCurrentUser, setAdminStatus, getCurrentUser } from './config.js';
import { showPage } from './navigation.js';

// Authentication Functions
export function showLogin() {
    showPage('login');
}

export function showRegister() {
    showPage('register');
}

export function updateAuthUI() {
    const currentUser = getCurrentUser();
    const navAuth = document.getElementById('nav-auth');
    const userInfo = document.getElementById('user-info');
    const adminNav = document.getElementById('admin-nav');
    const logoutNav = document.getElementById('logout-nav');
    const userName = document.getElementById('user-name');
    
    if (currentUser) {
        if (navAuth) navAuth.style.display = 'none';
        if (userInfo) userInfo.style.display = 'flex';
        if (logoutNav) logoutNav.style.display = 'flex';
        if (userName) userName.textContent = `Welcome, ${currentUser.firstName || currentUser.email || 'User'}`;
        
        if (currentUser.isAdmin && adminNav) {
            adminNav.style.display = 'flex';
        }
        
        showPage('dashboard');
    } else {
        if (navAuth) navAuth.style.display = 'flex';
        if (userInfo) userInfo.style.display = 'none';
        if (adminNav) adminNav.style.display = 'none';
        if (logoutNav) logoutNav.style.display = 'none';
        showPage('login');
    }
}

export async function login(email, password, userType) {
    showLoading(true);
    
    try {
        if (userType === 'admin') {
            // Admin login - fixed to use JSON format instead of form-urlencoded
            const response = await makeAPICall('/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    passwordHash: password
                })
            });
            
            if (response && response.Message === "Login Successful") {
                const user = { email, firstName: 'Admin', role: 'admin', isAdmin: true };
                setCurrentUser(user);
                setAdminStatus(true);
                updateAuthUI();
                showToast('Admin login successful!');
                return true;
            }
        } else {
            // User login - try HomeLoanNew service first (more reliable), then UserService as fallback
            try {
                const userData = await makeAPICall('/api/applicant/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: email,
                        passwordHash: password
                    })
                });
                
                if (userData && userData.message === "User login successful." && userData.status === "success") {
                    const user = {
                        email: email,
                        firstName: email.split('@')[0], // Use email prefix as fallback name
                        role: userData.role || 'user',
                        loginResponse: userData,
                        isAdmin: false
                    };
                    setCurrentUser(user);
                    setAdminStatus(false);
                    updateAuthUI();
                    showToast('Login successful!');
                    return true;
                }
            } catch (homeLoanError) {
                console.log('HomeLoanNew service login failed, trying UserService...');
                
                // Fallback to UserService
                const userData = await makeAPICall('/api/users/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: email,
                        passwordHash: password
                    })
                });
                
                if (userData && userData.message === "Login successful") {
                    const user = {
                        email: userData.email || email,
                        firstName: userData.firstName || email.split('@')[0],
                        lastName: userData.lastName || '',
                        userId: userData.userId,
                        role: userData.role || 'user',
                        isAdmin: false
                    };
                    setCurrentUser(user);
                    setAdminStatus(false);
                    updateAuthUI();
                    showToast('Login successful!');
                    return true;
                }
            }
        }
        
        showToast('Invalid credentials. Please try again.', 'error');
        return false;
        
    } catch (error) {
        console.error('Login error:', error);
        showToast('Login failed. Please check your connection and try again.', 'error');
        return false;
    } finally {
        showLoading(false);
    }
}

export async function register(userData) {
    showLoading(true);
    
    try {
        const result = await makeAPICall('/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });
        
        if (result && result.userId) {
            showToast('Registration successful! Please login with your credentials.');
            clearRegistrationForm();
            showLogin();
            return true;
        } else if (result && result.message) {
            showToast(result.message);
            if (result.message.includes('successful')) {
                clearRegistrationForm();
                showLogin();
                return true;
            }
        }
        
        showToast('Registration failed. Please try again.', 'error');
        return false;
    } catch (error) {
        console.error('Registration error:', error);
        showToast('Registration failed. Please check your connection and try again.', 'error');
        return false;
    } finally {
        showLoading(false);
    }
}

export function logout() {
    setCurrentUser(null);
    setAdminStatus(false);
    updateAuthUI();
    showToast('Logged out successfully');
}

export function clearRegistrationForm() {
    document.getElementById('firstName').value = '';
    document.getElementById('lastName').value = '';
    document.getElementById('email').value = '';
    document.getElementById('phone').value = '';
    document.getElementById('dob').value = '';
    document.getElementById('gender').value = '';
    document.getElementById('password').value = '';
    document.getElementById('confirmPassword').value = '';
}

// Pre-fill form with user data
export function prefillUserData() {
    const currentUser = getCurrentUser();
    if (currentUser) {
        const firstName = document.getElementById('app-firstName');
        const lastName = document.getElementById('app-lastName');
        const email = document.getElementById('app-email');
        
        if (firstName) firstName.value = currentUser.firstName || '';
        if (lastName) lastName.value = currentUser.lastName || '';
        if (email) email.value = currentUser.email || '';
    }
}
