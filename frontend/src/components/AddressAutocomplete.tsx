/**
 * Address Input with Geocoding Verification
 *
 * Uses separate fields (street, city, state, ZIP) for:
 * - Browser/OS autofill support
 * - Accurate geocoding with Google Maps API
 * - Proper geofencing and mileage tracking
 * - Better data validation
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
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
  initialValue?: Partial<AddressComponents>;
  label?: string;
  required?: boolean;
  error?: string;
}

export function AddressAutocomplete({
  onAddressSelected,
  initialValue,
  label = 'Business Address',
  required = false,
  error,
}: AddressAutocompleteProps) {
  const [street, setStreet] = useState(initialValue?.street || '');
  const [city, setCity] = useState(initialValue?.city || '');
  const [state, setState] = useState(initialValue?.state || '');
  const [zipCode, setZipCode] = useState(initialValue?.zipCode || '');

  const [loading, setLoading] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  // Reset verified state when address fields change
  useEffect(() => {
    setVerified(false);
    setErrorState(null);
  }, [street, city, state, zipCode]);

  const validateFields = (): boolean => {
    if (!street.trim()) {
      setErrorState('Street address is required');
      return false;
    }
    if (!city.trim()) {
      setErrorState('City is required');
      return false;
    }
    if (!state.trim()) {
      setErrorState('State is required');
      return false;
    }
    if (!zipCode.trim()) {
      setErrorState('ZIP code is required');
      return false;
    }
    if (!/^\d{5}(-\d{4})?$/.test(zipCode.trim())) {
      setErrorState('ZIP code must be 5 digits (e.g., 21201)');
      return false;
    }
    return true;
  };

  const handleVerifyAddress = async () => {
    if (!validateFields()) {
      return;
    }

    setLoading(true);
    setErrorState(null);

    try {
      // Construct full address for geocoding
      const fullAddress = `${street}, ${city}, ${state} ${zipCode}, USA`;

      const apiKey = process.env.EXPO_PUBLIC_RADAR_API_KEY;

      if (!apiKey) {
        throw new Error('Radar API key not configured');
      }

      console.log('Verifying address with Radar.io:', fullAddress);

      const response = await fetch(
        `https://api.radar.io/v1/geocode/forward?query=${encodeURIComponent(fullAddress)}`,
        {
          headers: {
            'Authorization': apiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      console.log('Radar.io API response:', data);

      if (!data.addresses || data.addresses.length === 0) {
        setErrorState('Could not verify this address. Please check spelling and try again.');
        return;
      }

      const result = data.addresses[0];

      // Extract address components from Radar response
      const latitude = result.latitude;
      const longitude = result.longitude;
      const verifiedStreet = result.addressLabel || result.formattedAddress?.split(',')[0] || street;
      const geoCity = result.city || city;
      const geoState = result.stateCode || result.state || state;
      const geoZipCode = result.postalCode || zipCode;

      // Check for missing components
      if (!verifiedStreet) {
        setErrorState('Street address not found. Please enter a complete street address.');
        return;
      }
      if (!geoCity) {
        setErrorState('City not found. Please check city name.');
        return;
      }
      if (!geoState) {
        setErrorState('State not found. Please check state abbreviation.');
        return;
      }
      if (!geoZipCode) {
        setErrorState('ZIP code not found. Please check ZIP code.');
        return;
      }

      console.log('✅ Address verified with Radar.io coordinates:', latitude, longitude);

      // Success - pass verified address to parent
      onAddressSelected({
        street: verifiedStreet,
        city: geoCity,
        state: geoState,
        zipCode: geoZipCode,
        latitude,
        longitude,
        formattedAddress: result.formattedAddress || fullAddress,
      });

      setVerified(true);

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

      <Text style={styles.helpText}>
        Enter your business address for accurate geolocation and mileage tracking
      </Text>

      {/* Street Address */}
      <TextInput
        style={[styles.textInput, (error || errorState) && !verified ? styles.textInputError : null]}
        placeholder="Street Address (e.g., 123 Main St)"
        placeholderTextColor={colors.neutral[500]}
        value={street}
        onChangeText={setStreet}
        editable={!loading}
        autoComplete="street-address"
        textContentType="streetAddressLine1"
      />

      {/* City and State Row */}
      <View style={styles.row}>
        <View style={styles.cityInput}>
          <TextInput
            style={[styles.textInput, (error || errorState) && !verified ? styles.textInputError : null]}
            placeholder="City"
            placeholderTextColor={colors.neutral[500]}
            value={city}
            onChangeText={setCity}
            editable={!loading}
            autoComplete="address-line2"
            textContentType="addressCity"
          />
        </View>

        <View style={styles.stateInput}>
          <TextInput
            style={[styles.textInput, (error || errorState) && !verified ? styles.textInputError : null]}
            placeholder="State"
            placeholderTextColor={colors.neutral[500]}
            value={state}
            onChangeText={(text) => setState(text.toUpperCase())}
            editable={!loading}
            maxLength={2}
            autoCapitalize="characters"
            autoComplete="address-line1"
            textContentType="addressState"
          />
        </View>

        <View style={styles.zipInput}>
          <TextInput
            style={[styles.textInput, (error || errorState) && !verified ? styles.textInputError : null]}
            placeholder="ZIP"
            placeholderTextColor={colors.neutral[500]}
            value={zipCode}
            onChangeText={setZipCode}
            editable={!loading}
            keyboardType="numeric"
            maxLength={10}
            autoComplete="postal-code"
            textContentType="postalCode"
          />
        </View>
      </View>

      {/* Error Message */}
      {(error || errorState) && !verified && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={16} color={colors.error.main} />
          <Text style={styles.errorText}>{error || errorState}</Text>
        </View>
      )}

      {/* Verified Indicator */}
      {verified && (
        <View style={styles.verifiedContainer}>
          <Ionicons name="checkmark-circle" size={20} color={colors.success.main} />
          <Text style={styles.verifiedText}>Address verified and geocoded ✓</Text>
        </View>
      )}

      {/* Verify Button */}
      <TouchableOpacity
        style={[
          styles.verifyButton,
          loading && styles.verifyButtonDisabled,
          verified && styles.verifyButtonSuccess
        ]}
        onPress={handleVerifyAddress}
        disabled={loading || verified}
      >
        {loading ? (
          <>
            <ActivityIndicator size="small" color="white" />
            <Text style={styles.verifyButtonText}>Verifying address...</Text>
          </>
        ) : verified ? (
          <>
            <Ionicons name="checkmark-circle" size={20} color="white" />
            <Text style={styles.verifyButtonText}>Verified ✓</Text>
          </>
        ) : (
          <>
            <Ionicons name="location" size={20} color="white" />
            <Text style={styles.verifyButtonText}>Verify Address & Get Coordinates</Text>
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
    fontWeight: typography.weights.semibold as any,
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
  } as any,
  textInput: {
    minHeight: 48,
    color: colors.neutral[900],
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    ...typography.sizes.base,
  },
  textInputError: {
    borderColor: colors.error.main,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  cityInput: {
    flex: 2,
  },
  stateInput: {
    flex: 1,
    minWidth: 70,
  },
  zipInput: {
    flex: 1,
    minWidth: 90,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  errorText: {
    ...typography.sizes.sm,
    color: colors.error.main,
    flex: 1,
  },
  verifiedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.success.lightest,
    borderRadius: borderRadius.sm,
  },
  verifiedText: {
    ...typography.sizes.sm,
    color: colors.success.main,
    fontWeight: typography.weights.semibold,
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
    marginTop: spacing.sm,
    ...shadows.sm,
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifyButtonSuccess: {
    backgroundColor: colors.success.main,
  },
  verifyButtonText: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold as any,
    color: 'white',
  },
});
