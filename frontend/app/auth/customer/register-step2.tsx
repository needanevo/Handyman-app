import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../../src/constants/theme';
import { Button } from '../../../src/components/Button';
import { PhotoUploader } from '../../../src/components/PhotoUploader';
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

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
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
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              Profile Photo <Text style={styles.requiredLabel}>*</Text>
            </Text>
            <Text style={styles.sectionHelp}>
              Your profile photo is required so contractors and handymen can verify your identity when they arrive at your location. This photo cannot be changed after registration.
            </Text>
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

          {/* Actions - Always visible */}
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['2xl'],
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
  section: {
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  sectionHelp: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    marginBottom: spacing.md,
  },
  requiredLabel: {
    color: colors.error.main,
  },
  actions: {
    gap: spacing.md,
  },
});
