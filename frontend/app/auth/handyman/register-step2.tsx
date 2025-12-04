import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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
import { contractorAPI } from '../../../src/services/api';

interface Step2Form {
  yearsExperience: string;
  businessAddress: string;
  city: string;
  state: string;
  zip: string;
}

const serviceCategories = [
  'Drywall', 'Painting', 'Electrical', 'Plumbing', 'Carpentry',
  'HVAC', 'Flooring', 'Roofing', 'Landscaping', 'Appliance',
  'Windows & Doors', 'Other',
];

export default function HandymanRegisterStep2() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Step2Form>();

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const onSubmit = async (data: Step2Form) => {
    if (selectedSkills.length === 0) {
      alert('Please select at least one skill');
      return;
    }

    setIsLoading(true);

    try {
      await contractorAPI.updateProfile({
        skills: selectedSkills,
        years_experience: parseInt(data.yearsExperience),
        business_address: {
          street: data.businessAddress,
          city: data.city,
          state: data.state,
          zip: data.zip,
        },
      } as any);

      router.push({
        pathname: '/auth/handyman/register-step3',
        params: {
          ...params,
          skills: selectedSkills.join(','),
        },
      });
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to save information. Please try again.');
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

            <Text style={styles.sectionLabel}>Business Address</Text>
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
