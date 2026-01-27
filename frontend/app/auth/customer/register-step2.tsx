import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../../src/constants/theme';
import { Button } from '../../../src/components/Button';
import { PhotoUploader } from '../../../src/components/PhotoUploader';
import { Card } from '../../../src/components/Card';
import { useAuth } from '../../../src/contexts/AuthContext';
import { customerAPI } from '../../../src/services/api';

export default function CustomerRegisterStep2() {
  const router = useRouter();
  const { user, isHydrated, isAuthenticated, refreshUser } = useAuth();
  const [profilePhoto, setProfilePhoto] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Pre-fill existing photo if editing
  useEffect(() => {
    if (user?.profilePhoto) {
      setProfilePhoto([user.profilePhoto]);
    }
  }, [user]);

  // Redirect if not authenticated
  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isHydrated, isAuthenticated, router]);

  const onContinue = async () => {
    try {
      setIsLoading(true);

      // Photo is uploaded via PhotoUploader's customUpload
      // Just refresh user to get updated photo URL
      await refreshUser();

      // Navigate to customer dashboard
      router.replace('/(customer)/dashboard');
    } catch (error: any) {
      console.error('Failed to complete registration:', error);
      Alert.alert(
        'Error',
        error.response?.data?.detail || 'Failed to complete registration. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onSkip = () => {
    // Allow skipping profile photo - go directly to dashboard
    router.replace('/(customer)/dashboard');
  };

  if (!isHydrated || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconBadge}>
            <Ionicons name="camera" size={32} color={colors.primary.main} />
          </View>
          <Text style={styles.title}>Add Your Profile Photo</Text>
          <Text style={styles.subtitle}>
            Help service providers recognize you when they arrive at your location.
          </Text>
        </View>

        {/* Photo Upload */}
        <View style={styles.photoSection}>
          <PhotoUploader
            photos={profilePhoto}
            onPhotosChange={setProfilePhoto}
            maxPhotos={1}
            label="Take or upload photo"
            customUpload={async (file: { uri: string; type: string; name: string }) => {
              const response = await customerAPI.uploadProfilePhoto(file);
              return response;
            }}
          />
        </View>

        {/* Info Card */}
        <Card variant="flat" padding="base" style={styles.infoCard}>
          <View style={styles.infoContent}>
            <Ionicons name="shield-checkmark" size={24} color={colors.success.main} />
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>Your photo is secure</Text>
              <Text style={styles.infoDescription}>
                Your profile photo is only visible to service providers you book with.
              </Text>
            </View>
          </View>
        </Card>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Continue to Dashboard"
            onPress={onContinue}
            loading={isLoading}
            size="large"
            fullWidth
          />
          <Button
            title="Skip Photo"
            onPress={onSkip}
            variant="outline"
            size="medium"
            fullWidth
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['2xl'],
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...typography.sizes.lg,
    color: colors.neutral[600],
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing['2xl'],
    marginBottom: spacing['2xl'],
  },
  iconBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary.lightest,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.sizes.base,
    color: colors.neutral[600],
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.lg,
  },
  photoSection: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  infoCard: {
    marginBottom: spacing.xl,
    backgroundColor: colors.success.lightest,
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  infoDescription: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    lineHeight: 20,
  },
  actions: {
    gap: spacing.md,
    paddingTop: spacing.xl,
  },
});
