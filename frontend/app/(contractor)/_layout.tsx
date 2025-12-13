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

    // Role guard: ONLY contractors can access contractor routes
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

    if (user?.role === 'admin') {
      // Redirect admins to admin dashboard
      router.replace('/admin' as any);
      return;
    }

    // If role is not contractor, redirect to welcome
    if (user?.role !== 'contractor') {
      router.replace('/auth/welcome');
      return;
    }
  }, [user, isHydrated, isAuthenticated, router]);

  // Show loading state while hydrating
  if (!isHydrated) {
    return <LoadingSpinner fullScreen />;
  }

  // Show loading state while redirecting non-contractors
  if (!isAuthenticated || user?.role !== 'contractor') {
    return <LoadingSpinner fullScreen />;
  }

  // Role matches - render contractor routes
  return <Slot />;
}
