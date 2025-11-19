import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, borderRadius, spacing, typography } from '../constants/theme';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'neutral' | 'escrow';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export function Badge({ label, variant = 'neutral', size = 'md', style }: BadgeProps) {
  const badgeStyle = [
    styles.badge,
    styles[variant],
    styles[`${size}Badge`],
    style,
  ];

  const textStyle = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
  ];

  return (
    <View style={badgeStyle}>
      <Text style={textStyle}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },

  // Variants
  primary: {
    backgroundColor: colors.primary.lightest,
  },
  success: {
    backgroundColor: colors.success.lightest,
  },
  warning: {
    backgroundColor: colors.warning.lightest,
  },
  error: {
    backgroundColor: colors.error.lightest,
  },
  neutral: {
    backgroundColor: colors.neutral[100],
  },
  escrow: {
    backgroundColor: colors.warning.lightest,
  },

  // Text colors
  primaryText: {
    color: colors.primary.dark,
  },
  successText: {
    color: colors.success.dark,
  },
  warningText: {
    color: colors.warning.dark,
  },
  errorText: {
    color: colors.error.dark,
  },
  neutralText: {
    color: colors.neutral[700],
  },
  escrowText: {
    color: colors.warning.dark,
  },

  // Sizes
  smBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  mdBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  lgBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },

  // Text
  text: {
    fontWeight: typography.weights.semibold,
  },
  smText: {
    ...typography.sizes.xs,
  },
  mdText: {
    ...typography.sizes.sm,
  },
  lgText: {
    ...typography.sizes.base,
  },
});
