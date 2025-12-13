/**
 * Handyman Routes Layout Guard
 *
 * Prevents non-handyman users from accessing handyman-only routes.
 * Redirects customers to customer dashboard.
 */

import React, { useEffect } from 'react';
import { Slot, useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { LoadingSpinner } from '../../src/components';

export default function HandymanLayout() {
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

    // Role guard: ONLY handymen can access handyman routes
    if (user?.role === 'customer') {
      // Redirect customers to customer dashboard
      router.replace('/(customer)/dashboard');
      return;
    }

    if (user?.role === 'contractor') {
      // Redirect contractors to contractor dashboard
      router.replace('/(contractor)/dashboard');
      return;
    }

    if (user?.role === 'admin') {
      // Redirect admins to admin dashboard
      router.replace('/admin');
      return;
    }

    // If role is not handyman, redirect to welcome
    if (user?.role !== 'handyman') {
      router.replace('/auth/welcome');
      return;
    }
  }, [user, isHydrated, isAuthenticated, router]);

  // Show loading state while hydrating
  if (!isHydrated) {
    return <LoadingSpinner fullScreen />;
  }

  // Show loading state while redirecting non-handymen
  if (!isAuthenticated || user?.role !== 'handyman') {
    return <LoadingSpinner fullScreen />;
  }

  // Role matches - render handyman routes
  return <Slot />;
}
