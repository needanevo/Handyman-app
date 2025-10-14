import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { LoadingSpinner } from '../src/components/LoadingSpinner';

export default function Index() {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('Index useEffect - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);
    
    if (!isLoading) {
      if (isAuthenticated) {
        console.log('User is authenticated - navigating to home');
        router.replace('/home');
      } else {
        console.log('User is not authenticated - navigating to welcome');
        router.replace('/auth/welcome');
      }
    } else {
      console.log('Still loading...');
    }
  }, [isLoading, isAuthenticated, router]);

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
