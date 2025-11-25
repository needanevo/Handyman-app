/**
 * The Real Johnson - Web Authentication Library
 * Handles JWT tokens, API calls, and cross-platform authentication
 * Ensures seamless web-to-app token handoff
 */

const API_BASE_URL = 'https://therealjohnson.com/api';

// ==================== Token Management ====================

function setTokens(accessToken, refreshToken) {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
}

function getAccessToken() {
    return localStorage.getItem('access_token');
}

function getRefreshToken() {
    return localStorage.getItem('refresh_token');
}

function clearTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
}

function isAuthenticated() {
    return !!getAccessToken();
}

// ==================== User Data Management ====================

function setUserData(user) {
    localStorage.setItem('user_data', JSON.stringify(user));
}

function getUserData() {
    const data = localStorage.getItem('user_data');
    return data ? JSON.parse(data) : null;
}

function getUserRole() {
    const user = getUserData();
    return user ? user.role : null;
}

// ==================== Error Handling Utilities ====================

function getUserFriendlyError(error, context = '') {
    // Network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return 'Unable to connect to server. Please check your internet connection and try again.';
    }

    // Timeout errors
    if (error.name === 'AbortError') {
        return 'Request timed out. Please check your connection and try again.';
    }

    // API error messages
    const message = error.message || '';

    // Authentication errors
    if (message.includes('401') || message.includes('Unauthorized')) {
        return context === 'login'
            ? 'Invalid email or password. Please check your credentials and try again.'
            : 'Your session has expired. Please sign in again.';
    }

    // Duplicate account errors
    if (message.includes('already exists') || message.includes('duplicate') || message.includes('409')) {
        if (message.toLowerCase().includes('email')) {
            return 'This email is already registered. Try signing in instead.';
        }
        if (message.toLowerCase().includes('phone')) {
            return 'This phone number is already registered. Try signing in instead.';
        }
        return 'An account with these details already exists. Try signing in instead.';
    }

    // Validation errors
    if (message.includes('400') || message.includes('Bad Request')) {
        return 'Please check your information and try again. Some fields may be invalid.';
    }

    // Not found errors
    if (message.includes('404') || message.includes('Not Found')) {
        return context === 'login'
            ? 'No account found with this email. Please check your email or create an account.'
            : 'The requested resource was not found.';
    }

    // Permission errors
    if (message.includes('403') || message.includes('Forbidden')) {
        return 'You do not have permission to perform this action.';
    }

    // Server errors
    if (message.includes('500') || message.includes('Internal Server Error')) {
        return 'Server error. Please try again in a moment. If the problem persists, contact support.';
    }

    // Rate limiting
    if (message.includes('429') || message.includes('Too Many Requests')) {
        return 'Too many attempts. Please wait a few minutes before trying again.';
    }

    // File upload errors
    if (message.includes('file') || message.includes('upload')) {
        return 'File upload failed. Please check the file size and type, then try again.';
    }

    // Default: return original message if it's user-friendly, otherwise generic message
    if (message.length < 100 && !message.includes('HTTP')) {
        return message;
    }

    return 'Something went wrong. Please try again. If the problem persists, contact support.';
}

// ==================== API Request Helper ====================

async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    // Add auth token if available
    const token = getAccessToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Set timeout (default 30 seconds)
    const timeout = options.timeout || 30000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const config = {
        ...options,
        headers,
        signal: controller.signal
    };

    try {
        const response = await fetch(url, config);
        clearTimeout(timeoutId);

        // Handle 401 Unauthorized - token expired
        if (response.status === 401) {
            // Try to refresh token
            const refreshed = await refreshAccessToken();
            if (refreshed) {
                // Retry original request with new token
                headers['Authorization'] = `Bearer ${getAccessToken()}`;
                const retryController = new AbortController();
                const retryTimeoutId = setTimeout(() => retryController.abort(), timeout);

                const retryResponse = await fetch(url, {
                    ...config,
                    headers,
                    signal: retryController.signal
                });
                clearTimeout(retryTimeoutId);

                if (!retryResponse.ok) {
                    const errorData = await retryResponse.json().catch(() => ({}));
                    throw new Error(errorData.detail || `HTTP ${retryResponse.status}`);
                }
                return await retryResponse.json();
            } else {
                // Refresh failed - logout
                clearTokens();
                window.location.href = '/login/';
                throw new Error('Session expired. Please login again.');
            }
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.detail || errorData.message || `HTTP ${response.status}`;
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        clearTimeout(timeoutId);
        console.error('API Request Error:', error);
        throw error;
    }
}

