import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../../src/constants/theme';
import { Button } from '../../../src/components/Button';
import { Input } from '../../../src/components/Input';
import { StepIndicator } from '../../../src/components/StepIndicator';
import { Card } from '../../../src/components/Card';

interface Step4Form {
  budgetMax: string;
}

const urgencyLevels = [
  {
    id: 'flexible',
    label: 'Flexible',
    description: 'No rush, I can wait 1-2 weeks',
    icon: 'calendar-outline',
    color: colors.success.main,
  },
  {
    id: 'soon',
    label: 'This Week',
    description: 'Would like it done within 7 days',
    icon: 'time-outline',
    color: colors.warning.main,
  },
  {
    id: 'urgent',
    label: 'Urgent',
    description: 'Need it done ASAP (1-3 days)',
    icon: 'alert-circle-outline',
    color: colors.error.main,
  },
];

export default function JobRequestStep4() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedUrgency, setSelectedUrgency] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<Step4Form>();

  const budgetMax = watch('budgetMax');

  const onSubmit = async (data: Step4Form) => {
    if (!selectedUrgency) {
      alert('Please select when you need this done');
      return;
    }

    const maxBudget = parseFloat(data.budgetMax);

    if (!maxBudget || maxBudget <= 0) {
      alert('Please enter a valid maximum budget');
      return;
    }

    router.push({
      pathname: '/(customer)/job-request/step3-review' as any,
      params: {
        ...params,
        budgetMax: data.budgetMax,
        urgency: selectedUrgency,
      },
    });
  };

  const steps = [
    { label: 'Address', completed: true },
    { label: 'Service', completed: true },
    { label: 'Photos', completed: true },
    { label: 'Details', completed: true },
    { label: 'Budget', completed: false },
    { label: 'Review', completed: false },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
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

        {/* Progress */}
        <StepIndicator steps={steps} currentStep={4} />

        {/* Title */}
        <View style={styles.titleSection}>
          <View style={[styles.iconCircle, { backgroundColor: colors.primary.lightest }]}>
            <Ionicons name="cash" size={32} color={colors.primary.main} />
          </View>
          <Text style={styles.title}>Budget & Timing</Text>
          <Text style={styles.subtitle}>
            Help contractors know your budget and timeline
          </Text>
        </View>

        {/* Budget Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            What's your maximum budget? <Text style={styles.required}>*</Text>
          </Text>
          <Text style={styles.sectionHelpText}>
            This helps us match you with contractors in your price range
          </Text>

          <View style={styles.budgetSingleInput}>
            <Controller
              control={control}
              name="budgetMax"
              rules={{
                required: 'Maximum budget required',
                pattern: { value: /^\d+$/, message: 'Numbers only' },
              }}
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Maximum Budget"
                  value={value}
                  onChangeText={onChange}
                  placeholder="500"
                  keyboardType="numeric"
                  error={errors.budgetMax?.message}
                  required
                />
              )}
            />
          </View>

          {budgetMax && (
            <View style={styles.budgetSummary}>
              <Ionicons name="information-circle" size={20} color={colors.primary.main} />
              <Text style={styles.budgetSummaryText}>
                Maximum budget: ${budgetMax}
              </Text>
            </View>
          )}
        </View>

        {/* Timing Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            When do you need this done? <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.urgencyList}>
            {urgencyLevels.map((level) => (
              <TouchableOpacity
                key={level.id}
                style={[
                  styles.urgencyCard,
                  selectedUrgency === level.id && styles.urgencyCardSelected,
                ]}
                onPress={() => setSelectedUrgency(level.id)}
              >
                <View style={styles.urgencyContent}>
                  <View
                    style={[
                      styles.urgencyIconCircle,
                      {
                        backgroundColor:
                          selectedUrgency === level.id
                            ? `${level.color}20`
                            : colors.neutral[100],
                      },
                    ]}
                  >
                    <Ionicons
                      name={level.icon as any}
                      size={24}
                      color={
                        selectedUrgency === level.id ? level.color : colors.neutral[600]
                      }
                    />
                  </View>
                  <View style={styles.urgencyText}>
                    <Text
                      style={[
                        styles.urgencyLabel,
                        selectedUrgency === level.id && {
                          color: level.color,
                        },
                      ]}
                    >
                      {level.label}
                    </Text>
                    <Text style={styles.urgencyDescription}>{level.description}</Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.radioCircle,
                    selectedUrgency === level.id && {
                      borderColor: level.color,
                    },
                  ]}
                >
                  {selectedUrgency === level.id && (
                    <View style={[styles.radioDot, { backgroundColor: level.color }]} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Info Card */}
        <Card variant="flat" padding="lg" style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="shield-checkmark" size={24} color={colors.success.main} />
            <Text style={styles.infoTitle}>Don't worry!</Text>
          </View>
          <Text style={styles.infoText}>
            These are just estimates to help match you with the right contractors. Final
            pricing will be determined in contractor proposals, and you're never obligated
            to accept any quote.
          </Text>
        </Card>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Continue"
            onPress={handleSubmit(onSubmit)}
            size="large"
            fullWidth
            disabled={!selectedUrgency}
          />
          <Button
            title="Back"
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
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.sizes.base,
    color: colors.neutral[600],
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    marginBottom: spacing['2xl'],
  },
  sectionLabel: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  sectionHelpText: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  required: {
    color: colors.error.main,
  },
  budgetSingleInput: {
    marginBottom: spacing.md,
  },
  budgetSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary.lightest,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  budgetSummaryText: {
    ...typography.sizes.base,
    color: colors.primary.main,
    fontWeight: typography.weights.semibold,
  },
  urgencyList: {
    gap: spacing.md,
  },
  urgencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.neutral[200],
    padding: spacing.base,
  },
  urgencyCardSelected: {
    borderColor: colors.primary.main,
    backgroundColor: colors.primary.lightest,
  },
  urgencyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  urgencyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  urgencyText: {
    flex: 1,
  },
  urgencyLabel: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  urgencyDescription: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.neutral[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: borderRadius.full,
  },
  infoCard: {
    marginBottom: spacing.xl,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  infoTitle: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
  },
  infoText: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    lineHeight: 20,
  },
  actions: {
    gap: spacing.md,
  },
});
