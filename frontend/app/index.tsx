import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { LoadingSpinner } from '../src/components/LoadingSpinner';

export default function Index() {
  const { isHydrated, isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // CRITICAL: Wait for hydration to complete before attempting navigation
    // This prevents race conditions where isLoading=false but user state isn't set yet
    if (!isHydrated) {
      console.log('Waiting for auth hydration...');
      return;
    }

    console.log('Auth hydrated - isAuthenticated:', isAuthenticated, 'role:', user?.role);

    if (isAuthenticated && user) {
      // Role-based routing - redirect to appropriate dashboard
      switch (user.role) {
        case 'customer':
          console.log('Navigating to customer dashboard');
          router.replace('/(customer)/dashboard');
          break;
        case 'contractor':
          console.log('Navigating to contractor dashboard');
          router.replace('/(contractor)/dashboard');
          break;
        case 'handyman':
          console.log('Navigating to handyman dashboard');
          router.replace('/(handyman)/dashboard');
          break;
        case 'admin':
          console.log('Navigating to admin dashboard');
          router.replace('/admin');
          break;
        default:
          console.log('Unknown role - navigating to welcome');
          router.replace('/auth/welcome');
      }
    } else {
      console.log('Not authenticated - navigating to welcome');
      router.replace('/auth/welcome');
    }
  }, [isHydrated, isAuthenticated, user, router]);

  return (
    <View style={styles.container}>
      <LoadingSpinner 
        text="Initializing The Real Johnson Handyman Services..."
        fullScreen={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
