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

  async patch<T>(url: string, data?: any): Promise<T> {
    const response: AxiosResponse<T> = await this.client.patch(url, data);
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
    const formData = new FormData();

    // iOS/Android require the file object to have specific structure
    // Ensure URI has proper format for native platforms
    let fileUri = file.uri;

    // On iOS, if URI doesn't start with file://, ensure it's properly formatted
    if (!fileUri.startsWith('file://') && !fileUri.startsWith('http://') && !fileUri.startsWith('https://')) {
      fileUri = `file://${fileUri}`;
    }

    // Create proper file object for React Native FormData
    const fileToUpload: any = {
      uri: fileUri,
      type: file.type || 'image/jpeg', // Ensure type is always set
      name: file.name || 'photo.jpg',   // Ensure name is always set
    };

    formData.append('file', fileToUpload);
    formData.append('customer_id', customer_id);

    return apiClient.postFormData<any>('/photos/upload', formData);
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
    // iOS/Android require proper URI format
    let fileUri = photo.uri;
    if (!fileUri.startsWith('file://') && !fileUri.startsWith('http://') && !fileUri.startsWith('https://')) {
      fileUri = `file://${fileUri}`;
    }

    formData.append('file', {
      uri: fileUri,
      type: photo.type || 'image/jpeg',
      name: photo.name || 'photo.jpg',
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
    // iOS/Android require proper URI format
    let fileUri = photo.uri;
    if (!fileUri.startsWith('file://') && !fileUri.startsWith('http://') && !fileUri.startsWith('https://')) {
      fileUri = `file://${fileUri}`;
    }

    formData.append('file', {
      uri: fileUri,
      type: photo.type || 'image/jpeg',
      name: photo.name || 'photo.jpg',
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

  // Contractor Registration & Profile
  updateDocuments: (documents: {
    license?: string;
    business_license?: string[];
    insurance?: string;
  }) => apiClient.patch<any>('/contractors/documents', documents),

  updatePortfolio: (portfolio_photos: string[]) =>
    apiClient.patch<any>('/contractors/portfolio', { portfolio_photos }),

  updateProfile: (profile_data: {
    skills?: string[];
    years_experience?: number;
    business_name?: string;
  }) => apiClient.patch<any>('/contractors/profile', profile_data),

  // Contractor photo uploads (new proper folder structure)
  uploadDocument: (file: { uri: string; type: string; name: string }, documentType: 'license' | 'insurance' | 'business_license') => {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri.startsWith('file://') ? file.uri : `file://${file.uri}`,
      type: file.type || 'image/jpeg',
      name: file.name || 'document.jpg',
    } as any);
    formData.append('document_type', documentType);
    return apiClient.postFormData<any>('/contractor/photos/document', formData);
  },

  uploadPortfolioPhoto: (file: { uri: string; type: string; name: string }) => {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri.startsWith('file://') ? file.uri : `file://${file.uri}`,
      type: file.type || 'image/jpeg',
      name: file.name || 'portfolio.jpg',
    } as any);
    return apiClient.postFormData<any>('/contractor/photos/portfolio', formData);
  },

  uploadJobPhoto: (jobId: string, file: { uri: string; type: string; name: string }) => {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri.startsWith('file://') ? file.uri : `file://${file.uri}`,
      type: file.type || 'image/jpeg',
      name: file.name || 'job_photo.jpg',
    } as any);
    return apiClient.postFormData<any>(`/contractor/photos/job/${jobId}`, formData);
  },
};

// Health check
export const healthAPI = {
  check: () => apiClient.get<{ status: string; timestamp: string }>('/health'),
};

export default apiClient;