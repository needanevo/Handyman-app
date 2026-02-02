import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, borderRadius } from '../constants/theme';

interface TrustBannerProps {
  providerStatus: 'draft' | 'submitted' | 'active' | 'restricted';
  providerCompleteness: number;
  addressVerificationStatus?: string;
  role: 'handyman' | 'contractor';
}

export function TrustBanner({
  providerStatus,
  providerCompleteness,
  addressVerificationStatus,
  role,
}: TrustBannerProps) {
  const router = useRouter();

  // Don't show banner if provider is active
  if (providerStatus === 'active') {
    return null;
  }

  const getBannerConfig = () => {
    switch (providerStatus) {
      case 'draft':
        return {
          icon: 'information-circle' as const,
          iconColor: colors.warning.main,
          backgroundColor: colors.warning.lightest,
          borderColor: colors.warning.main,
          title: 'Complete Your Profile',
          message: `Your profile is ${providerCompleteness}% complete. Finish setup to start accepting jobs.`,
          actionText: 'Resume Setup',
          actionRoute: role === 'handyman'
            ? '/auth/handyman/register-step2'
            : '/auth/contractor/register-step2',
        };

      case 'restricted':
        return {
          icon: 'alert-circle' as const,
          iconColor: colors.error.main,
          backgroundColor: colors.error.lightest,
          borderColor: colors.error.main,
          title: 'Account Restricted',
          message: addressVerificationStatus === 'failed'
            ? 'Address verification required. You have 10 days to verify or access will be revoked.'
            : 'Your account has been restricted. Please contact support or complete verification.',
          actionText: 'Verify Address',
          actionRoute: `/(${role})/profile`,
        };

      case 'submitted':
        return {
          icon: 'time' as const,
          iconColor: colors.primary.main,
          backgroundColor: colors.primary.lightest,
          borderColor: colors.primary.main,
          title: 'Verification Pending',
          message: 'Your profile is under review. You\'ll be notified when verification is complete.',
          actionText: null,
          actionRoute: null,
        };

      default:
        return null;
    }
  };

  const config = getBannerConfig();
  if (!config) return null;

  const handleAction = () => {
    if (config.actionRoute) {
      router.push(config.actionRoute as any);
    }
  };

  return (
    <View style={[styles.banner, { backgroundColor: config.backgroundColor, borderColor: config.borderColor }]}>
      <View style={styles.content}>
        <Ionicons name={config.icon} size={24} color={config.iconColor} />
        <View style={styles.textContainer}>
          <Text style={styles.title}>{config.title}</Text>
          <Text style={styles.message}>{config.message}</Text>
        </View>
      </View>
      {config.actionText && (
        <TouchableOpacity style={styles.actionButton} onPress={handleAction}>
          <Text style={[styles.actionText, { color: config.iconColor }]}>{config.actionText}</Text>
          <Ionicons name="arrow-forward" size={16} color={config.iconColor} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    marginHorizontal: spacing.xl,
    marginVertical: spacing.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  message: {
    ...typography.sizes.sm,
    color: colors.neutral[700],
    lineHeight: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  actionText: {
    ...typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
});
