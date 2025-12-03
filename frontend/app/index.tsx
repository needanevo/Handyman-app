import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { LoadingSpinner } from '../src/components/LoadingSpinner';

export default function Index() {
  const { isHydrated, isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('Index useEffect - isHydrated:', isHydrated, 'isAuthenticated:', isAuthenticated);

    if (!isHydrated) {
      console.log('Still hydrating...');
      return;
    }

    if (isAuthenticated && user) {
      // Role-based routing
      if (user.role === 'technician') {
        console.log('User is authenticated contractor - navigating to contractor dashboard');
        router.replace('/(contractor)/dashboard');
      } else if (user.role === 'customer') {
        console.log('User is authenticated customer - navigating to customer dashboard');
        router.replace('/(customer)/dashboard');
      } else if (user.role === 'admin') {
        console.log('User is admin - navigating to admin dashboard');
        router.replace('/admin');
      } else {
        console.log('User is authenticated - navigating to home');
        router.replace('/home');
      }
    } else {
      console.log('User is not authenticated - navigating to welcome');
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
