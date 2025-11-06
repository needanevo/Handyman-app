import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
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

interface Step2Form {
  category: string;
  title: string;
  description: string;
  urgency: string;
}

export default function JobRequestStep2() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedUrgency, setSelectedUrgency] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Step2Form>();

  const categories = [
    { id: 'drywall', label: 'Drywall', icon: 'square-outline' },
    { id: 'painting', label: 'Painting', icon: 'brush-outline' },
    { id: 'electrical', label: 'Electrical', icon: 'flash-outline' },
    { id: 'plumbing', label: 'Plumbing', icon: 'water-outline' },
    { id: 'carpentry', label: 'Carpentry', icon: 'hammer-outline' },
    { id: 'other', label: 'Other', icon: 'build-outline' },
  ];

  const urgencyLevels = [
    { id: 'low', label: 'Whenever', description: 'No rush, flexible timeline', icon: 'calendar-outline' },
    { id: 'medium', label: 'This Week', description: 'Would like it done soon', icon: 'time-outline' },
    { id: 'high', label: 'Urgent', description: 'Needs immediate attention', icon: 'alert-circle-outline' },
  ];

  const onSubmit = async (data: Step2Form) => {
    if (!selectedCategory) {
      alert('Please select a category');
      return;
    }
    if (!selectedUrgency) {
      alert('Please select urgency level');
      return;
    }

    router.push({
      pathname: '/(customer)/job-request/step3-review',
      params: {
        ...params,
        category: selectedCategory,
        urgency: selectedUrgency,
        title: data.title,
        description: data.description,
      },
    });
  };

  const steps = [
    { label: 'Photos', completed: true },
    { label: 'Describe', completed: false },
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
          <StepIndicator steps={steps} currentStep={1} />

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

          {/* Category Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              What type of work is needed? <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.categoryGrid}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryCard,
                    selectedCategory === cat.id && styles.categoryCardSelected,
                  ]}
                  onPress={() => setSelectedCategory(cat.id)}
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={28}
                    color={
                      selectedCategory === cat.id
                        ? colors.primary.main
                        : colors.neutral[600]
                    }
                  />
                  <Text
                    style={[
                      styles.categoryLabel,
                      selectedCategory === cat.id && styles.categoryLabelSelected,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
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
                helpText="Include details like size, location, when it happened, etc."
              />
            )}
          />

          {/* Urgency Selection */}
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
                    <Ionicons
                      name={level.icon as any}
                      size={24}
                      color={
                        selectedUrgency === level.id
                          ? colors.primary.main
                          : colors.neutral[600]
                      }
                    />
                    <View style={styles.urgencyText}>
                      <Text
                        style={[
                          styles.urgencyLabel,
                          selectedUrgency === level.id && styles.urgencyLabelSelected,
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
                      selectedUrgency === level.id && styles.radioCircleSelected,
                    ]}
                  >
                    {selectedUrgency === level.id && (
                      <View style={styles.radioDot} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
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
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
  required: {
    color: colors.error.main,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  categoryCard: {
    width: 'calc(33.333% - 8px)',
    aspectRatio: 1,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  categoryCardSelected: {
    borderColor: colors.primary.main,
    backgroundColor: colors.primary.lightest,
  },
  categoryLabel: {
    ...typography.sizes.sm,
    color: colors.neutral[700],
    fontWeight: typography.weights.medium,
  },
  categoryLabelSelected: {
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
  urgencyText: {
    flex: 1,
  },
  urgencyLabel: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  urgencyLabelSelected: {
    color: colors.primary.main,
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
  radioCircleSelected: {
    borderColor: colors.primary.main,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.main,
  },
  actions: {
    gap: spacing.md,
    marginTop: spacing.xl,
  },
});
