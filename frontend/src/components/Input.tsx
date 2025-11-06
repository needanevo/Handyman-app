import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, typography } from '../constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helpText?: string;
  required?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  error,
  helpText,
  required = false,
  icon,
  containerStyle,
  ...textInputProps
}: InputProps) {
  const hasError = !!error;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      <View style={[styles.inputWrapper, hasError && styles.inputWrapperError]}>
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={hasError ? colors.error.main : colors.neutral[500]}
            style={styles.icon}
          />
        )}
        <TextInput
          style={[styles.input, icon && styles.inputWithIcon]}
          placeholderTextColor={colors.neutral[400]}
          {...textInputProps}
        />
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
      {!error && helpText && <Text style={styles.helpText}>{helpText}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  required: {
    color: colors.error.main,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.primary,
  },
  inputWrapperError: {
    borderColor: colors.error.main,
  },
  icon: {
    marginLeft: spacing.md,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    ...typography.sizes.base,
    color: colors.neutral[900],
    minHeight: 48,
  },
  inputWithIcon: {
    paddingLeft: spacing.sm,
  },
  error: {
    ...typography.sizes.sm,
    color: colors.error.main,
    marginTop: spacing.xs,
  },
  helpText: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    marginTop: spacing.xs,
  },
});
