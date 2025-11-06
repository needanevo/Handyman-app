import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View, ViewStyle } from 'react-native';
import { colors, borderRadius, spacing, typography, touchTarget, shadows } from '../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'error';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  style
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const buttonStyle = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    style,
  ];

  const textStyle = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    isDisabled && styles.disabledText,
  ];

  const getLoaderColor = () => {
    switch (variant) {
      case 'primary':
      case 'success':
      case 'error':
        return colors.background.primary;
      case 'secondary':
        return colors.neutral[700];
      default:
        return colors.primary.main;
    }
  };

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="small" color={getLoaderColor()} />
        ) : (
          <>
            {icon && <View style={styles.icon}>{icon}</View>}
            {title && <Text style={textStyle}>{title}</Text>}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: touchTarget.minHeight,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: spacing.sm,
  },
  text: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    textAlign: 'center',
  },

  // Variants
  primary: {
    backgroundColor: colors.primary.main,
    ...shadows.sm,
  },
  secondary: {
    backgroundColor: colors.neutral[100],
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary.main,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  success: {
    backgroundColor: colors.success.main,
    ...shadows.sm,
  },
  error: {
    backgroundColor: colors.error.main,
    ...shadows.sm,
  },

  // Text colors for variants
  primaryText: {
    color: colors.background.primary,
  },
  secondaryText: {
    color: colors.neutral[700],
  },
  outlineText: {
    color: colors.primary.main,
  },
  ghostText: {
    color: colors.primary.main,
  },
  successText: {
    color: colors.background.primary,
  },
  errorText: {
    color: colors.background.primary,
  },

  // Sizes
  small: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    minHeight: 36,
  },
  medium: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    minHeight: touchTarget.minHeight,
  },
  large: {
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.base,
    minHeight: 52,
  },

  // Text sizes
  smallText: {
    ...typography.sizes.sm,
  },
  mediumText: {
    ...typography.sizes.base,
  },
  largeText: {
    ...typography.sizes.lg,
  },

  // States
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    color: colors.neutral[400],
  },
  fullWidth: {
    width: '100%',
  },
});
