import React, { useState } from 'react';
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
import { colors, spacing, typography } from '../../../src/constants/theme';
import { Button } from '../../../src/components/Button';
import { Input } from '../../../src/components/Input';
import { StepIndicator } from '../../../src/components/StepIndicator';

interface Step3Form {
  skills: string;
  serviceAreas: string;
  yearsExperience: string;
}

export default function ContractorRegisterStep3() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Step3Form>();

  const onSubmit = async (data: Step3Form) => {
    router.push({
      pathname: '/auth/contractor/register-step4',
      params: { ...params, ...data },
    });
  };

  const steps = [
    { label: 'Basic Info', completed: true },
    { label: 'Documents', completed: true },
    { label: 'Profile', completed: false },
    { label: 'Portfolio', completed: false },
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
          <StepIndicator steps={steps} currentStep={2} />

          {/* Title */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Profile Details</Text>
            <Text style={styles.subtitle}>
              Tell us more about your skills and services
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Controller
              control={control}
              name="skills"
              rules={{ required: 'Please list your skills' }}
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Skills"
                  value={value}
                  onChangeText={onChange}
                  placeholder="e.g., Drywall, Painting, Electrical"
                  error={errors.skills?.message}
                  required
                  icon="build-outline"
                  helpText="Separate skills with commas"
                />
              )}
            />

            <Controller
              control={control}
              name="serviceAreas"
              rules={{ required: 'Please list your service areas' }}
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Service Areas"
                  value={value}
                  onChangeText={onChange}
                  placeholder="e.g., 21201, 21202, 21203"
                  error={errors.serviceAreas?.message}
                  required
                  icon="location-outline"
                  helpText="Enter zip codes separated by commas"
                />
              )}
            />

            <Controller
              control={control}
              name="yearsExperience"
              rules={{ required: 'Please enter your years of experience' }}
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Years of Experience"
                  value={value}
                  onChangeText={onChange}
                  placeholder="5"
                  keyboardType="numeric"
                  error={errors.yearsExperience?.message}
                  required
                  icon="trending-up-outline"
                />
              )}
            />
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              title="Continue"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
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
    marginBottom: spacing['2xl'],
  },
  title: {
    ...typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.sizes.base,
    color: colors.neutral[600],
    lineHeight: 24,
  },
  form: {
    marginBottom: spacing.xl,
  },
  actions: {
    gap: spacing.md,
  },
});
