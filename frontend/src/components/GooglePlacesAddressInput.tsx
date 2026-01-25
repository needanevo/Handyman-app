/**
 * Google Places Address Autocomplete Input
 *
 * Uses Google Places Autocomplete for address suggestions.
 * On selection, extracts structured address components.
 *
 * Data stored:
 * - street (line1), line2 (optional), city, state, postal_code, country
 * - place_id (for future verification)
 * - lat/lng (for distance calculations)
 */

import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { GooglePlacesAutocomplete, GooglePlaceData, GooglePlaceDetail } from 'react-native-google-places-autocomplete';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../constants/theme';
import { Input } from './Input';

export interface StructuredAddress {
  street: string;       // line1 - street number + street name
  line2?: string;       // apt/suite/unit (manual input)
  city: string;
  state: string;        // 2-letter state code
  zipCode: string;      // postal code
  country: string;      // ISO country code (default: US)
  latitude?: number;
  longitude?: number;
  placeId?: string;     // Google Places place_id
  formattedAddress?: string;  // Full formatted address
}

interface GooglePlacesAddressInputProps {
  onAddressSelected: (address: StructuredAddress) => void;
  initialValue?: Partial<StructuredAddress>;
  label?: string;
  required?: boolean;
  error?: string;
  placeholder?: string;
  zipFirst?: boolean;  // If true, collect ZIP code first to narrow results
}

// Extract address components from Google Places result
function parseAddressComponents(
  details: GooglePlaceDetail | null
): Partial<StructuredAddress> {
  if (!details?.address_components) {
    return {};
  }

  const components: { [key: string]: string } = {};

  for (const component of details.address_components) {
    const type = component.types[0];
    if (type === 'street_number') {
      components.street_number = component.long_name;
    } else if (type === 'route') {
      components.route = component.long_name;
    } else if (type === 'locality') {
      components.city = component.long_name;
    } else if (type === 'administrative_area_level_1') {
      components.state = component.short_name; // Use short_name for state code
    } else if (type === 'postal_code') {
      components.zipCode = component.long_name;
    } else if (type === 'country') {
      components.country = component.short_name;
    } else if (type === 'sublocality_level_1' || type === 'neighborhood') {
      // Fallback for city if locality is not available
      if (!components.city) {
        components.city = component.long_name;
      }
    }
  }

  // Construct street from number + route
  const street = components.street_number
    ? `${components.street_number} ${components.route || ''}`
    : components.route || '';

  return {
    street: street.trim(),
    city: components.city || '',
    state: components.state || '',
    zipCode: components.zipCode || '',
    country: components.country || 'US',
    latitude: details.geometry?.location?.lat,
    longitude: details.geometry?.location?.lng,
    placeId: details.place_id,
    formattedAddress: details.formatted_address,
  };
}

