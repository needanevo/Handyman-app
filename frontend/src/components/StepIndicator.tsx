import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, typography } from '../constants/theme';

interface Step {
  label: string;
  completed?: boolean;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number; // 0-indexed
  onStepPress?: (stepIndex: number) => void; // Optional callback for step navigation
}

export function StepIndicator({ steps, currentStep, onStepPress }: StepIndicatorProps) {
  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = step.completed || index < currentStep;
        const isLast = index === steps.length - 1;
        const isClickable = !!onStepPress;

        const stepContent = (
          <>
            {/* Circle */}
            <View
              style={[
                styles.circle,
                isCompleted && styles.circleCompleted,
                isActive && styles.circleActive,
              ]}
            >
              {isCompleted ? (
                <Ionicons name="checkmark" size={16} color={colors.background.primary} />
              ) : (
                <Text
                  style={[
                    styles.stepNumber,
                    isActive && styles.stepNumberActive,
                  ]}
                >
                  {index + 1}
                </Text>
              )}
            </View>

            {/* Label */}
            <Text
              style={[
                styles.label,
                isActive && styles.labelActive,
                isCompleted && styles.labelCompleted,
              ]}
            >
              {step.label}
            </Text>
          </>
        );

        return (
          <View key={index} style={styles.stepWrapper}>
            {isClickable ? (
              <TouchableOpacity
                onPress={() => onStepPress(index)}
                style={styles.stepContent}
                activeOpacity={0.7}
              >
                {stepContent}
              </TouchableOpacity>
            ) : (
              <View style={styles.stepContent}>
                {stepContent}
              </View>
            )}

            {/* Connector line */}
            {!isLast && (
              <View
                style={[
                  styles.connector,
                  isCompleted && styles.connectorCompleted,
                ]}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.lg,
  },
  stepWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  stepContent: {
    alignItems: 'center',
    zIndex: 1,
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  circleActive: {
    backgroundColor: colors.primary.main,
  },
  circleCompleted: {
    backgroundColor: colors.success.main,
  },
  stepNumber: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    fontWeight: typography.weights.semibold,
  },
  stepNumberActive: {
    color: colors.background.primary,
  },
  label: {
    ...typography.sizes.xs,
    color: colors.neutral[500],
    textAlign: 'center',
    maxWidth: 80,
  },
  labelActive: {
    color: colors.primary.main,
    fontWeight: typography.weights.semibold,
  },
  labelCompleted: {
    color: colors.neutral[700],
  },
  connector: {
    position: 'absolute',
    top: 16,
    left: '50%',
    right: '-50%',
    height: 2,
    backgroundColor: colors.neutral[200],
    zIndex: 0,
  },
  connectorCompleted: {
    backgroundColor: colors.success.main,
  },
});
