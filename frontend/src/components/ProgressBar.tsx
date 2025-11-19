import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius, spacing, typography } from '../constants/theme';

interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  variant?: 'primary' | 'success' | 'warning';
  height?: number;
  style?: ViewStyle;
}

export function ProgressBar({
  progress,
  label,
  showPercentage = false,
  variant = 'primary',
  height = 8,
  style,
}: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  const variantColors = {
    primary: colors.primary.main,
    success: colors.success.main,
    warning: colors.warning.main,
  };

  return (
    <View style={[styles.container, style]}>
      {(label || showPercentage) && (
        <View style={styles.labelContainer}>
          {label && <Text style={styles.label}>{label}</Text>}
          {showPercentage && (
            <Text style={styles.percentage}>{Math.round(clampedProgress)}%</Text>
          )}
        </View>
      )}
      <View style={[styles.track, { height }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${clampedProgress}%`,
              backgroundColor: variantColors[variant],
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.sizes.sm,
    color: colors.neutral[700],
    fontWeight: typography.weights.medium,
  },
  percentage: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    fontWeight: typography.weights.semibold,
  },
  track: {
    width: '100%',
    backgroundColor: colors.neutral[200],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
});
