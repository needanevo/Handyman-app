import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../../src/constants/theme';
import { Button } from '../../../src/components/Button';
import { Input } from '../../../src/components/Input';
import { StepIndicator } from '../../../src/components/StepIndicator';

interface Step3Form {
  title: string;
  description: string;
}

export default function JobRequestStep3() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Step3Form>();

  const onSubmit = async (data: Step3Form) => {
    router.push({
      pathname: '/(customer)/job-request/step4-budget-timing',
      params: {
        ...params,
        title: data.title,
        description: data.description,
      },
    });
  };

  const steps = [
    { label: 'Address', completed: true },
    { label: 'Service', completed: true },
    { label: 'Photos', completed: true },
    { label: 'Details', completed: false },
    { label: 'Budget', completed: false },
    { label: 'Review', completed: false },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
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
          <StepIndicator steps={steps} currentStep={3} />

          {/* Title */}
          <View style={styles.titleSection}>
            <View style={[styles.iconCircle, { backgroundColor: colors.primary.lightest }]}>
              <Ionicons name="create" size={32} color={colors.primary.main} />
            </View>
            <Text style={styles.title}>Describe the job</Text>
            <Text style={styles.subtitle}>
              Help us understand what needs to be fixed
            </Text>
          </View>

          {/* Service Badge */}
          <View style={styles.serviceBadge}>
            <Ionicons name="construct" size={18} color={colors.primary.main} />
            <Text style={styles.serviceBadgeText}>{params.categoryTitle as string}</Text>
          </View>

          {/* Job Title */}
          <Controller
            control={control}
            name="title"
            rules={{ required: 'Please provide a brief title' }}
            render={({ field: { onChange, value } }) => (
              <Input
                label="Job Title"
                value={value}
                onChangeText={onChange}
                placeholder="e.g., Fix hole in bedroom wall"
                error={errors.title?.message}
                required
                icon="create-outline"
              />
            )}
          />

          {/* Description */}
          <Controller
            control={control}
            name="description"
            rules={{ required: 'Please describe what needs to be done' }}
            render={({ field: { onChange, value } }) => (
              <Input
                label="Description"
                value={value}
                onChangeText={onChange}
                placeholder="Describe the issue in detail..."
                multiline
                numberOfLines={4}
                style={{ height: 120, textAlignVertical: 'top' }}
                error={errors.description?.message}
                required
                helpText="Include details like size, location, when it happened, materials needed, etc."
              />
            )}
          />

          {/* Helpful Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons name="bulb" size={24} color={colors.warning.main} />
              <Text style={styles.infoTitle}>Be specific!</Text>
            </View>
            <Text style={styles.infoText}>
              The more details you provide, the more accurate your quotes will be. Mention:
            </Text>
            <View style={styles.infoList}>
              <Text style={styles.infoListItem}>• Size and location of the issue</Text>
              <Text style={styles.infoListItem}>• When the problem started</Text>
              <Text style={styles.infoListItem}>• Any relevant context or history</Text>
              <Text style={styles.infoListItem}>• Preferred materials or finishes</Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              title="Continue"
              onPress={handleSubmit(onSubmit)}
              size="large"
              fullWidth
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  keyboardView: {
    flex: 1,
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
    marginBottom: spacing.lg,
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
  serviceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.primary.lightest,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  serviceBadgeText: {
    ...typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.primary.main,
  },
  infoCard: {
    backgroundColor: colors.warning.lightest,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.warning.light,
    padding: spacing.lg,
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
    color: colors.neutral[700],
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  infoList: {
    gap: spacing.xs,
  },
  infoListItem: {
    ...typography.sizes.sm,
    color: colors.neutral[700],
    lineHeight: 20,
  },
  actions: {
    gap: spacing.md,
    marginTop: spacing.xl,
  },
});
