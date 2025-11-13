import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
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
import { useAuth } from '../../../src/contexts/AuthContext';

const SERVICE_CATEGORIES = [
  'Drywall',
  'Painting',
  'Electrical',
  'Plumbing',
  'Carpentry',
  'HVAC',
  'Flooring',
  'Roofing',
  'Landscaping',
  'Appliance',
  'Windows & Doors',
  'Other',
];

interface Step3Form {
  skills: string[];
  serviceAreas: string;
  yearsExperience: string;
}

export default function ContractorRegisterStep3() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    user?.skills || []
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<Step3Form>({
    defaultValues: {
      skills: user?.skills || [],
      serviceAreas: user?.serviceAreas?.join(', ') || '',
      yearsExperience: user?.yearsExperience?.toString() || '',
    },
  });

  const toggleSkill = (skill: string) => {
    const newSkills = selectedSkills.includes(skill)
      ? selectedSkills.filter((s) => s !== skill)
      : [...selectedSkills, skill];
    setSelectedSkills(newSkills);
    setValue('skills', newSkills);
  };

  const onSubmit = async (data: Step3Form) => {
    if (selectedSkills.length === 0) {
      Alert.alert('Error', 'Please select at least one skill');
      return;
    }

    router.push({
      pathname: '/auth/contractor/register-step4',
      params: { ...params, skills: selectedSkills.join(','), serviceAreas: data.serviceAreas, yearsExperience: data.yearsExperience },
    });
  };

  const steps = [
    { label: 'Basic Info', completed: true },
    { label: 'Documents', completed: true },
    { label: 'Profile', completed: false },
    { label: 'Portfolio', completed: false },
  ];

  const handleStepPress = (stepIndex: number) => {
    if (stepIndex === 0) {
      router.push({
        pathname: '/auth/contractor/register-step1',
        params,
      });
    } else if (stepIndex === 1) {
      router.push({
        pathname: '/auth/contractor/register-step2',
        params,
      });
    } else if (stepIndex > 2) {
      Alert.alert('Complete Current Step', 'Please complete this step before proceeding to the next.');
    }
  };

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
          <StepIndicator steps={steps} currentStep={2} onStepPress={handleStepPress} />

          {/* Title */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Profile Details</Text>
            <Text style={styles.subtitle}>
              Tell us more about your skills and services
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.label}>
              Skills <Text style={styles.required}>*</Text>
            </Text>
            <Text style={styles.helpText}>Select all services you provide</Text>
            <View style={styles.skillsGrid}>
              {SERVICE_CATEGORIES.map((skill) => (
                <TouchableOpacity
                  key={skill}
                  style={[
                    styles.skillChip,
                    selectedSkills.includes(skill) && styles.skillChipSelected,
                  ]}
                  onPress={() => toggleSkill(skill)}
                >
                  <Text
                    style={[
                      styles.skillChipText,
                      selectedSkills.includes(skill) && styles.skillChipTextSelected,
                    ]}
                  >
                    {skill}
                  </Text>
                  {selectedSkills.includes(skill) && (
                    <Ionicons name="checkmark-circle" size={18} color={colors.primary.main} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

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
  label: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  required: {
    color: colors.error.main,
  },
  helpText: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    marginBottom: spacing.md,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    backgroundColor: colors.background.primary,
    gap: spacing.xs,
  },
  skillChipSelected: {
    borderColor: colors.primary.main,
    backgroundColor: colors.primary.lightest,
  },
  skillChipText: {
    ...typography.sizes.sm,
    color: colors.neutral[700],
    fontWeight: typography.weights.medium,
  },
  skillChipTextSelected: {
    color: colors.primary.main,
    fontWeight: typography.weights.semibold,
  },
  actions: {
    gap: spacing.md,
  },
});
