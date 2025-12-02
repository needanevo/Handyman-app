import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { LoadingSpinner } from '../src/components/LoadingSpinner';

export default function Index() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('Index useEffect - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated, 'role:', user?.role);

    if (!isLoading) {
      if (isAuthenticated && user) {
        // Role-based routing - redirect to appropriate dashboard
        switch (user.role) {
          case 'customer':
            console.log('User is authenticated customer - navigating to customer dashboard');
            router.replace('/(customer)/dashboard');
            break;
          case 'technician':
            console.log('User is authenticated contractor/technician - navigating to contractor dashboard');
            router.replace('/(contractor)/dashboard');
            break;
          case 'handyman':
            console.log('User is authenticated handyman - navigating to handyman dashboard');
            router.replace('/(handyman)/dashboard');
            break;
          case 'admin':
            console.log('User is authenticated admin - navigating to admin dashboard');
            router.replace('/admin');
            break;
          default:
            console.log('Unknown role - navigating to welcome');
            router.replace('/auth/welcome');
        }
      } else {
        console.log('User is not authenticated - navigating to welcome');
        router.replace('/auth/welcome');
      }
    } else {
      console.log('Still loading...');
    }
  }, [isLoading, isAuthenticated, user, router]);

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
