/**
 * Customer Role Guard Layout
 * Ensures only authenticated customers can access customer routes
 */

import React, { useEffect } from 'react';
import { Slot, useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { View, StyleSheet } from 'react-native';
import { LoadingSpinner } from '../../src/components/LoadingSpinner';

export default function CustomerLayout() {
  const { isHydrated, isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isHydrated) {
      // Wait for auth state to hydrate
      return;
    }

    if (!isAuthenticated) {
      // Not authenticated - redirect to login
      console.log('Customer route accessed without auth - redirecting to welcome');
      router.replace('/auth/welcome');
      return;
    }

    if (user?.role !== 'customer') {
      // Wrong role - redirect to correct dashboard
      console.log('Non-customer tried to access customer route - redirecting');
      if (user?.role === 'technician') {
        router.replace('/(contractor)/dashboard');
      } else if (user?.role === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/');
      }
    }
  }, [isHydrated, isAuthenticated, user, router]);

  // Show loading while hydrating
  if (!isHydrated) {
    return (
      <View style={styles.container}>
        <LoadingSpinner fullScreen />
      </View>
    );
  }

  // Show loading while redirecting
  if (!isAuthenticated || user?.role !== 'customer') {
    return (
      <View style={styles.container}>
        <LoadingSpinner fullScreen />
      </View>
    );
  }

  // Render customer routes
  return <Slot />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
