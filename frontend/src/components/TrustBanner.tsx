/**
 * TrustBanner Component (Phase 5B-2)
 *
 * Displays provider readiness status banners:
 * - draft: "Complete Your Profile" with completeness %
 * - submitted: "Verification Pending"
 * - restricted: "Account Restricted" with verification action
 * - active: hidden (no banner)
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../constants/theme';

interface TrustBannerProps {
  providerStatus: string;
  providerCompleteness: number;
  addressVerificationStatus?: string;
  addressVerificationDeadline?: string;
  role: string;
}

export function TrustBanner({
  providerStatus,
  providerCompleteness,
  addressVerificationStatus,
  addressVerificationDeadline,
  role,
}: TrustBannerProps) {
  const router = useRouter();

  if (providerStatus === 'active') {
    return null;
  }

  const getOnboardingPath = () => {
    if (role === 'handyman') {
      return '/auth/contractor/register-step2' as const;
    }
    return '/auth/contractor/register-step2' as const;
  };

  const getDaysRemaining = () => {
    if (!addressVerificationDeadline) return null;
    const deadline = new Date(addressVerificationDeadline);
    const now = new Date();
    const diff = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  if (providerStatus === 'draft') {
    return (
      <TouchableOpacity
        style={[styles.banner, styles.draftBanner]}
        onPress={() => router.push(getOnboardingPath())}
        activeOpacity={0.8}
      >
        <Ionicons name="information-circle" size={22} color={colors.warning.main} />
        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>Complete Your Profile</Text>
          <Text style={styles.bannerMessage}>
            {providerCompleteness}% complete — finish setup to start accepting jobs.
          </Text>
        </View>
        <View style={styles.bannerAction}>
          <Text style={styles.bannerActionText}>Resume</Text>
          <Ionicons name="arrow-forward" size={14} color={colors.primary.main} />
        </View>
      </TouchableOpacity>
    );
  }

  if (providerStatus === 'submitted') {
    return (
      <View style={[styles.banner, styles.submittedBanner]}>
        <Ionicons name="time" size={22} color={colors.primary.main} />
        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>Verification Pending</Text>
          <Text style={styles.bannerMessage}>
            Your profile is under review. You'll be notified when verification is complete.
          </Text>
        </View>
      </View>
    );
  }

  if (providerStatus === 'restricted') {
    const daysLeft = getDaysRemaining();
    return (
      <TouchableOpacity
        style={[styles.banner, styles.restrictedBanner]}
        onPress={() => router.push('/(contractor)/profile')}
        activeOpacity={0.8}
      >
        <Ionicons name="alert-circle" size={22} color={colors.error.main} />
        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>Account Restricted</Text>
          <Text style={styles.bannerMessage}>
            {addressVerificationStatus === 'pending' && daysLeft !== null
              ? `Address verification required. ${daysLeft > 0 ? `${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining.` : 'Deadline passed.'}`
              : 'Your account has been restricted. Please complete verification to continue.'}
          </Text>
        </View>
        <View style={styles.bannerAction}>
          <Text style={styles.bannerActionText}>Verify</Text>
          <Ionicons name="arrow-forward" size={14} color={colors.error.main} />
        </View>
      </TouchableOpacity>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  draftBanner: {
    backgroundColor: colors.warning.lightest,
    borderWidth: 1,
    borderColor: colors.warning.light,
  },
  submittedBanner: {
    backgroundColor: colors.primary.lightest,
    borderWidth: 1,
    borderColor: colors.primary.light,
  },
  restrictedBanner: {
    backgroundColor: colors.error.lightest,
    borderWidth: 1,
    borderColor: colors.error.light,
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    ...typography.sizes.sm,
    fontWeight: typography.weights.bold as any,
    color: colors.neutral[900],
    marginBottom: 2,
  },
  bannerMessage: {
    ...typography.sizes.xs,
    color: colors.neutral[700],
    lineHeight: 18,
  },
  bannerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bannerActionText: {
    ...typography.sizes.xs,
    fontWeight: typography.weights.semibold as any,
    color: colors.primary.main,
  },
});