export function GooglePlacesAddressInput({
  onAddressSelected,
  initialValue,
  label = 'Address',
  required = false,
  error,
  placeholder = 'Start typing your address...',
  zipFirst = true,  // Default to ZIP-first for better results
}: GooglePlacesAddressInputProps) {
  const ref = useRef<any>(null);
  const [zipCode, setZipCode] = useState(initialValue?.zipCode || '');
  const [zipConfirmed, setZipConfirmed] = useState(!!initialValue?.zipCode);
  const [line2, setLine2] = useState(initialValue?.line2 || '');
  const [selectedAddress, setSelectedAddress] = useState<StructuredAddress | null>(
    initialValue?.street ? (initialValue as StructuredAddress) : null
  );
  const [displayText, setDisplayText] = useState(
    initialValue?.formattedAddress ||
    (initialValue?.street ? `${initialValue.street}, ${initialValue.city}, ${initialValue.state} ${initialValue.zipCode}` : '')
  );

  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;

  // Validate ZIP code format
  const isValidZip = /^\d{5}$/.test(zipCode);

  // Handle ZIP code confirmation
  const handleZipConfirm = () => {
    if (isValidZip) {
      setZipConfirmed(true);
    }
  };

  // Update line2 separately (not part of autocomplete)
  useEffect(() => {
    if (selectedAddress) {
      onAddressSelected({
        ...selectedAddress,
        line2: line2 || undefined,
      });
    }
  }, [line2]);

  // Set initial text if we have an address
  useEffect(() => {
    if (initialValue?.street && ref.current) {
      const text = initialValue.formattedAddress ||
        `${initialValue.street}, ${initialValue.city}, ${initialValue.state} ${initialValue.zipCode}`;
      ref.current.setAddressText(text);
      setDisplayText(text);
    }
  }, []);

  const handlePlaceSelect = (data: GooglePlaceData, details: GooglePlaceDetail | null) => {
    console.log('[GooglePlacesAddressInput] Place selected:', data.description);

    const parsed = parseAddressComponents(details);

    const address: StructuredAddress = {
      street: parsed.street || data.structured_formatting?.main_text || '',
      line2: line2 || undefined,
      city: parsed.city || '',
      state: parsed.state || '',
      zipCode: parsed.zipCode || '',
      country: parsed.country || 'US',
      latitude: parsed.latitude,
      longitude: parsed.longitude,
      placeId: details?.place_id || data.place_id,
      formattedAddress: details?.formatted_address || data.description,
    };

    console.log('[GooglePlacesAddressInput] Parsed address:', address);

    setSelectedAddress(address);
    setDisplayText(data.description);
    onAddressSelected(address);
  };

  if (!apiKey) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Google Places API key not configured. Please add EXPO_PUBLIC_GOOGLE_PLACES_API_KEY to .env
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      {/* ZIP Code First Step */}
      {zipFirst && !zipConfirmed && (
        <View style={styles.zipFirstContainer}>
          <Text style={styles.helpText}>
            Enter your ZIP code to help us find your address
          </Text>
          <View style={styles.zipRow}>
            <TextInput
              style={[
                styles.zipInput,
                !isValidZip && zipCode.length > 0 && styles.inputError,
              ]}
              placeholder="Enter ZIP code"
              placeholderTextColor={colors.neutral[500]}
              value={zipCode}
              onChangeText={setZipCode}
              keyboardType="numeric"
              maxLength={5}
              autoFocus
            />
            <TouchableOpacity
              style={[
                styles.zipConfirmButton,
                !isValidZip && styles.zipConfirmButtonDisabled,
              ]}
              onPress={handleZipConfirm}
              disabled={!isValidZip}
            >
              <Text style={styles.zipConfirmText}>Continue</Text>
              <Ionicons name="arrow-forward" size={18} color="white" />
            </TouchableOpacity>
          </View>
          {!isValidZip && zipCode.length > 0 && (
            <Text style={styles.zipError}>Please enter a valid 5-digit ZIP code</Text>
          )}
        </View>
      )}

      {/* Address Autocomplete (shown after ZIP confirmed or if zipFirst is false) */}
      {(!zipFirst || zipConfirmed) && (
        <View style={styles.autocompleteContainer}>
          {zipFirst && (
            <View style={styles.zipBadge}>
              <Ionicons name="location" size={14} color={colors.primary.main} />
              <Text style={styles.zipBadgeText}>Searching near {zipCode}</Text>
              <TouchableOpacity onPress={() => setZipConfirmed(false)}>
                <Text style={styles.changeZipText}>Change</Text>
              </TouchableOpacity>
            </View>
          )}
          <GooglePlacesAutocomplete
            ref={ref}
            placeholder={zipFirst ? 'Search for your street address...' : placeholder}
            fetchDetails={true}
            onPress={handlePlaceSelect}
            query={{
              key: apiKey,
              language: 'en',
              components: 'country:us',
              types: 'address',
              // Use ZIP code to bias results if available
              ...(zipFirst && zipCode ? { location: `${zipCode}, USA` } : {}),
            }}
            predefinedPlaces={[]}
            // Bias results to the ZIP code area
            {...(zipFirst && zipCode ? {
              GooglePlacesSearchQuery: {
                rankby: 'distance',
              },
              filterReverseGeocodingByTypes: ['street_address', 'route'],
            } : {})}
          styles={{
            container: {
              flex: 0,
            },
            textInputContainer: {
              backgroundColor: 'transparent',
            },
            textInput: {
              height: 48,
              color: colors.neutral[900],
              fontSize: 16,
              backgroundColor: colors.background.primary,
              borderWidth: 1,
              borderColor: error ? colors.error.main : colors.neutral[300],
              borderRadius: borderRadius.md,
              paddingHorizontal: spacing.md,
            },
            listView: {
              backgroundColor: colors.background.primary,
              borderWidth: 1,
              borderColor: colors.neutral[200],
              borderRadius: borderRadius.md,
              marginTop: 4,
              ...Platform.select({
                ios: {
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                },
                android: {
                  elevation: 3,
                },
              }),
            },
            row: {
              backgroundColor: colors.background.primary,
              padding: spacing.md,
            },
            separator: {
              height: 1,
              backgroundColor: colors.neutral[200],
            },
            description: {
              color: colors.neutral[900],
              fontSize: 14,
            },
            poweredContainer: {
              display: 'none', // Hide "Powered by Google" for cleaner UI
            },
          }}
          textInputProps={{
            placeholderTextColor: colors.neutral[500],
            autoCorrect: false,
          }}
          enablePoweredByContainer={false}
          debounce={300}
          minLength={3}
          nearbyPlacesAPI="GooglePlacesSearch"
        />
        </View>
      )}

      {/* Line 2 input for apt/suite/unit - show after address selected or if not using zipFirst */}
      {(!zipFirst || zipConfirmed) && (
        <>
        <View style={styles.line2Container}>
        <Input
          label="Apt, Suite, Unit (optional)"
          value={line2}
          onChangeText={setLine2}
          placeholder="Apt 4B"
          icon="home-outline"
        />
      </View>

      {/* Selected address preview */}
      {selectedAddress && selectedAddress.street && (
        <View style={styles.previewContainer}>
          <Ionicons name="checkmark-circle" size={20} color={colors.success.main} />
          <View style={styles.previewText}>
            <Text style={styles.previewStreet}>
              {selectedAddress.street}
              {selectedAddress.line2 ? `, ${selectedAddress.line2}` : ''}
            </Text>
            <Text style={styles.previewCity}>
              {selectedAddress.city}, {selectedAddress.state} {selectedAddress.zipCode}
            </Text>
          </View>
        </View>
      )}

      {/* Error message */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={16} color={colors.error.main} />
          <Text style={styles.errorMessage}>{error}</Text>
        </View>
      )}
      </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    zIndex: 1000, // Ensure dropdown appears above other elements
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
  autocompleteContainer: {
    zIndex: 1000,
  },
  line2Container: {
    marginTop: spacing.sm,
    zIndex: 1, // Below autocomplete dropdown
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.success.lightest,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.success.light,
  },
  previewText: {
    flex: 1,
  },
  previewStreet: {
    ...typography.sizes.base,
    fontWeight: typography.weights.medium as any,
    color: colors.neutral[900],
  },
  previewCity: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    marginTop: 2,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  errorMessage: {
    ...typography.sizes.sm,
    color: colors.error.main,
    flex: 1,
  },
  errorText: {
    ...typography.sizes.sm,
    color: colors.error.main,
    padding: spacing.md,
    backgroundColor: colors.error.lightest,
    borderRadius: borderRadius.md,
  },
  // ZIP-first styles
  zipFirstContainer: {
    marginBottom: spacing.md,
  },
  helpText: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    marginBottom: spacing.md,
  },
  zipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  zipInput: {
    flex: 1,
    height: 48,
    color: colors.neutral[900],
    fontSize: 18,
    fontWeight: '600' as any,
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    textAlign: 'center',
    letterSpacing: 4,
  },
  inputError: {
    borderColor: colors.error.main,
  },
  zipConfirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  zipConfirmButtonDisabled: {
    backgroundColor: colors.neutral[300],
  },
  zipConfirmText: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold as any,
    color: 'white',
  },
  zipError: {
    ...typography.sizes.sm,
    color: colors.error.main,
    marginTop: spacing.xs,
  },
  zipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.primary.lightest,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  zipBadgeText: {
    ...typography.sizes.sm,
    color: colors.primary.main,
  },
  changeZipText: {
    ...typography.sizes.sm,
    color: colors.primary.main,
    fontWeight: typography.weights.semibold as any,
    marginLeft: spacing.xs,
    textDecorationLine: 'underline',
  },
});
