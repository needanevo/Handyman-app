/**
 * Customer Routes Layout Guard
 *
 * Prevents non-customer users from accessing customer-only routes.
 * Redirects contractors/handymen to their appropriate dashboards.
 */

import React, { useEffect } from 'react';
import { Slot, useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { LoadingSpinner } from '../../src/components';

export default function CustomerLayout() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth to finish loading
    if (isLoading) return;

    // If not authenticated, redirect to welcome
    if (!isAuthenticated) {
      router.replace('/auth/welcome');
      return;
    }

    // Role guard: only customers can access customer routes
    if (user?.role === 'technician' || user?.role === 'handyman') {
      // Redirect contractors/handymen to contractor dashboard
      router.replace('/(contractor)/dashboard');
      return;
    }

    if (user?.role === 'admin') {
      // Redirect admins to admin dashboard
      router.replace('/admin');
      return;
    }

    // If role is not customer, technician, handyman, or admin, redirect to welcome
    if (user?.role !== 'customer') {
      router.replace('/auth/welcome');
      return;
    }
  }, [user, isLoading, isAuthenticated, router]);

  // Show loading state while checking auth
  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  // Show loading state while redirecting non-customers
  if (!isAuthenticated || user?.role !== 'customer') {
    return <LoadingSpinner fullScreen />;
  }

  // Role matches - render customer routes
  return <Slot />;
}
