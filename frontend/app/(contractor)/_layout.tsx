/**
 * Contractor Routes Layout Guard
 *
 * Prevents non-contractor users from accessing contractor-only routes.
 * Redirects customers to customer dashboard.
 */

import React, { useEffect } from 'react';
import { Slot, useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { LoadingSpinner } from '../../src/components';

export default function ContractorLayout() {
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

    // Role guard: only technicians and handymen can access contractor routes
    if (user?.role === 'customer') {
      // Redirect customers to customer dashboard
      router.replace('/(customer)/dashboard');
      return;
    }

    if (user?.role === 'admin') {
      // Redirect admins to admin dashboard
      router.replace('/admin' as any);
      return;
    }

    // If role is not technician or handyman, redirect to welcome
    if (user?.role !== 'technician' && user?.role !== 'handyman') {
      router.replace('/auth/welcome');
      return;
    }
  }, [user, isHydrated, isAuthenticated, router]);

  // Show loading state while hydrating
  if (!isHydrated) {
    return <LoadingSpinner fullScreen />;
  }

  // Show loading state while redirecting non-contractors
  if (!isAuthenticated || (user?.role !== 'technician' && user?.role !== 'handyman')) {
    return <LoadingSpinner fullScreen />;
  }

  // Role matches - render contractor routes
  return <Slot />;
}
