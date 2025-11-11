import axios, { AxiosInstance, AxiosResponse } from 'axios';
import Constants from 'expo-constants';

// Get backend URL from environment
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'https://therealjohnson.com';

class APIClient {
  private client: AxiosInstance;
  private authToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: `${BACKEND_URL}/api`,
      timeout: 30000,
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

  async postFormData<T>(url: string, formData: FormData): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000,
    });
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
  
// NEW METHOD: Upload photo immediately
  uploadPhotoImmediate: async (file: { uri: string; type: string; name: string }, customer_id: string) => {
    // Use fetch instead of axios for React Native file uploads
    // React Native's FormData works properly with fetch but not with axios
    const formData = new FormData();
    
    formData.append('file', {
      uri: file.uri,
      type: file.type || 'image/jpeg',
      name: file.name || 'photo.jpg',
    } as any);
    
    formData.append('customer_id', customer_id);
    
    // Get auth token
    const token = await apiClient.getAuthToken();
    
    // Use fetch for file upload (works better with React Native FormData)
    const response = await fetch(`${BACKEND_URL}/api/photos/upload`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        // Don't set Content-Type - let browser/React Native set it with boundary
      },
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(error.detail || 'Failed to upload photo');
    }
    
    return response.json();
  },
  
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

// Contractor API
export const contractorAPI = {
  // Dashboard stats
  getDashboardStats: () => apiClient.get<any>('/contractor/dashboard/stats'),

  // Jobs
  getAvailableJobs: (filters?: any) =>
    apiClient.get<any[]>('/contractor/jobs/available', filters),

  getAcceptedJobs: () =>
    apiClient.get<any[]>('/contractor/jobs/accepted'),

  getScheduledJobs: () =>
    apiClient.get<any[]>('/contractor/jobs/scheduled'),

  getCompletedJobs: (filters?: { startDate?: string; endDate?: string }) =>
    apiClient.get<any[]>('/contractor/jobs/completed', filters),

  getJob: (id: string) =>
    apiClient.get<any>(`/contractor/jobs/${id}`),

  acceptJob: (id: string) =>
    apiClient.post<any>(`/contractor/jobs/${id}/accept`, {}),

  updateJobStatus: (id: string, status: string) =>
    apiClient.put<any>(`/contractor/jobs/${id}/status`, { status }),

  // Job Photos
  uploadJobPhoto: async (jobId: string, photo: {
    uri: string;
    type: string;
    name: string;
    category: string;
    caption?: string;
    notes?: string;
  }) => {
    const formData = new FormData();
    formData.append('file', {
      uri: photo.uri,
      type: photo.type,
      name: photo.name,
    } as any);
    formData.append('category', photo.category);
    if (photo.caption) formData.append('caption', photo.caption);
    if (photo.notes) formData.append('notes', photo.notes);

    return apiClient.postFormData<any>(`/contractor/jobs/${jobId}/photos`, formData);
  },

  getJobPhotos: (jobId: string, category?: string) =>
    apiClient.get<any[]>(`/contractor/jobs/${jobId}/photos`, category ? { category } : undefined),

  deleteJobPhoto: (jobId: string, photoId: string) =>
    apiClient.delete<any>(`/contractor/jobs/${jobId}/photos/${photoId}`),

  updatePhotoCaption: (jobId: string, photoId: string, caption: string, notes?: string) =>
    apiClient.put<any>(`/contractor/jobs/${jobId}/photos/${photoId}`, { caption, notes }),

  // Expenses
  getExpenses: (jobId?: string) =>
    apiClient.get<any[]>('/contractor/expenses', jobId ? { job_id: jobId } : undefined),

  addExpense: (expense: {
    jobId: string;
    category: string;
    description: string;
    amount: number;
    date: string;
    vendor?: string;
    notes?: string;
  }) => apiClient.post<any>('/contractor/expenses', expense),

  uploadReceiptPhoto: async (expenseId: string, photo: { uri: string; type: string; name: string }) => {
    const formData = new FormData();
    formData.append('file', {
      uri: photo.uri,
      type: photo.type,
      name: photo.name,
    } as any);

    return apiClient.postFormData<any>(`/contractor/expenses/${expenseId}/receipt`, formData);
  },

  deleteExpense: (id: string) =>
    apiClient.delete<any>(`/contractor/expenses/${id}`),

  // Mileage
  getMileageLogs: (filters?: { startDate?: string; endDate?: string; jobId?: string }) =>
    apiClient.get<any[]>('/contractor/mileage', filters),

  addMileageLog: (log: {
    jobId?: string;
    date: string;
    startLocation: { address: string; latitude: number; longitude: number };
    endLocation: { address: string; latitude: number; longitude: number };
    miles: number;
    purpose: string;
    notes?: string;
    autoTracked: boolean;
  }) => apiClient.post<any>('/contractor/mileage', log),

  deleteMileageLog: (id: string) =>
    apiClient.delete<any>(`/contractor/mileage/${id}`),

  // Time logs
  startTimeLog: (jobId: string, notes?: string) =>
    apiClient.post<any>(`/contractor/jobs/${jobId}/time/start`, { notes }),

  stopTimeLog: (jobId: string, timeLogId: string, notes?: string) =>
    apiClient.post<any>(`/contractor/jobs/${jobId}/time/${timeLogId}/stop`, { notes }),

  getTimeLogs: (jobId: string) =>
    apiClient.get<any[]>(`/contractor/jobs/${jobId}/time`),

  // Reports
  getMonthlyReport: (year: number, month: number) =>
    apiClient.get<any>('/contractor/reports/monthly', { year, month }),

  getYearlyReport: (year: number) =>
    apiClient.get<any>('/contractor/reports/yearly', { year }),

  getTaxReport: (startDate: string, endDate: string) =>
    apiClient.get<any>('/contractor/reports/tax', { start_date: startDate, end_date: endDate }),

  // Export reports as PDF (returns blob)
  exportTaxReportPDF: (startDate: string, endDate: string) =>
    apiClient.get<any>('/contractor/reports/tax/pdf', { start_date: startDate, end_date: endDate }),
};

// Health check
export const healthAPI = {
  check: () => apiClient.get<{ status: string; timestamp: string }>('/health'),
};

export default apiClient;