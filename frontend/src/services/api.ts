import axios, { AxiosInstance, AxiosResponse } from 'axios';
import Constants from 'expo-constants';

// Get backend URL from environment
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';

class APIClient {
  private client: AxiosInstance;
  private authToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: `${BACKEND_URL}/api`,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use((config) => {
      if (this.authToken) {
        config.headers.Authorization = `Bearer ${this.authToken}`;
      }
      return config;
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - could trigger logout
          this.clearAuthToken();
        }
        return Promise.reject(error);
      }
    );
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  clearAuthToken() {
    this.authToken = null;
  }

  // Generic request methods
  async get<T>(url: string, params?: any): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url);
    return response.data;
  }
}

// Create API client instance
const apiClient = new APIClient();

// Authentication API
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    apiClient.post<{ access_token: string; refresh_token: string; token_type: string }>('/auth/login', credentials),
  
  register: (userData: any) =>
    apiClient.post<{ access_token: string; refresh_token: string; token_type: string }>('/auth/register', userData),
  
  getCurrentUser: () => apiClient.get<any>('/auth/me'),
  
  setAuthToken: (token: string) => apiClient.setAuthToken(token),
  
  clearAuthToken: () => apiClient.clearAuthToken(),
};

// Services API
export const servicesAPI = {
  getServices: (category?: string) => 
    apiClient.get<any[]>('/services', category ? { category } : undefined),
  
  getService: (id: string) => 
    apiClient.get<any>(`/services/${id}`),
};

// Quotes API
export const quotesAPI = {
  requestQuote: (quoteData: any) => 
    apiClient.post<any>('/quotes/request', quoteData),
  
  getQuotes: (status?: string) => 
    apiClient.get<any[]>('/quotes', status ? { status_filter: status } : undefined),
  
  getQuote: (id: string) => 
    apiClient.get<any>(`/quotes/${id}`),
  
  respondToQuote: (id: string, response: { accept: boolean; customer_notes?: string }) => 
    apiClient.post<any>(`/quotes/${id}/respond`, response),
};

// Profile API
export const profileAPI = {
  addAddress: (address: any) => 
    apiClient.post<any>('/profile/addresses', address),
  
  getAddresses: () => 
    apiClient.get<any[]>('/profile/addresses'),
};

// Health check
export const healthAPI = {
  check: () => apiClient.get<{ status: string; timestamp: string }>('/health'),
};

export default apiClient;
