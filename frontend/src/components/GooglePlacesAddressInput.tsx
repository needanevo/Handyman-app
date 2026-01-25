/**
 * Google Places Address Autocomplete Helper
 *
 * Provides address autocomplete suggestions. When a suggestion is selected,
 * returns structured address data to populate existing form fields.
 *
 * Usage: Place above existing address form fields. On selection, use the
 * callback to populate street, city, state, zip fields.
 */

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { GooglePlacesAutocomplete, GooglePlaceData, GooglePlaceDetail } from 'react-native-google-places-autocomplete';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../constants/theme';

export interface StructuredAddress {
  street: string;
  line2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  placeId?: string;
  formattedAddress?: string;
}

interface GooglePlacesAddressInputProps {
  onAddressSelected: (address: StructuredAddress) => void;
  placeholder?: string;
  label?: string;
}

// Parse address components from Google Places result
function parseAddressComponents(details: GooglePlaceDetail | null): Partial<StructuredAddress> {
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
      components.state = component.short_name;
    } else if (type === 'postal_code') {
      components.zipCode = component.long_name;
    } else if (type === 'country') {
      components.country = component.short_name;
    } else if (type === 'sublocality_level_1' || type === 'neighborhood') {
      if (!components.city) {
        components.city = component.long_name;
      }
    }
  }

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
  placeholder = 'Search for address...',
  label = 'Quick Address Search',
}: GooglePlacesAddressInputProps) {
  const ref = useRef<any>(null);
  const [hasSelected, setHasSelected] = useState(false);

  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;

  const handlePlaceSelect = (data: GooglePlaceData, details: GooglePlaceDetail | null) => {
    const parsed = parseAddressComponents(details);

    const address: StructuredAddress = {
      street: parsed.street || data.structured_formatting?.main_text || '',
      city: parsed.city || '',
      state: parsed.state || '',
      zipCode: parsed.zipCode || '',
      country: parsed.country || 'US',
      latitude: parsed.latitude,
      longitude: parsed.longitude,
      placeId: details?.place_id || data.place_id,
      formattedAddress: details?.formatted_address || data.description,
    };

    setHasSelected(true);
    onAddressSelected(address);

    // Clear the search input after selection
    if (ref.current) {
      ref.current.setAddressText('');
    }
  };

  const clearSelection = () => {
    setHasSelected(false);
    if (ref.current) {
      ref.current.setAddressText('');
    }
  };

  if (!apiKey) {
    return null; // Silently fail if no API key - form will still work with manual entry
  }

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Ionicons name="search" size={16} color={colors.neutral[500]} />
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.optional}>(optional)</Text>
      </View>

      <GooglePlacesAutocomplete
        ref={ref}
        placeholder={placeholder}
        fetchDetails={true}
        onPress={handlePlaceSelect}
        predefinedPlaces={[]}
        query={{
          key: apiKey,
          language: 'en',
          components: 'country:us',
          types: 'address',
        }}
        styles={{
          container: {
            flex: 0,
          },
          textInputContainer: {
            backgroundColor: 'transparent',
          },
          textInput: {
            height: 44,
            color: colors.neutral[900],
            fontSize: 14,
            backgroundColor: colors.neutral[50],
            borderWidth: 1,
            borderColor: colors.neutral[200],
            borderRadius: borderRadius.md,
            paddingHorizontal: spacing.md,
          },
          listView: {
            backgroundColor: colors.background.primary,
            borderWidth: 1,
            borderColor: colors.neutral[200],
            borderRadius: borderRadius.md,
            marginTop: 2,
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
            padding: spacing.sm,
            minHeight: 40,
          },
          separator: {
            height: 1,
            backgroundColor: colors.neutral[100],
          },
          description: {
            color: colors.neutral[700],
            fontSize: 13,
          },
          poweredContainer: {
            display: 'none',
          },
        }}
        textInputProps={{
          placeholderTextColor: colors.neutral[400],
          autoCorrect: false,
        }}
        enablePoweredByContainer={false}
        debounce={300}
        minLength={3}
      />

      {hasSelected && (
        <TouchableOpacity style={styles.filledIndicator} onPress={clearSelection}>
          <Ionicons name="checkmark-circle" size={14} color={colors.success.main} />
          <Text style={styles.filledText}>Address fields filled</Text>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.helpText}>
        Or enter address manually below
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    zIndex: 1000,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.sizes.sm,
    fontWeight: typography.weights.medium as any,
    color: colors.neutral[700],
  },
  optional: {
    ...typography.sizes.sm,
    color: colors.neutral[400],
  },
  helpText: {
    ...typography.sizes.xs,
    color: colors.neutral[500],
    marginTop: spacing.xs,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  filledIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.success.lightest,
    borderRadius: borderRadius.sm,
  },
  filledText: {
    ...typography.sizes.xs,
    color: colors.success.main,
    flex: 1,
  },
  clearText: {
    ...typography.sizes.xs,
    color: colors.neutral[500],
    textDecorationLine: 'underline',
  },
});
