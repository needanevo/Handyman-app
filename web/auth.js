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

    const config = {
        ...options,
        headers
    };

    try {
        const response = await fetch(url, config);

        // Handle 401 Unauthorized - token expired
        if (response.status === 401) {
            // Try to refresh token
            const refreshed = await refreshAccessToken();
            if (refreshed) {
                // Retry original request with new token
                headers['Authorization'] = `Bearer ${getAccessToken()}`;
                const retryResponse = await fetch(url, { ...config, headers });
                if (!retryResponse.ok) {
                    throw new Error(`HTTP ${retryResponse.status}: ${retryResponse.statusText}`);
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
            throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
}

async function apiRequestFormData(endpoint, formData) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {};

    const token = getAccessToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: formData
        });

        if (response.status === 401) {
            const refreshed = await refreshAccessToken();
            if (refreshed) {
                headers['Authorization'] = `Bearer ${getAccessToken()}`;
                const retryResponse = await fetch(url, {
                    method: 'POST',
                    headers,
                    body: formData
                });
                if (!retryResponse.ok) {
                    throw new Error(`HTTP ${retryResponse.status}: ${retryResponse.statusText}`);
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
            throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API FormData Request Error:', error);
        throw error;
    }
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

function showError(message, elementId = 'error-message') {
    const errorEl = document.getElementById(elementId);
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.style.display = 'block';
    } else {
        alert(message);
    }
}

function hideError(elementId = 'error-message') {
    const errorEl = document.getElementById(elementId);
    if (errorEl) {
        errorEl.style.display = 'none';
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
