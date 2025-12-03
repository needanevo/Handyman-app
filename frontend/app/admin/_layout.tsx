/**
 * Admin Routes Layout Guard
 *
 * Prevents non-admin users from accessing admin-only routes.
 * Redirects users to their appropriate role-based dashboards.
 */

import React, { useEffect } from 'react';
import { Slot, useRouter } from 'expo-router';
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

    // Role guard: only admins can access admin routes
    if (user?.role === 'customer') {
      // Redirect customers to customer dashboard
      router.replace('/(customer)/dashboard');
      return;
    }

    if (user?.role === 'technician' || user?.role === 'handyman') {
      // Redirect contractors/handymen to contractor dashboard
      router.replace('/(contractor)/dashboard');
      return;
    }

    // If role is not admin, redirect to welcome
    if (user?.role !== 'admin') {
      router.replace('/auth/welcome');
      return;
    }
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