async function apiRequestFormData(endpoint, formData, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {};

    const token = getAccessToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Set timeout (60 seconds for file uploads)
    const timeout = options.timeout || 60000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: formData,
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.status === 401) {
            const refreshed = await refreshAccessToken();
            if (refreshed) {
                headers['Authorization'] = `Bearer ${getAccessToken()}`;
                const retryController = new AbortController();
                const retryTimeoutId = setTimeout(() => retryController.abort(), timeout);

                const retryResponse = await fetch(url, {
                    method: 'POST',
                    headers,
                    body: formData,
                    signal: retryController.signal
                });
                clearTimeout(retryTimeoutId);

                if (!retryResponse.ok) {
                    const errorData = await retryResponse.json().catch(() => ({}));
                    throw new Error(errorData.detail || `HTTP ${retryResponse.status}`);
                }
                return await retryResponse.json();
            } else {
                clearTokens();
                window.location.href = '/login/';
                throw new Error('Session expired. Please login again.');
            }
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.detail || errorData.message || `HTTP ${response.status}`;
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        clearTimeout(timeoutId);
        console.error('API FormData Request Error:', error);
        throw error;
    }
}

// ==================== Validation Helpers ====================

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.toLowerCase());
}

function validatePhone(phone) {
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '');
    // Check if it's 10 or 11 digits (with or without country code)
    return cleaned.length >= 10 && cleaned.length <= 11;
}

function validatePassword(password) {
    return {
        valid: password.length >= 8,
        minLength: password.length >= 8,
        hasUpperCase: /[A-Z]/.test(password),
        hasLowerCase: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password)
    };
}

function validateFile(file, options = {}) {
    const {
        maxSize = 10 * 1024 * 1024, // 10MB default
        allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
    } = options;

    const errors = [];

    if (!file) {
        errors.push('No file selected');
        return { valid: false, errors };
    }

    // Check file size
    if (file.size > maxSize) {
        const sizeMB = (maxSize / (1024 * 1024)).toFixed(1);
        errors.push(`File size must be less than ${sizeMB}MB. Your file is ${(file.size / (1024 * 1024)).toFixed(1)}MB.`);
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
        const typesList = allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ');
        errors.push(`File type not allowed. Please upload: ${typesList}`);
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// ==================== Form Field Validation ====================

function validateField(input, showError = true) {
    const value = input.value.trim();
    const type = input.type;
    const name = input.name || input.id;
    let errorMessage = '';

    // Required field check
    if (input.required && !value) {
        errorMessage = 'This field is required';
    }
    // Email validation
    else if (type === 'email' && value && !validateEmail(value)) {
        errorMessage = 'Please enter a valid email address';
    }
    // Phone validation
    else if (type === 'tel' && value && !validatePhone(value)) {
        errorMessage = 'Please enter a valid phone number (10 digits)';
    }
    // Password validation
    else if (type === 'password' && value) {
        const passwordCheck = validatePassword(value);
        if (!passwordCheck.valid) {
            errorMessage = 'Password must be at least 8 characters';
        }
    }
    // Min length
    else if (input.minLength && value.length < input.minLength) {
        errorMessage = `Must be at least ${input.minLength} characters`;
    }
    // Max length
    else if (input.maxLength && value.length > input.maxLength) {
        errorMessage = `Must be no more than ${input.maxLength} characters`;
    }
    // Pattern
    else if (input.pattern && value) {
        const regex = new RegExp(input.pattern);
        if (!regex.test(value)) {
            errorMessage = input.title || 'Invalid format';
        }
    }

    // Show or hide error
    if (showError) {
        const errorElement = input.parentElement.querySelector('.field-error');
        if (errorMessage) {
            if (errorElement) {
                errorElement.textContent = errorMessage;
                errorElement.style.display = 'block';
            }
            input.classList.add('error');
            input.classList.remove('valid');
        } else if (value) {
            if (errorElement) {
                errorElement.style.display = 'none';
            }
            input.classList.remove('error');
            input.classList.add('valid');
        } else {
            if (errorElement) {
                errorElement.style.display = 'none';
            }
            input.classList.remove('error', 'valid');
        }
    }

    return !errorMessage;
}

// ==================== Authentication API ====================

async function register(userData) {
    const response = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
    });

    // Store tokens and user data
    setTokens(response.access_token, response.refresh_token);

    // Fetch full user profile
    const user = await getCurrentUser();
    setUserData(user);

    return user;
}

