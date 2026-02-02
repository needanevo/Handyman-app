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

    // Onboarding guard: Check actual field completeness, not just onboardingCompleted flag
    if (!user.onboardingCompleted) {
      console.log('[Handyman Layout] Onboarding not complete, checking fields...');
      console.log('[Handyman Layout] User data:', {
        skills: user.skills,
        yearsExperience: user.yearsExperience,
        addresses: user.addresses,
        banking_info: (user as any).banking_info
      });

      // Check which fields are actually filled
      const hasSkills = user.skills && user.skills.length > 0;
      const hasExperience = user.yearsExperience != null;
      const hasAddress = user.addresses && user.addresses.length > 0;
      const hasBanking = (user as any).banking_info != null;

      console.log('[Handyman Layout] Completeness check:', {
        hasSkills,
        hasExperience,
        hasAddress,
        hasBanking,
        onboardingCompleted: user.onboardingCompleted
      });

      // Determine first incomplete step based on actual data
      if (!hasSkills || !hasExperience || !hasAddress) {
        // Step 2 incomplete - need skills, experience, and address
        console.log('[Handyman Layout] → Redirecting to step 2 (skills/experience/address missing)');
        router.replace('/auth/handyman/register-step2' as any);
        return;
      } else if (!hasBanking) {
        // Step 4 incomplete - need banking info
        console.log('[Handyman Layout] → Redirecting to step 4 (banking missing)');
        router.replace('/auth/handyman/register-step4' as any);
        return;
      } else {
        // All fields filled but not marked complete - go to review
        console.log('[Handyman Layout] → Redirecting to step 5 (review and confirm)');
        router.replace('/auth/handyman/register-step5' as any);
        return;
      }
    }

    console.log('[Handyman Layout] Onboarding complete, allowing dashboard access');
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
