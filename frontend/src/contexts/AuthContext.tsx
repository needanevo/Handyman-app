import React, { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from '../services/api';
import { storage } from '../utils/storage';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'technician' | 'admin';
  phone: string;
  addresses: Address[];
  isActive: boolean;
  // Contractor-specific fields (optional)
  businessName?: string;
  skills?: string[];
  yearsExperience?: number;
  serviceAreas?: string[];
  documents?: {
    license?: string;
    businessLicense?: string | string[];
    insurance?: string;
  };
  portfolioPhotos?: string[];
  profilePhoto?: string;
}

export interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isHydrated: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role?: 'customer' | 'technician' | 'admin';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Check for stored token on app start
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      console.log('Checking auth state...');
      const token = await storage.getItem('accessToken');
      console.log('Found stored token:', !!token);

      if (token) {
        // Set the token in API client
        authAPI.setAuthToken(token);
        await refreshUser();
      }
    } catch (error: any) {
      // Silently handle 401 errors (expected when token expired)
      if (error.response?.status !== 401) {
        console.error('Auth state check failed:', error);
      }
    } finally {
      setIsLoading(false);
      setIsHydrated(true);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('Starting login process...');
      
      const response = await authAPI.login({ email, password });
      console.log('Login API call successful');
      
      // Store tokens securely
      await storage.setItem('accessToken', response.access_token);
      await storage.setItem('refreshToken', response.refresh_token);
      console.log('Tokens stored securely');
      
      // Set token in API client
      authAPI.setAuthToken(response.access_token);
      console.log('Token set in API client');
      
      // Fetch user data
      await refreshUser();
      console.log('User data refreshed successfully');
      
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true);
      console.log('Starting registration process...');
      
      const response = await authAPI.register(userData);
      console.log('Registration API call successful');
      
      // Store tokens securely
      await storage.setItem('accessToken', response.access_token);
      await storage.setItem('refreshToken', response.refresh_token);
      console.log('Tokens stored securely');
      
      // Set token in API client
      authAPI.setAuthToken(response.access_token);
      console.log('Token set in API client');
      
      // Fetch user data
      await refreshUser();
      console.log('User data refreshed successfully');
      
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      console.log('Fetching user data...');
      const userData = await authAPI.getCurrentUser();
      console.log('Raw user data from API:', userData);
      
      // Transform backend data (snake_case) to frontend format (camelCase)
      const transformedUser: User = {
        id: userData.id,
        email: userData.email,
        firstName: userData.first_name,
        lastName: userData.last_name,
        role: userData.role,
        phone: userData.phone,
        addresses: userData.addresses?.map((addr: any) => ({
          id: addr.id,
          street: addr.street,
          city: addr.city,
          state: addr.state,
          zipCode: addr.zip_code,  // Transform snake_case to camelCase
          latitude: addr.latitude,
          longitude: addr.longitude,
          isDefault: addr.is_default,  // Transform snake_case to camelCase
        })) || [],
        isActive: userData.is_active,
        // Contractor-specific fields
        businessName: userData.business_name,
        skills: userData.skills,
        yearsExperience: userData.years_experience,
        serviceAreas: userData.service_areas,
        documents: userData.documents ? {
          license: userData.documents.license,
          businessLicense: userData.documents.business_license,
          insurance: userData.documents.insurance,
        } : undefined,
        portfolioPhotos: userData.portfolio_photos,
        profilePhoto: userData.profile_photo,
      };

      console.log('Transformed user data:', transformedUser);
      setUser(transformedUser);
      console.log('User set in context - isAuthenticated should now be true');
      
    } catch (error: any) {
      // Silently handle 401 errors (expected when auth fails)
      if (error.response?.status !== 401) {
        console.error('Failed to refresh user:', error);
      }
      // If refresh fails, clear auth state
      await logout();
      throw error;
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Clear stored tokens
      await storage.removeItem('accessToken');
      await storage.removeItem('refreshToken');
      
      // Clear API token
      authAPI.clearAuthToken();
      
      // Clear user state
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isHydrated,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
