import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, borderRadius } from '../constants/theme';

interface TrustBannerProps {
  providerStatus: 'draft' | 'submitted' | 'active';
  providerCompleteness: number;
  role: 'handyman' | 'contractor';
}

export function TrustBanner({
  providerStatus,
  providerCompleteness,
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

      case 'restricted':
        return {
          icon: 'warning' as const,
          iconColor: colors.neutral[600],
          backgroundColor: colors.neutral[100],
          borderColor: colors.neutral[300],
          title: 'Account restricted',
          message: 'You can browse jobs, but cannot accept until your provider profile is active.',
          actionText: 'Contact Support',
          actionRoute: 'mailto:support@therealjohnson.com',
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
