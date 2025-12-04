/**
 * Reusable Address Form Component
 *
 * Global component for collecting address data across the app.
 * Handles keyboard avoidance, state dropdown, and iOS autofill.
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import { colors, spacing, typography, borderRadius } from '../constants/theme';
import { Input } from './Input';
import { Picker } from '@react-native-picker/picker';

// U.S. States list
const US_STATES = [
  { label: 'Select State', value: '' },
  { label: 'Alabama', value: 'AL' },
  { label: 'Alaska', value: 'AK' },
  { label: 'Arizona', value: 'AZ' },
  { label: 'Arkansas', value: 'AR' },
  { label: 'California', value: 'CA' },
  { label: 'Colorado', value: 'CO' },
  { label: 'Connecticut', value: 'CT' },
  { label: 'Delaware', value: 'DE' },
  { label: 'Florida', value: 'FL' },
  { label: 'Georgia', value: 'GA' },
  { label: 'Hawaii', value: 'HI' },
  { label: 'Idaho', value: 'ID' },
  { label: 'Illinois', value: 'IL' },
  { label: 'Indiana', value: 'IN' },
  { label: 'Iowa', value: 'IA' },
  { label: 'Kansas', value: 'KS' },
  { label: 'Kentucky', value: 'KY' },
  { label: 'Louisiana', value: 'LA' },
  { label: 'Maine', value: 'ME' },
  { label: 'Maryland', value: 'MD' },
  { label: 'Massachusetts', value: 'MA' },
  { label: 'Michigan', value: 'MI' },
  { label: 'Minnesota', value: 'MN' },
  { label: 'Mississippi', value: 'MS' },
  { label: 'Missouri', value: 'MO' },
  { label: 'Montana', value: 'MT' },
  { label: 'Nebraska', value: 'NE' },
  { label: 'Nevada', value: 'NV' },
  { label: 'New Hampshire', value: 'NH' },
  { label: 'New Jersey', value: 'NJ' },
  { label: 'New Mexico', value: 'NM' },
  { label: 'New York', value: 'NY' },
  { label: 'North Carolina', value: 'NC' },
  { label: 'North Dakota', value: 'ND' },
  { label: 'Ohio', value: 'OH' },
  { label: 'Oklahoma', value: 'OK' },
  { label: 'Oregon', value: 'OR' },
  { label: 'Pennsylvania', value: 'PA' },
  { label: 'Rhode Island', value: 'RI' },
  { label: 'South Carolina', value: 'SC' },
  { label: 'South Dakota', value: 'SD' },
  { label: 'Tennessee', value: 'TN' },
  { label: 'Texas', value: 'TX' },
  { label: 'Utah', value: 'UT' },
  { label: 'Vermont', value: 'VT' },
  { label: 'Virginia', value: 'VA' },
  { label: 'Washington', value: 'WA' },
  { label: 'West Virginia', value: 'WV' },
  { label: 'Wisconsin', value: 'WI' },
  { label: 'Wyoming', value: 'WY' },
];

interface AddressFormData {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  unitNumber?: string;
}

interface AddressFormProps {
  control: Control<AddressFormData>;
  errors: FieldErrors<AddressFormData>;
  setValue?: (name: keyof AddressFormData, value: string) => void;
  defaultValues?: Partial<AddressFormData>;
  showUnitNumber?: boolean;
}

export function AddressForm({
  control,
  errors,
  setValue,
  defaultValues,
  showUnitNumber = true,
}: AddressFormProps) {
  // Track if we've already initialized to prevent infinite loops
  const isInitialized = useRef(false);

  // Preload default values if provided (only once)
  useEffect(() => {
    console.log('[AddressForm] useEffect triggered', {
      isInitialized: isInitialized.current,
      hasDefaultValues: !!defaultValues,
      hasSetValue: !!setValue,
      defaultValues,
    });

    if (!isInitialized.current && defaultValues && setValue) {
      console.log('[AddressForm] Setting default values...');
      if (defaultValues.street) setValue('street', defaultValues.street);
      if (defaultValues.city) setValue('city', defaultValues.city);
      if (defaultValues.state) setValue('state', defaultValues.state);
      if (defaultValues.zipCode) setValue('zipCode', defaultValues.zipCode);
      if (defaultValues.unitNumber) setValue('unitNumber', defaultValues.unitNumber);
      isInitialized.current = true;
      console.log('[AddressForm] Default values set, isInitialized = true');
    }
  }, [defaultValues, setValue]);

  return (
    <View style={styles.container}>
      {/* Street Address */}
          <Controller
            control={control}
            name="street"
            rules={{ required: 'Street address is required' }}
            render={({ field: { onChange, value } }) => (
              <Input
                label="Street Address"
                value={value}
                onChangeText={onChange}
                placeholder="Your Street"
                error={errors.street?.message}
                required
                icon="home-outline"
                autoComplete="street-address"
                textContentType="streetAddressLine1"
              />
            )}
          />

          {/* Unit Number (Optional) */}
          {showUnitNumber && (
            <Controller
              control={control}
              name="unitNumber"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Unit / Apt (Optional)"
                  value={value}
                  onChangeText={onChange}
                  placeholder="Apt or Suite"
                  icon="business-outline"
                  textContentType="streetAddressLine2"
                />
              )}
            />
          )}

          {/* City */}
          <Controller
            control={control}
            name="city"
            rules={{ required: 'City is required' }}
            render={({ field: { onChange, value } }) => (
              <Input
                label="City"
                value={value}
                onChangeText={onChange}
                placeholder="Your City"
                error={errors.city?.message}
                required
                icon="locate-outline"
                autoComplete="address-level2"
                textContentType="addressCity"
              />
            )}
          />

          {/* State & ZIP Row */}
          <View style={styles.row}>
            {/* State Dropdown */}
            <View style={styles.stateContainer}>
              <Text style={styles.label}>
                State <Text style={styles.required}>*</Text>
              </Text>
              <Controller
                control={control}
                name="state"
                rules={{ required: 'State is required' }}
                render={({ field: { onChange, value } }) => {
                  console.log('[AddressForm] State picker render - value:', value);
                  return (
                    <View style={[styles.pickerContainer, errors.state && styles.pickerError]}>
                      <Picker
                        selectedValue={value}
                        onValueChange={(newValue) => {
                          console.log('[AddressForm] State picker changed:', newValue);
                          onChange(newValue);
                        }}
                        style={styles.picker}
                      >
                        {US_STATES.map((state) => (
                          <Picker.Item
                            key={state.value}
                            label={state.label}
                            value={state.value}
                          />
                        ))}
                      </Picker>
                    </View>
                  );
                }}
              />
              {errors.state && (
                <Text style={styles.errorText}>{errors.state.message}</Text>
              )}
            </View>

            {/* ZIP Code */}
            <View style={styles.zipContainer}>
              <Controller
                control={control}
                name="zipCode"
                rules={{
                  required: 'ZIP code is required',
                  pattern: { value: /^\d{5}$/, message: '5-digit ZIP required' },
                }}
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="ZIP Code"
                    value={value}
                    onChangeText={onChange}
                    placeholder="ZIP"
                    error={errors.zipCode?.message}
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
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.base,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.base,
  },
  stateContainer: {
    width: 140,
  },
  zipContainer: {
    flex: 1,
  },
  label: {
    ...typography.body.regular,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.sm,
  },
  required: {
    color: colors.error.main,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.primary,
    overflow: 'hidden',
  },
  pickerError: {
    borderColor: colors.error.main,
  },
  picker: {
    height: 50,
    color: colors.neutral[900],
  },
  errorText: {
    ...typography.caption.small,
    color: colors.error.main,
    marginTop: spacing.xs,
  },
});
