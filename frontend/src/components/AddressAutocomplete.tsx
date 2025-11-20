/**
 * Address Autocomplete with Verification
 *
 * TEMPORARY: Simplified to plain TextInput to prevent GooglePlacesAutocomplete crashes
 * TODO: Replace with stable autocomplete solution or direct Google Places API calls
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../constants/theme';

export interface AddressComponents {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  formattedAddress: string;
}

interface AddressAutocompleteProps {
  onAddressSelected: (address: AddressComponents) => void;
  initialValue?: string;
  placeholder?: string;
  label?: string;
  required?: boolean;
  error?: string;
}

export function AddressAutocomplete({
  onAddressSelected,
  initialValue = '',
  placeholder = 'Enter your full business address',
  label = 'Business Address',
  required = false,
  error,
}: AddressAutocompleteProps) {
  const [addressInput, setAddressInput] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);

  const handleVerifyAddress = async () => {
    if (!addressInput.trim()) {
      setErrorState('Please enter your business address');
      return;
    }

    setLoading(true);
    setErrorState(null);

    try {
      // Call Google Geocoding API directly (more stable than Places Autocomplete)
      const apiKey = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;

      if (!apiKey) {
        throw new Error('Google API key not configured');
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addressInput)}&key=${apiKey}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'ZERO_RESULTS') {
        setErrorState('Could not find this address. Please check and try again.');
        return;
      }

      if (data.status !== 'OK' || !data.results || data.results.length === 0) {
        throw new Error(`Geocoding failed: ${data.status}`);
      }

      const result = data.results[0];
      const components = result.address_components || [];

      // Parse address components
      const streetNumber = components.find((c: any) => c.types.includes('street_number'))?.long_name || '';
      const route = components.find((c: any) => c.types.includes('route'))?.long_name || '';
      const street = `${streetNumber} ${route}`.trim();
      const city = components.find((c: any) => c.types.includes('locality'))?.long_name ||
                   components.find((c: any) => c.types.includes('sublocality'))?.long_name || '';
      const state = components.find((c: any) => c.types.includes('administrative_area_level_1'))?.short_name || '';
      const zipCode = components.find((c: any) => c.types.includes('postal_code'))?.long_name || '';

      const latitude = result.geometry.location.lat;
      const longitude = result.geometry.location.lng;

      if (!street || !city || !state || !zipCode) {
        setErrorState('Address incomplete. Please enter a full street address with city, state, and ZIP code.');
        return;
      }

      // Success - pass verified address to parent
      onAddressSelected({
        street,
        city,
        state,
        zipCode,
        latitude,
        longitude,
        formattedAddress: result.formatted_address,
      });

    } catch (err: any) {
      console.error('Address verification error:', err);
      setErrorState(err.message || 'Could not verify address. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Label */}
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      {/* Simple Text Input (No Autocomplete - Prevents Crashes) */}
      <TextInput
        style={[
          styles.textInput,
          (error || errorState) ? styles.textInputError : null,
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.neutral[500]}
        value={addressInput}
        onChangeText={setAddressInput}
        editable={!loading}
        multiline
        numberOfLines={2}
      />

      {/* Error Message */}
      {(error || errorState) && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={16} color={colors.error.main} />
          <Text style={styles.errorText}>{error || errorState}</Text>
        </View>
      )}

      {/* Help Text */}
      <Text style={styles.helpText}>
        Enter your full business address (street, city, state, ZIP)
      </Text>

      {/* Verify Button */}
      <TouchableOpacity
        style={[styles.verifyButton, loading && styles.verifyButtonDisabled]}
        onPress={handleVerifyAddress}
        disabled={loading}
      >
        {loading ? (
          <>
            <ActivityIndicator size="small" color="white" />
            <Text style={styles.verifyButtonText}>Verifying address...</Text>
          </>
        ) : (
          <>
            <Ionicons name="checkmark-circle" size={20} color="white" />
            <Text style={styles.verifyButtonText}>Verify & Continue</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
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
  textInput: {
    minHeight: 60,
    color: colors.neutral[900],
    fontSize: 16,
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...typography.sizes.base,
    textAlignVertical: 'top',
  },
  textInputError: {
    borderColor: colors.error.main,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  errorText: {
    ...typography.sizes.sm,
    color: colors.error.main,
    flex: 1,
  },
  helpText: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary.main,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: 'white',
  },
});
