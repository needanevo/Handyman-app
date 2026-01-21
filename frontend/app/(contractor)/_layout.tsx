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

    // Onboarding guard: Check actual field completeness, not just onboardingCompleted flag
    if (!user.onboardingCompleted) {
      // Check which fields are actually filled
      const hasSkills = user.skills && user.skills.length > 0;
      const hasExperience = user.yearsExperience != null;
      const hasAddress = user.addresses && user.addresses.length > 0;
      const hasBanking = (user as any).banking_info != null;

      console.log('[Contractor Layout] Completeness check:', {
        hasSkills,
        hasExperience,
        hasAddress,
        hasBanking,
        onboardingCompleted: user.onboardingCompleted
      });

      // Determine first incomplete step based on actual data
      if (!hasSkills || !hasExperience || !hasAddress) {
        // Step 2 incomplete - need skills, experience, and address
        console.log('[Contractor Layout] Redirecting to step 2 (skills/experience/address missing)');
        router.replace('/auth/contractor/register-step2' as any);
        return;
      } else if (!hasBanking) {
        // Step 4 incomplete - need banking info
        console.log('[Contractor Layout] Redirecting to step 4 (banking missing)');
        router.replace('/auth/contractor/register-step4' as any);
        return;
      } else {
        // All fields filled but not marked complete - go to review
        console.log('[Contractor Layout] Redirecting to step 5 (review and confirm)');
        router.replace('/auth/contractor/register-step5' as any);
        return;
      }
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
