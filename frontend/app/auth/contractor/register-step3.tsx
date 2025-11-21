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
import { AddressAutocomplete, AddressComponents } from '../../../src/components/AddressAutocomplete';
import { useAuth } from '../../../src/contexts/AuthContext';
import { profileAPI, contractorAPI } from '../../../src/services/api';

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
  yearsExperience: string;
  businessStreet: string;
  businessCity: string;
  businessState: string;
  businessZip: string;
  customSkills: string;  // Custom skills when "Other" is selected
}

export default function ContractorRegisterStep3() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const { user, refreshUser } = useAuth();
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    user?.skills || []
  );
  const [verifiedAddress, setVerifiedAddress] = useState<AddressComponents | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<Step3Form>({
    defaultValues: {
      skills: user?.skills || [],
      yearsExperience: user?.yearsExperience?.toString() || '',
      businessStreet: user?.addresses?.[0]?.street || '',
      businessCity: user?.addresses?.[0]?.city || '',
      businessState: user?.addresses?.[0]?.state || '',
      businessZip: user?.addresses?.[0]?.zipCode || '',
      customSkills: '',
    },
  });

  // Watch for "Other" selection to show custom skills input
  const skills = watch('skills');

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

    if (!verifiedAddress) {
      Alert.alert('Error', 'Please select and verify your business address');
      return;
    }

    setIsLoading(true);

    try {
      // Get business name from params (set in Step 1) or user context
      const businessName = (params.businessName as string) || user?.businessName;

      // Combine selected skills with custom skills (if "Other" is selected)
      const allSkills = [...selectedSkills];
      if (selectedSkills.includes('Other') && data.customSkills) {
        // Add custom skills to the skills array
        const customSkillsList = data.customSkills
          .split(',')
          .map(s => s.trim())
          .filter(s => s.length > 0);
        allSkills.push(...customSkillsList);
      }

      // Save both address and profile in one try block with clear error handling
      let addressSaved = false;
      let profileSaved = false;

      try {
        // Step 1: Save business address with verified coordinates
        await profileAPI.addAddress({
          street: verifiedAddress.street,
          city: verifiedAddress.city,
          state: verifiedAddress.state,
          zip_code: verifiedAddress.zipCode,  // Backend expects snake_case
          is_default: true,  // Backend expects snake_case
          latitude: verifiedAddress.latitude,  // Add verified coordinates
          longitude: verifiedAddress.longitude,
        });
        addressSaved = true;
        console.log('✅ Address saved successfully');

        // Step 2: Save contractor profile (skills, experience, business name)
        await contractorAPI.updateProfile({
          skills: allSkills,
          years_experience: parseInt(data.yearsExperience) || 0,
          ...(businessName && { business_name: businessName }),
        });
        profileSaved = true;
        console.log('✅ Profile saved successfully');

      } catch (saveError: any) {
        console.error('Save error:', saveError);

        // Provide clear feedback about what succeeded and what failed
        if (addressSaved && !profileSaved) {
          Alert.alert(
            'Partial Save',
            'Your business address was saved, but profile update failed. Please contact support or try again.\n\nError: ' +
            (saveError.response?.data?.detail || saveError.message || 'Unknown error'),
            [{ text: 'OK' }]
          );
          // Don't throw - address is saved, let user continue or retry
          throw saveError; // Re-throw to prevent navigation
        } else {
          // Address save failed - this is critical
          throw saveError;
        }
      }

      // Refresh user context to get updated profile
      await refreshUser();

      // Navigate to next step
      router.push({
        pathname: '/auth/contractor/register-step4',
        params: {
          ...params,
          skills: selectedSkills.join(','),
          yearsExperience: data.yearsExperience
        },
      });

    } catch (error: any) {
      console.error('Profile save error:', error);

      // Extract detailed error message
      let errorMessage = 'Failed to save profile information. Please try again.';

      if (error.response?.data?.detail) {
        if (typeof error.response.data.detail === 'string') {
          errorMessage = error.response.data.detail;
        } else if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail
            .map((err: any) => err.msg || JSON.stringify(err))
            .join('\n');
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert(
        'Error',
        errorMessage,
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { label: 'Basic Info', completed: true },
    { label: 'Documents', completed: true },
    { label: 'Profile', completed: false },
    { label: 'Portfolio', completed: false },
  ];

  const handleStepPress = (stepIndex: number) => {
    // Allow free navigation between all steps
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
    } else if (stepIndex === 3) {
      router.push({
        pathname: '/auth/contractor/register-step4',
        params,
      });
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

            {/* Custom Skills Input (shown when "Other" is selected) */}
            {selectedSkills.includes('Other') && (
              <View style={styles.customSkillsSection}>
                <Controller
                  control={control}
                  name="customSkills"
                  rules={{
                    required: selectedSkills.includes('Other') ? 'Please specify your custom skills' : false
                  }}
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="Specify Your Skills"
                      value={value}
                      onChangeText={onChange}
                      placeholder="e.g., Tile work, Fence installation, Pool maintenance"
                      error={errors.customSkills?.message}
                      required={selectedSkills.includes('Other')}
                      multiline
                      numberOfLines={3}
                      icon="create-outline"
                    />
                  )}
                />
                <Text style={styles.helpText}>
                  List any additional skills not covered above (comma-separated)
                </Text>
              </View>
            )}

            <Text style={styles.sectionTitle}>Business Address</Text>
            <Text style={styles.helpText}>
              This address determines your 50-mile service radius. We'll verify it and get exact coordinates.
            </Text>

            <AddressAutocomplete
              onAddressSelected={(address) => {
                setVerifiedAddress(address);
                setValue('businessStreet', address.street);
                setValue('businessCity', address.city);
                setValue('businessState', address.state);
                setValue('businessZip', address.zipCode);
              }}
              initialValue={{
                street: user?.addresses?.[0]?.street || '',
                city: user?.addresses?.[0]?.city || '',
                state: user?.addresses?.[0]?.state || '',
                zipCode: user?.addresses?.[0]?.zipCode || '',
              }}
              label=""
              required={true}
              error={!verifiedAddress && errors.businessStreet?.message}
            />

            {/* Show verified address summary */}
            {verifiedAddress && (
              <View style={styles.verifiedAddressCard}>
                <View style={styles.verifiedHeader}>
                  <Ionicons name="checkmark-circle" size={24} color={colors.success.main} />
                  <Text style={styles.verifiedTitle}>Address Verified</Text>
                </View>
                <Text style={styles.verifiedText}>
                  {verifiedAddress.formattedAddress}
                </Text>
                <Text style={styles.verifiedCoords}>
                  📍 {verifiedAddress.latitude.toFixed(4)}, {verifiedAddress.longitude.toFixed(4)}
                </Text>
              </View>
            )}

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
  sectionTitle: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    marginTop: spacing.xl,
    marginBottom: spacing.xs,
  },
  customSkillsSection: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  verifiedAddressCard: {
    backgroundColor: colors.success.lightest,
    borderWidth: 1,
    borderColor: colors.success.main,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  verifiedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  verifiedTitle: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.success.main,
  },
  verifiedText: {
    ...typography.sizes.sm,
    color: colors.neutral[800],
    marginBottom: spacing.xs,
  },
  verifiedCoords: {
    ...typography.sizes.xs,
    color: colors.neutral[600],
    fontFamily: 'monospace',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  actions: {
    gap: spacing.md,
  },
});
