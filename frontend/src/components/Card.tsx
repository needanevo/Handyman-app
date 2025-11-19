import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { colors, borderRadius, spacing, shadows } from '../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'elevated' | 'outlined' | 'flat';
  padding?: keyof typeof spacing;
  onPress?: () => void;
}

export function Card({
  children,
  style,
  variant = 'elevated',
  padding = 'base',
  onPress
}: CardProps) {
  const cardStyle = [
    styles.card,
    styles[variant],
    { padding: spacing[padding] },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.primary,
  },
  elevated: {
    ...shadows.md,
  },
  outlined: {
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  flat: {
    backgroundColor: colors.background.secondary,
  },
});
