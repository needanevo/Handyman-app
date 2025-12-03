import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LoadingSpinner } from '../src/components/LoadingSpinner';

/**
 * Legacy web landing page - redirects to canonical welcome screen
 */
export default function LandingWebPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/auth/welcome');
  }, [router]);

  return (
    <View style={styles.container}>
      <LoadingSpinner text="Loading..." fullScreen={true} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
