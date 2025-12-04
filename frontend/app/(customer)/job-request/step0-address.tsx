import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../../src/constants/theme';
import { Button } from '../../../src/components/Button';
import { StepIndicator } from '../../../src/components/StepIndicator';
import { Card } from '../../../src/components/Card';
import { AddressForm } from '../../../src/components/AddressForm';
import { useAuth } from '../../../src/contexts/AuthContext';
import { profileAPI } from '../../../src/services/api';

interface AddressFormData {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  unitNumber?: string;
}

export default function JobRequestStep0() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
    watch,
  } = useForm<AddressFormData>({
    mode: 'onChange',
    defaultValues: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      unitNumber: '',
    },
  });

  // Get default values from user's address
  const defaultValues = user?.addresses && user.addresses.length > 0
    ? {
        street: user.addresses[0].street || '',
        city: user.addresses[0].city || '',
        state: user.addresses[0].state || '',
        zipCode: user.addresses[0].zipCode || '',
      }
    : undefined;

  const onSubmit = async (data: AddressFormData) => {
    setIsLoading(true);

    try {
      // Save address to profile
      const addressData = {
        street: data.street,
        city: data.city,
        state: data.state,
        zip_code: data.zipCode,
        is_default: true,
      };

      await profileAPI.addAddress(addressData);

      // Refresh user to get updated addresses with IDs
      await refreshUser();

      // After refresh, user.addresses should have the new address with ID
      // Get the most recent address (should be the one we just added)
      const updatedUser = await refreshUser();

      // Find the address we just added (should be the default one or the last one)
      const savedAddress = updatedUser?.addresses?.find((addr: any) => addr.isDefault)
        || updatedUser?.addresses?.[updatedUser.addresses.length - 1];

      if (!savedAddress || !savedAddress.id) {
        throw new Error('Failed to get address ID after saving');
      }

      // Construct full address for display
      const fullAddress = `${data.street}${data.unitNumber ? ` ${data.unitNumber}` : ''}, ${data.city}, ${data.state} ${data.zipCode}`;

      // Navigate to next step with address_id
      router.push({
        pathname: '/(customer)/job-request/step1-category',
        params: {
          addressId: savedAddress.id,
          street: data.street,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          unitNumber: data.unitNumber || '',
          fullAddress,
        },
      });
    } catch (error: any) {
      console.error('Error saving address:', error);
      Alert.alert(
        'Address Error',
        error.response?.data?.detail || error.message || 'Failed to save address. Please try again.'
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

  // Check if form is filled
  const formValues = watch();
  const isFormFilled = formValues.street && formValues.city && formValues.state && formValues.zipCode && formValues.zipCode.length === 5;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.wrapper}>
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
        <View style={styles.progressSection}>
          <StepIndicator steps={steps} currentStep={0} />
        </View>

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
          <AddressForm
            control={control}
            errors={errors}
            setValue={setValue}
            defaultValues={defaultValues}
            showUnitNumber={true}
          />
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
            disabled={!isFormFilled || isLoading}
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  wrapper: {
    flex: 1,
    paddingHorizontal: spacing.xl,
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
  progressSection: {
    marginBottom: spacing.lg,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
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
    flex: 1,
    marginBottom: spacing.lg,
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
    paddingBottom: spacing.xl,
  },
});