async function login(email, password) {
    const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });

    // Store tokens
    setTokens(response.access_token, response.refresh_token);

    // Fetch full user profile
    const user = await getCurrentUser();
    setUserData(user);

    return user;
}

async function logout() {
    clearTokens();
    window.location.href = '/';
}

async function refreshAccessToken() {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
        return false;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refresh_token: refreshToken })
        });

        if (!response.ok) {
            return false;
        }

        const data = await response.json();
        setTokens(data.access_token, refreshToken);
        return true;
    } catch (error) {
        console.error('Token refresh failed:', error);
        return false;
    }
}

async function getCurrentUser() {
    return await apiRequest('/auth/me', {
        method: 'GET'
    });
}

// ==================== Profile API ====================

async function updateProfile(updates) {
    return await apiRequest('/profile', {
        method: 'PATCH',
        body: JSON.stringify(updates)
    });
}

async function addAddress(addressData) {
    return await apiRequest('/profile/addresses', {
        method: 'POST',
        body: JSON.stringify(addressData)
    });
}

// ==================== Contractor Registration API ====================

async function uploadDocument(file, documentType) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);

    return await apiRequestFormData('/contractor/photos/document', formData);
}

async function uploadPortfolioPhoto(file) {
    const formData = new FormData();
    formData.append('file', file);

    return await apiRequestFormData('/contractor/photos/portfolio', formData);
}

// ==================== Registration Draft Management ====================

const REGISTRATION_DRAFT_KEY = 'registration_draft';

function saveRegistrationDraft(data) {
    const existing = getRegistrationDraft();
    const updated = { ...existing, ...data };
    localStorage.setItem(REGISTRATION_DRAFT_KEY, JSON.stringify(updated));
    return updated;
}

function getRegistrationDraft() {
    const data = localStorage.getItem(REGISTRATION_DRAFT_KEY);
    return data ? JSON.parse(data) : {};
}

function clearRegistrationDraft() {
    localStorage.removeItem(REGISTRATION_DRAFT_KEY);
}

// ==================== Navigation Helpers ====================

function redirectToDashboard() {
    const role = getUserRole();
    if (role === 'CUSTOMER') {
        window.location.href = '/dashboard/customer.html';
    } else if (role === 'HANDYMAN' || role === 'TECHNICIAN') {
        window.location.href = '/dashboard/contractor.html';
    } else if (role === 'ADMIN') {
        window.location.href = '/dashboard/admin.html';
    } else {
        window.location.href = '/dashboard/';
    }
}

function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = '/login/';
        return false;
    }
    return true;
}

// ==================== Form Helpers ====================

function showError(message, elementId = 'error-message', context = '') {
    // Use user-friendly error if message is an Error object
    if (message instanceof Error) {
        message = getUserFriendlyError(message, context);
    }

    const errorEl = document.getElementById(elementId);
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.style.display = 'block';
        // Scroll error into view
        errorEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
        alert(message);
    }
}

function hideError(elementId = 'error-message') {
    const errorEl = document.getElementById(elementId);
    if (errorEl) {
        errorEl.style.display = 'none';
        errorEl.textContent = '';
    }
}

function showSuccess(message, elementId = 'success-message') {
    const successEl = document.getElementById(elementId);
    if (successEl) {
        successEl.textContent = message;
        successEl.style.display = 'block';
        // Scroll success into view
        successEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

function hideSuccess(elementId = 'success-message') {
    const successEl = document.getElementById(elementId);
    if (successEl) {
        successEl.style.display = 'none';
        successEl.textContent = '';
    }
}

function showLoading(buttonId) {
    const button = document.getElementById(buttonId);
    if (button) {
        button.disabled = true;
        button.dataset.originalText = button.textContent;
        button.textContent = 'Loading...';
    }
}

function hideLoading(buttonId) {
    const button = document.getElementById(buttonId);
    if (button) {
        button.disabled = false;
        if (button.dataset.originalText) {
            button.textContent = button.dataset.originalText;
        }
    }
}

// ==================== Export for use in other scripts ====================
// These functions are now globally available
