/**
 * Admin Routes Layout Guard
 *
 * Prevents non-admin users from accessing admin-only routes.
 * Security critical: This is the gate that protects admin functionality.
 */

import React, { useEffect } from 'react';
import { Slot } from 'expo-router';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { LoadingSpinner } from '../../src/components';

export default function AdminLayout() {
  const { user, isHydrated, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth hydration to complete
    if (!isHydrated) return;

    // If not authenticated, redirect to welcome
    if (!isAuthenticated) {
      router.replace('/auth/welcome');
      return;
    }

    // Role guard: ONLY admins can access admin routes
    if (user?.role === 'customer') {
      // Redirect customers to customer dashboard
      router.replace('/(customer)/dashboard');
      return;
    }

    if (user?.role === 'handyman') {
      // Redirect handymen to handyman dashboard
      router.replace('/(handyman)/dashboard');
      return;
    }

    if (user?.role === 'contractor') {
      // Redirect contractors to contractor dashboard
      router.replace('/(contractor)/dashboard');
      return;
    }

    // If role is not admin, redirect to welcome
    if (user?.role !== 'admin') {
      router.replace('/auth/welcome');
      return;
    }

    // Admin access granted
    console.log('[Admin Layout] Admin access granted for user:', user?.email);
  }, [user, isHydrated, isAuthenticated, router]);

  // Show loading state while hydrating
  if (!isHydrated) {
    return <LoadingSpinner fullScreen />;
  }

  // Show loading state while redirecting non-admins
  if (!isAuthenticated || user?.role !== 'admin') {
    return <LoadingSpinner fullScreen />;
  }

  // Role matches - render admin routes
  return <Slot />;
}
