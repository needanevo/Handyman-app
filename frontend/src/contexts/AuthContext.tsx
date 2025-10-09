import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authAPI } from '../services/api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'technician' | 'admin';
  phone: string;
  addresses: Address[];
  isActive: boolean;
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

  useEffect(() => {
    // Check for stored token on app start
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      if (token) {
        // Set the token in API client
        authAPI.setAuthToken(token);
        await refreshUser();
      }
    } catch (error) {
      console.error('Auth state check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authAPI.login({ email, password });
      
      // Store tokens securely
      await SecureStore.setItemAsync('accessToken', response.access_token);
      await SecureStore.setItemAsync('refreshToken', response.refresh_token);
      
      // Set token in API client
      authAPI.setAuthToken(response.access_token);
      
      // Fetch user data
      await refreshUser();
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
      await SecureStore.setItemAsync('accessToken', response.access_token);
      await SecureStore.setItemAsync('refreshToken', response.refresh_token);
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
        addresses: userData.addresses || [],
        isActive: userData.is_active,
      };
      
      console.log('Transformed user data:', transformedUser);
      setUser(transformedUser);
      console.log('User set in context - isAuthenticated should now be true');
      
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // If refresh fails, clear auth state
      await logout();
      throw error;
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Clear stored tokens
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
      
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
