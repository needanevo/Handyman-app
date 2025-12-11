/**
 * Profile Route Redirect
 *
 * Redirects to appropriate role-based profile page
 */

import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { LoadingSpinner } from '../src/components';

export default function ProfileRedirect() {
  const { user, isHydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isHydrated) return;

    // Redirect based on role
    if (user?.role === 'customer') {
      router.replace('/(customer)/profile');
    } else if (user?.role === 'technician') {
      router.replace('/(contractor)/profile');
    } else if (user?.role === 'handyman') {
      router.replace('/(handyman)/profile');
    } else if (user?.role === 'admin') {
      router.replace('/admin');
    } else {
      router.replace('/auth/welcome');
    }
  }, [user, isHydrated, router]);

  return <LoadingSpinner fullScreen />;
}
