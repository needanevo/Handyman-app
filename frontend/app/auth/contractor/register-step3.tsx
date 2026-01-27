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
import { GooglePlacesAddressInput, StructuredAddress } from '../../../src/components/GooglePlacesAddressInput';
import { useAuth } from '../../../src/contexts/AuthContext';
import { profileAPI, contractorAPI, authAPI } from '../../../src/services/api';

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

const SPECIALTY_CATEGORIES = [
  'Residential',
  'Commercial',
  'Remodeling',
  'New Construction',
  'Repair & Maintenance',
  'Emergency Services',
];

const PROVIDER_INTENTS = [
  { value: 'not_hiring', label: 'Working Solo', description: 'I work alone and handle jobs myself' },
  { value: 'hiring', label: 'Building a Team', description: 'I\'m hiring or plan to hire helpers' },
  { value: 'mentoring', label: 'Mentoring Others', description: 'I teach and mentor new contractors' },
];

interface Step3Form {
  skills: string[];
  specialties: string[];
  yearsExperience: string;
  customSkills: string;  // Custom skills when "Other" is selected
  street: string;
  city: string;
  state: string;
  zip: string;
}

export default function ContractorRegisterStep3() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const { user, refreshUser } = useAuth();

  // Separate standard categories from custom skills on mount
  const userSkills = user?.skills || [];
  const standardSkills = userSkills.filter(skill => SERVICE_CATEGORIES.includes(skill));
  const customSkills = userSkills.filter(skill => !SERVICE_CATEGORIES.includes(skill) && skill !== 'Other');

  // If there are custom skills, add "Other" to standard skills
  const initialSelectedSkills = customSkills.length > 0
    ? [...standardSkills, 'Other']
    : standardSkills;

  const [selectedSkills, setSelectedSkills] = useState<string[]>(initialSelectedSkills);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(user?.specialties || []);
  const [selectedIntent, setSelectedIntent] = useState<string>(user?.providerIntent || 'not_hiring');

  // Address state for Google Places autocomplete
  const [selectedAddress, setSelectedAddress] = useState<StructuredAddress | null>(() => {
    if (user?.addresses && user.addresses.length > 0) {
      const addr = user.addresses[0];
      return {
        street: addr.street || '',
        line2: addr.line2,
        city: addr.city || '',
        state: addr.state || '',
        zipCode: addr.zipCode || '',
        country: addr.country || 'US',
        latitude: addr.latitude,
        longitude: addr.longitude,
        placeId: addr.placeId,
        formattedAddress: addr.formattedAddress,
      };
    }
    return null;
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<Step3Form>({
    defaultValues: {
      skills: initialSelectedSkills,
      specialties: user?.specialties || [],
      yearsExperience: (user?.yearsExperience !== undefined && user?.yearsExperience !== null) ? String(user.yearsExperience) : '',
      customSkills: customSkills.join(', '),  // Pre-fill custom skills
      street: user?.addresses?.[0]?.street || '',
      city: user?.addresses?.[0]?.city || '',
      state: user?.addresses?.[0]?.state || '',
      zip: user?.addresses?.[0]?.zipCode || '',
    },
  });

  // Watch address fields for validation
  const streetValue = watch('street');
  const cityValue = watch('city');
  const stateValue = watch('state');
  const zipValue = watch('zip');

  // Sync state with user context when it changes (ensures persistence)
  React.useEffect(() => {
    if (user) {
      // TASK 5: Null-safe access to user.skills
      const userSkills = user?.skills || [];
      const standardSkills = userSkills.filter(skill => SERVICE_CATEGORIES.includes(skill));
      const customSkills = userSkills.filter(skill => !SERVICE_CATEGORIES.includes(skill) && skill !== 'Other');
      const initialSelectedSkills = customSkills.length > 0 ? [...standardSkills, 'Other'] : standardSkills;

      setSelectedSkills(initialSelectedSkills);
      setValue('skills', initialSelectedSkills);
      setValue('customSkills', customSkills.join(', '));
    }
  }, [user?.skills, setValue]);

  React.useEffect(() => {
    if (user?.specialties) {
      // TASK 5: Null-safe access to user.specialties
      setSelectedSpecialties(user.specialties || []);
      setValue('specialties', user.specialties || []);
    }
  }, [user?.specialties, setValue]);

  React.useEffect(() => {
    if (user?.providerIntent) {
      setSelectedIntent(user.providerIntent);
    }
  }, [user?.providerIntent]);

  // Address hydration is now handled by selectedAddress state initialization

  React.useEffect(() => {
    if (user?.yearsExperience !== undefined && user.yearsExperience !== null) {
      setValue('yearsExperience', String(user.yearsExperience));
    }
  }, [user?.yearsExperience, setValue]);

  // Watch for "Other" selection to show custom skills input
  const skills = watch('skills');

  const toggleSkill = (skill: string) => {
    const newSkills = selectedSkills.includes(skill)
      ? selectedSkills.filter((s) => s !== skill)
      : [...selectedSkills, skill];
    setSelectedSkills(newSkills);
    setValue('skills', newSkills);
  };

  const toggleSpecialty = (specialty: string) => {
    const newSpecialties = selectedSpecialties.includes(specialty)
      ? selectedSpecialties.filter((s) => s !== specialty)
      : [...selectedSpecialties, specialty];
    setSelectedSpecialties(newSpecialties);
    setValue('specialties', newSpecialties);
  };

  // Handler for when autocomplete selects an address - auto-fills form fields
  const handleAddressSelected = (address: StructuredAddress) => {
    console.log('[Step3] Autocomplete address selected:', address);
    // Populate form fields
    setValue('street', address.street || '');
    setValue('city', address.city || '');
    setValue('state', address.state || '');
    setValue('zip', address.zipCode || '');
    // Store full address data for metadata (lat/lng, placeId, etc.)
    setSelectedAddress(address);
  };

  const onSubmit = async (data: Step3Form) => {
    if (selectedSkills.length === 0) {
      Alert.alert('Error', 'Please select at least one skill');
      return;
    }

    // Validate address using form fields
    if (!data.street || !data.city || !data.state || !data.zip) {
      Alert.alert('Error', 'Please fill in all address fields');
      return;
    }

    setIsLoading(true);

    try {
      // Get business name from params (set in Step 1) or user context
      const businessName = (params.businessName as string) || user?.businessName;

      // Build final skills array: standard categories + custom skills (excluding "Other")
      // Remove "Other" placeholder - only keep actual skill names
      const standardSkills = selectedSkills.filter(skill => skill !== 'Other');

      // Parse custom skills if "Other" was selected
      const customSkillsList = selectedSkills.includes('Other') && data.customSkills
        ? data.customSkills
            .split(',')
            .map(s => s.trim())
            .filter(s => s.length > 0)
        : [];

      // Combine and deduplicate (in case user re-enters same skill)
      const allSkills = [...new Set([...standardSkills, ...customSkillsList])];

      // Save both address and profile in one try block with clear error handling
      let addressSaved = false;
      let profileSaved = false;

      // Build address from form data + optional metadata from autocomplete
      const addressPayload = {
        street: data.street,
        line2: selectedAddress?.line2,
        city: data.city,
        state: data.state,
        zip_code: data.zip,
        country: selectedAddress?.country || 'US',
        latitude: selectedAddress?.latitude,
        longitude: selectedAddress?.longitude,
        place_id: selectedAddress?.placeId,
        formatted_address: selectedAddress?.formattedAddress,
        is_default: true,
      };

      console.log('[Step3] Saving address with data:', addressPayload);

      try {
        // Step 1: Save business address with Google Places data
        await profileAPI.addAddress(addressPayload);
        addressSaved = true;
        console.log('✅ Business address saved successfully');

        // Step 2: Save contractor profile (skills, specialties, experience, business name, provider intent)
        await contractorAPI.updateProfile({
          skills: allSkills,
          specialties: selectedSpecialties,
          years_experience: parseInt(data.yearsExperience) || 0,
          provider_intent: selectedIntent,
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
      try {
        await refreshUser();
      } catch (refreshError) {
        console.warn('Failed to refresh user after save, continuing anyway:', refreshError);
        // Don't block navigation if refresh fails - data is already saved to backend
      }

      // Track onboarding step completion (Phase 5B-1)
      try {
        await authAPI.updateOnboardingStep(3);
        console.log('✅ Step 3 progress saved');
      } catch (stepError) {
        console.warn('Failed to save step progress:', stepError);
        // Don't block navigation if step tracking fails
      }

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
    { label: 'Banking', completed: false },
    { label: 'Review', completed: false },
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
    } else if (stepIndex === 4) {
      router.push({
        pathname: '/auth/contractor/register-step5',
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

            {/* Specialty Categories */}
            <Text style={styles.label}>
              Specialties
            </Text>
            <Text style={styles.helpText}>Select your business focus areas (optional)</Text>
            <View style={styles.skillsGrid}>
              {SPECIALTY_CATEGORIES.map((specialty) => (
                <TouchableOpacity
                  key={specialty}
                  style={[
                    styles.skillChip,
                    selectedSpecialties.includes(specialty) && styles.skillChipSelected,
                  ]}
                  onPress={() => toggleSpecialty(specialty)}
                >
                  <Text
                    style={[
                      styles.skillChipText,
                      selectedSpecialties.includes(specialty) && styles.skillChipTextSelected,
                    ]}
                  >
                    {specialty}
                  </Text>
                  {selectedSpecialties.includes(specialty) && (
                    <Ionicons name="checkmark-circle" size={18} color={colors.primary.main} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Provider Intent */}
            <Text style={styles.label}>Business Intent</Text>
            <Text style={styles.helpText}>Tell us about your business goals</Text>
            <View style={styles.intentGrid}>
              {PROVIDER_INTENTS.map((intent) => (
                <TouchableOpacity
                  key={intent.value}
                  style={[
                    styles.intentCard,
                    selectedIntent === intent.value && styles.intentCardSelected,
                  ]}
                  onPress={() => setSelectedIntent(intent.value)}
                >
                  <View style={styles.intentHeader}>
                    <Text
                      style={[
                        styles.intentLabel,
                        selectedIntent === intent.value && styles.intentLabelSelected,
                      ]}
                    >
                      {intent.label}
                    </Text>
                    {selectedIntent === intent.value && (
                      <Ionicons name="checkmark-circle" size={20} color={colors.primary.main} />
                    )}
                  </View>
                  <Text style={styles.intentDescription}>{intent.description}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Address Section */}
            <Text style={styles.label}>
              Business Address <Text style={styles.required}>*</Text>
            </Text>

            {/* Optional autocomplete helper */}
            <GooglePlacesAddressInput
              label="Quick Address Search"
              onAddressSelected={handleAddressSelected}
              placeholder="Search for your address..."
            />

            {/* Manual address fields */}
            <Controller
              control={control}
              name="street"
              rules={{ required: 'Street address is required' }}
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Street Address"
                  value={value}
                  onChangeText={onChange}
                  placeholder="123 Main St"
                  error={errors.street?.message}
                  required
                  icon="location-outline"
                />
              )}
            />

            <Controller
              control={control}
              name="city"
              rules={{ required: 'City is required' }}
              render={({ field: { onChange, value } }) => (
                <Input
                  label="City"
                  value={value}
                  onChangeText={onChange}
                  placeholder="Austin"
                  error={errors.city?.message}
                  required
                  icon="business-outline"
                />
              )}
            />

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Controller
                  control={control}
                  name="state"
                  rules={{ required: 'State is required' }}
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="State"
                      value={value}
                      onChangeText={(text) => onChange(text.toUpperCase())}
                      placeholder="TX"
                      maxLength={2}
                      error={errors.state?.message}
                      required
                    />
                  )}
                />
              </View>
              <View style={styles.halfWidth}>
                <Controller
                  control={control}
                  name="zip"
                  rules={{ required: 'ZIP code is required' }}
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="ZIP Code"
                      value={value}
                      onChangeText={onChange}
                      placeholder="78701"
                      keyboardType="numeric"
                      maxLength={5}
                      error={errors.zip?.message}
                      required
                    />
                  )}
                />
              </View>
            </View>

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
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  intentGrid: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  intentCard: {
    padding: spacing.base,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.neutral[200],
  },
  intentCardSelected: {
    backgroundColor: colors.primary.lightest,
    borderColor: colors.primary.main,
  },
  intentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  intentLabel: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
  },
  intentLabelSelected: {
    color: colors.primary.main,
  },
  intentDescription: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    lineHeight: 20,
  },
  actions: {
    gap: spacing.md,
  },
});
