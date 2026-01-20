import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../../src/constants/theme';
import { Button } from '../../../src/components/Button';
import { StepIndicator } from '../../../src/components/StepIndicator';
import { useAuth } from '../../../src/contexts/AuthContext';
import { authAPI } from '../../../src/services/api';

export default function HandymanRegisterStep5() {
  const router = useRouter();
  const { user, isHydrated, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [registrationConfirmed, setRegistrationConfirmed] = useState(false);

  // Redirect to dashboard ONLY after confirmation
  useEffect(() => {
    if (!registrationConfirmed) return;
    if (!isHydrated || !isAuthenticated || !user?.role) return;

    console.log('Registration confirmed - redirecting to dashboard');
    if (user.role === 'handyman') {
      router.replace('/(handyman)/dashboard');
    } else {
      router.replace('/auth/welcome');
    }
  }, [registrationConfirmed, isHydrated, isAuthenticated, user, router]);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      // Mark onboarding as complete (Phase 5B-1)
      await authAPI.completeOnboarding();
      console.log('✅ Onboarding marked as complete');
      setRegistrationConfirmed(true);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      // Still allow redirect even if API call fails
      setRegistrationConfirmed(true);
    }
  };

  const steps = [
    { label: 'Basic Info', completed: true },
    { label: 'Skills', completed: true },
    { label: 'Verification', completed: true },
    { label: 'Banking', completed: true },
    { label: 'Review', completed: false },
  ];

  const handleStepPress = (stepIndex: number) => {
    if (stepIndex === 0) router.push('/auth/handyman/register-step1');
    else if (stepIndex === 1) router.push('/auth/handyman/register-step2');
    else if (stepIndex === 2) router.push('/auth/handyman/register-step3');
    else if (stepIndex === 3) router.push('/auth/handyman/register-step4');
  };

  if (!isHydrated || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Loading your profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Button
            title=""
            onPress={() => router.back()}
            variant="ghost"
            size="small"
            icon={<Ionicons name="arrow-back" size={24} color={colors.primary.main} />}
            style={styles.backButton}
          />
        </View>

        <StepIndicator steps={steps} currentStep={4} onStepPress={handleStepPress} />

        <View style={styles.titleSection}>
          <View style={styles.iconBadge}>
            <Ionicons name="checkmark-circle" size={48} color={colors.success.main} />
          </View>
          <Text style={styles.title}>Review Your Profile</Text>
          <Text style={styles.subtitle}>
            As a handyman, you work independently on smaller jobs, building local trust and growing your reputation.
          </Text>
        </View>

        <View style={styles.reviewSection}>
          <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <Ionicons name="person" size={24} color={colors.brand.navy} />
              <Text style={styles.reviewTitle}>Personal Information</Text>
              <Button
                title="Edit"
                onPress={() => router.push('/auth/handyman/register-step1')}
                variant="ghost"
                size="small"
                style={styles.editButton}
              />
            </View>
            <Text style={styles.reviewItem}>Name: {user.firstName} {user.lastName}</Text>
            <Text style={styles.reviewItem}>Email: {user.email}</Text>
            <Text style={styles.reviewItem}>Phone: {user.phone || 'Not set'}</Text>
          </View>

          <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <Ionicons name="construct" size={24} color={colors.brand.navy} />
              <Text style={styles.reviewTitle}>Skills & Experience</Text>
              <Button
                title="Edit"
                onPress={() => router.push('/auth/handyman/register-step2')}
                variant="ghost"
                size="small"
                style={styles.editButton}
              />
            </View>
            <Text style={styles.reviewItem}>
              Skills: {user.skills && user.skills.length > 0 ? user.skills.join(', ') : 'Not set'}
            </Text>
            <Text style={styles.reviewItem}>
              Experience: {user.yearsExperience || 0} years
            </Text>
            <Text style={styles.reviewItem}>
              Business Intent: {user.providerIntent ? user.providerIntent.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) : 'Not set'}
            </Text>
          </View>

          <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <Ionicons name="location" size={24} color={colors.brand.navy} />
              <Text style={styles.reviewTitle}>Home Address</Text>
              <Button
                title="Edit"
                onPress={() => router.push('/auth/handyman/register-step2')}
                variant="ghost"
                size="small"
                style={styles.editButton}
              />
            </View>
            {user.addresses && user.addresses.length > 0 ? (
              <>
                <Text style={styles.reviewItem}>{user.addresses?.[0]?.street}</Text>
                <Text style={styles.reviewItem}>
                  {user.addresses?.[0]?.city}, {user.addresses?.[0]?.state} {user.addresses?.[0]?.zipCode}
                </Text>
              </>
            ) : (
              <Text style={styles.reviewItem}>No address set</Text>
            )}
          </View>

          <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <Ionicons name="shield-checkmark" size={24} color={colors.brand.navy} />
              <Text style={styles.reviewTitle}>Verification</Text>
              <Button
                title="Edit"
                onPress={() => router.push('/auth/handyman/register-step3')}
                variant="ghost"
                size="small"
                style={styles.editButton}
              />
            </View>
            <Text style={styles.reviewItem}>
              Phone: {(user as any).phoneVerified ? '✓ Verified' : '✗ Not verified'}
            </Text>
          </View>

          <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <Ionicons name="card" size={24} color={colors.brand.navy} />
              <Text style={styles.reviewTitle}>Banking</Text>
              <Button
                title="Edit"
                onPress={() => router.push('/auth/handyman/register-step4')}
                variant="ghost"
                size="small"
                style={styles.editButton}
              />
            </View>
            <Text style={styles.reviewItem}>
              Payment Account: {(user as any).stripeAccountId ? '✓ Connected' : '✗ Not connected'}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            title="Confirm & Enter Dashboard"
            onPress={handleConfirm}
            loading={isLoading}
            size="large"
            fullWidth
          />
          <Button
            title="Back to Banking"
            onPress={() => router.back()}
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
  header: {
    paddingTop: spacing.sm,
    marginBottom: spacing.md,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  iconBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.success.lightest,
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
  reviewSection: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  reviewCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  reviewTitle: {
    flex: 1,
    ...typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.brand.navy,
  },
  editButton: {
    minWidth: 60,
  },
  reviewItem: {
    ...typography.sizes.base,
    color: colors.neutral[700],
    marginBottom: spacing.xs,
    lineHeight: 22,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorText: {
    ...typography.sizes.lg,
    color: colors.neutral[600],
    textAlign: 'center',
  },
  actions: {
    gap: spacing.md,
  },
});
