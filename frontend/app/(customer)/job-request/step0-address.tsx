import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../../src/constants/theme';
import { Button } from '../../../src/components/Button';
import { Input } from '../../../src/components/Input';
import { StepIndicator } from '../../../src/components/StepIndicator';
import { Card } from '../../../src/components/Card';
import { useAuth } from '../../../src/contexts/AuthContext';
import { profileAPI } from '../../../src/services/api';

interface AddressForm {
  street: string;
  city: string;
  state: string;
  zip: string;
  unitNumber?: string;
}

export default function JobRequestStep0() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AddressForm>();

  // Preload address from user's default address
  useEffect(() => {
    if (user?.addresses && user.addresses.length > 0) {
      const defaultAddress = user.addresses.find(addr => addr.isDefault) || user.addresses[0];
      if (defaultAddress) {
        setValue('street', defaultAddress.street || '');
        setValue('city', defaultAddress.city || '');
        setValue('state', defaultAddress.state || '');
        setValue('zip', defaultAddress.zipCode || '');
      }
    }
  }, [user, setValue]);

  const onSubmit = async (data: AddressForm) => {
    setIsLoading(true);

    try {
      // Save address to profile and get address_id
      const addressData = {
        street: data.street,
        city: data.city,
        state: data.state,
        zip_code: data.zip,
        is_default: true, // Mark as default for now
      };

      const savedAddress = await profileAPI.addAddress(addressData);

      // Construct full address for display
      const fullAddress = `${data.street}${data.unitNumber ? ` ${data.unitNumber}` : ''}, ${data.city}, ${data.state} ${data.zip}`;

      // Navigate to next step with address_id
      router.push({
        pathname: '/(customer)/job-request/step1-category',
        params: {
          addressId: savedAddress.id, // This is the critical change
          street: data.street,
          city: data.city,
          state: data.state,
          zip: data.zip,
          unitNumber: data.unitNumber || '',
          fullAddress,
        },
      });
    } catch (error: any) {
      console.error('Error saving address:', error);
      Alert.alert(
        'Address Error',
        error.response?.data?.detail || 'Failed to save address. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { label: 'Address', completed: false },
    { label: 'Service', completed: false },
    { label: 'Photos', completed: false },
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
              icon={<Ionicons name="close" size={24} color={colors.neutral[600]} />}
              style={styles.backButton}
            />
          </View>

          {/* Progress */}
          <StepIndicator steps={steps} currentStep={0} />

          {/* Title */}
          <View style={styles.titleSection}>
            <View style={[styles.iconCircle, { backgroundColor: colors.primary.lightest }]}>
              <Ionicons name="location" size={32} color={colors.primary.main} />
            </View>
            <Text style={styles.title}>Where's the job?</Text>
            <Text style={styles.subtitle}>
              Enter the address where you need work done
            </Text>
          </View>

          {/* Address Form */}
          <View style={styles.formSection}>
            <Controller
              control={control}
              name="street"
              rules={{ required: 'Street address is required' }}
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Street Address"
                  value={value}
                  onChangeText={onChange}
                  placeholder="123 Main Street"
                  error={errors.street?.message}
                  required
                  icon="home-outline"
                  autoComplete="street-address"
                  textContentType="streetAddressLine1"
                />
              )}
            />

            <Controller
              control={control}
              name="unitNumber"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Unit / Apt (Optional)"
                  value={value}
                  onChangeText={onChange}
                  placeholder="Apt 4B"
                  icon="business-outline"
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
                  placeholder="Baltimore"
                  error={errors.city?.message}
                  required
                  icon="locate-outline"
                  autoComplete="address-level2"
                  textContentType="addressCity"
                />
              )}
            />

            <View style={styles.row}>
              <View style={styles.stateInput}>
                <Controller
                  control={control}
                  name="state"
                  rules={{
                    required: 'State is required',
                    minLength: { value: 2, message: 'Use 2-letter state code' },
                    maxLength: { value: 2, message: 'Use 2-letter state code' },
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
                      autoComplete="address-level1"
                      textContentType="addressState"
                    />
                  )}
                />
              </View>

              <View style={styles.zipInput}>
                <Controller
                  control={control}
                  name="zip"
                  rules={{
                    required: 'ZIP code is required',
                    pattern: { value: /^\d{5}$/, message: '5-digit ZIP required' },
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
                      textContentType="postalCode"
                    />
                  )}
                />
              </View>
            </View>
          </View>

          {/* Info Card */}
          <Card variant="flat" padding="lg" style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons name="information-circle" size={24} color={colors.primary.main} />
              <Text style={styles.infoTitle}>Why do we need this?</Text>
            </View>
            <Text style={styles.infoText}>
              We use your address to match you with nearby contractors within a 50-mile radius.
              Your exact address is only shared with contractors after you accept their proposal.
            </Text>
          </Card>

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    paddingHorizontal: spacing.base,
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
