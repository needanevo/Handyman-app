import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LoadingSpinner } from '../src/components/LoadingSpinner';

/**
 * Legacy contractor beta recruitment page - redirects to provider type selection
 */
export default function ContractorBeta() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/auth/provider-type');
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
