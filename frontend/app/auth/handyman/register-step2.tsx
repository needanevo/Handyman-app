import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../../src/constants/theme';
import { Button } from '../../../src/components/Button';
import { Input } from '../../../src/components/Input';
import { PhotoUploader } from '../../../src/components/PhotoUploader';
import { handymanAPI, authAPI } from '../../../src/services/api';
import { useAuth } from '../../../src/contexts/AuthContext';

interface Step2Form {
  yearsExperience: string;
  businessAddress: string;
  city: string;
  state: string;
  zip: string;
  customSkills: string;
}

const serviceCategories = [
  'Drywall', 'Painting', 'Electrical', 'Plumbing', 'Carpentry',
  'HVAC', 'Flooring', 'Roofing', 'Landscaping', 'Appliance',
  'Windows & Doors', 'Other',
];

// Handymen don't need business intent - they work solo by definition
// Only contractors have team-building/mentoring options

export default function HandymanRegisterStep2() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [profilePhoto, setProfilePhoto] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Step2Form>();

  // Hydrate form with existing user data
  useEffect(() => {
    console.log('[Step2] useEffect triggered, user:', user ? 'exists' : 'null');

    if (!user) {
      console.log('[Step2] User not available yet, waiting...');
      return;
    }

    console.log('[Step2] Hydrating form with user data:', {
      skills: user.skills,
      yearsExperience: user.yearsExperience,
      addresses: user.addresses,
      profilePhoto: user.profilePhoto
    });

    // Populate skills
    if (user.skills && user.skills.length > 0) {
      console.log('[Step2] Setting skills:', user.skills);
      setSelectedSkills(user.skills);
    }

    // Populate years of experience
    if (user.yearsExperience != null) {
      console.log('[Step2] Setting years experience:', user.yearsExperience);
      setValue('yearsExperience', user.yearsExperience.toString());
    }

    // Populate address fields
    if (user.addresses && user.addresses.length > 0) {
      const addr = user.addresses[0];
      console.log('[Step2] Setting address:', addr);
      setValue('businessAddress', addr.street || '');
      setValue('city', addr.city || '');
      setValue('state', addr.state || '');
      setValue('zip', addr.zipCode || '');
    }

    // Populate profile photo
    if (user.profilePhoto) {
      console.log('[Step2] Setting profile photo:', user.profilePhoto);
      setProfilePhoto([user.profilePhoto]);
    }

    console.log('[Step2] Form hydration complete');
  }, [user, setValue]);

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const onSubmit = async (data: Step2Form) => {
    if (selectedSkills.length === 0) {
      Alert.alert('Error', 'Please select at least one skill');
      return;
    }

    setIsLoading(true);

    try {
      // Build final skills array: standard categories + custom skills (excluding "Other")
      const standardSkills = selectedSkills.filter(skill => skill !== 'Other');

      // Parse custom skills if "Other" was selected
      const customSkillsList = selectedSkills.includes('Other') && data.customSkills
        ? data.customSkills
            .split(',')
            .map(s => s.trim())
            .filter(s => s.length > 0)
        : [];

      // Combine and deduplicate
      const allSkills = [...new Set([...standardSkills, ...customSkillsList])];

      await handymanAPI.updateProfile({
        skills: allSkills,
        years_experience: parseInt(data.yearsExperience),
        business_address: {
          street: data.businessAddress,
          city: data.city,
          state: data.state,
          zip: data.zip,
        },
      } as any);

      // Track onboarding step completion (Phase 5B-1)
      try {
        await authAPI.updateOnboardingStep(2);
        console.log('✅ Step 2 progress saved');
      } catch (stepError) {
        console.warn('Failed to save step progress:', stepError);
        // Don't block navigation if step tracking fails
      }

      router.push('/auth/handyman/register-step3');
    } catch (error: any) {
      console.error('[Step2] Update error:', error);
      console.error('[Step2] Error response:', error?.response?.data);
      console.error('[Step2] Error message:', error?.message);

      const errorMessage = error?.response?.data?.detail || error?.message || 'Failed to save information. Please try again.';
      Alert.alert('Update Error', errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.content}>
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

          <View style={styles.progressBar}>
            <View style={[styles.progressSegment, styles.progressActive]} />
            <View style={[styles.progressSegment, styles.progressActive]} />
            <View style={styles.progressSegment} />
            <View style={styles.progressSegment} />
          </View>

          <View style={styles.titleSection}>
            <View style={styles.iconBadge}>
              <Ionicons name="construct" size={32} color="#FFA500" />
            </View>
            <Text style={styles.title}>Skills & Service Area</Text>
            <Text style={styles.subtitle}>
              Tell us what you can do and where you work
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              What can you do? <Text style={styles.required}>*</Text>
            </Text>
            <Text style={styles.sectionHelp}>Select all that apply</Text>
            <View style={styles.skillsGrid}>
              {serviceCategories.map((skill) => (
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
                    <Ionicons name="checkmark-circle" size={18} color="#FFA500" />
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
                      helpText="List any additional skills not covered above (comma-separated)"
                    />
                  )}
                />
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              Profile Photo <Text style={styles.optionalLabel}>(Optional)</Text>
            </Text>
            <Text style={styles.sectionHelp}>
              Add a professional photo to help customers recognize you
            </Text>
            <PhotoUploader
              photos={profilePhoto}
              onPhotosChange={setProfilePhoto}
              maxPhotos={1}
              label="Take or upload photo"
              customUpload={async (file: { uri: string; type: string; name: string }) => {
                const response = await handymanAPI.uploadProfilePhoto(file);
                return response;
              }}
            />
          </View>

          <View style={styles.formSection}>
            <Controller
              control={control}
              name="yearsExperience"
              rules={{ required: 'Years of experience required' }}
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Years of Experience"
                  value={value}
                  onChangeText={onChange}
                  placeholder="3"
                  keyboardType="numeric"
                  error={errors.yearsExperience?.message}
                  required
                  icon="calendar-outline"
                  helpText="Rough estimate is fine"
                />
              )}
            />

            <Text style={styles.sectionLabel}>Home Address</Text>
            <Text style={styles.sectionHelp}>
              Where you're based (used for 50-mile radius matching)
            </Text>

            <Controller
              control={control}
              name="businessAddress"
              rules={{ required: 'Address required' }}
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Street Address"
                  value={value}
                  onChangeText={onChange}
                  placeholder="123 Main Street"
                  error={errors.businessAddress?.message}
                  required
                  autoComplete="street-address"
                />
              )}
            />

            <Controller
              control={control}
              name="city"
              rules={{ required: 'City required' }}
              render={({ field: { onChange, value } }) => (
                <Input
                  label="City"
                  value={value}
                  onChangeText={onChange}
                  placeholder="Baltimore"
                  error={errors.city?.message}
                  required
                  autoComplete="address-line2"
                />
              )}
            />

            <View style={styles.row}>
              <View style={styles.stateInput}>
                <Controller
                  control={control}
                  name="state"
                  rules={{
                    required: 'State required',
                    minLength: { value: 2, message: '2-letter code' },
                    maxLength: { value: 2, message: '2-letter code' },
                  }}
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="State"
                      value={value}
                      onChangeText={(text) => onChange(text.toUpperCase())}
                      placeholder="MD"
                      error={errors.state?.message}
                      required
                      maxLength={2}
                      autoCapitalize="characters"
                      autoComplete="address-line1"
                    />
                  )}
                />
              </View>
              <View style={styles.zipInput}>
                <Controller
                  control={control}
                  name="zip"
                  rules={{
                    required: 'ZIP required',
                    pattern: { value: /^\d{5}$/, message: '5 digits' },
                  }}
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="ZIP Code"
                      value={value}
                      onChangeText={onChange}
                      placeholder="21201"
                      error={errors.zip?.message}
                      required
                      keyboardType="numeric"
                      maxLength={5}
                      autoComplete="postal-code"
                    />
                  )}
                />
              </View>
            </View>
          </View>

          <View style={styles.actions}>
            <Button
              title="Continue"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              size="large"
              fullWidth
              disabled={selectedSkills.length === 0}
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
  progressBar: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    backgroundColor: colors.neutral[200],
    borderRadius: 2,
  },
  progressActive: {
    backgroundColor: '#FFA500',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  iconBadge: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.full,
    backgroundColor: '#FFA50020',
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
    marginBottom: spacing.xs,
  },
  sectionHelp: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    marginBottom: spacing.md,
  },
  required: {
    color: colors.error.main,
  },
  optionalLabel: {
    color: colors.neutral[500],
    fontWeight: typography.weights.normal,
  },
  customSkillsSection: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.neutral[200],
  },
  skillChipSelected: {
    backgroundColor: '#FFA50020',
    borderColor: '#FFA500',
  },
  skillChipText: {
    ...typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.neutral[700],
  },
  skillChipTextSelected: {
    color: '#FFA500',
    fontWeight: typography.weights.semibold,
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
    backgroundColor: '#FFA50020',
    borderColor: '#FFA500',
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
    color: '#FFA500',
  },
  intentDescription: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    lineHeight: 20,
  },
  formSection: {
    gap: spacing.base,
    marginBottom: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.base,
  },
  stateInput: {
    width: 100,
  },
  zipInput: {
    flex: 1,
  },
  actions: {
    gap: spacing.md,
  },
});
