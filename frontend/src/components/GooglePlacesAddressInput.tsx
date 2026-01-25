/**
 * Google Places Address Autocomplete Helper
 *
 * Uses Google Places Autocomplete API directly via fetch.
 * No native modules required - works with Expo Go.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Platform,
} from 'react-native';
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

interface Prediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

// Debounce helper
function useDebounce<T extends (...args: any[]) => void>(fn: T, delay: number): T {
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => fn(...args), delay);
  }, [fn, delay]) as T;
}

export function GooglePlacesAddressInput({
  onAddressSelected,
  placeholder = 'Search for address...',
  label = 'Quick Address Search',
}: GooglePlacesAddressInputProps) {
  const [query, setQuery] = useState('');
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSelected, setHasSelected] = useState(false);

  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;

  const searchPlaces = useCallback(async (text: string) => {
    if (!apiKey || text.length < 3) {
      setPredictions([]);
      return;
    }

    setIsLoading(true);
    try {
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(text)}&types=address&components=country:us&key=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.predictions) {
        setPredictions(data.predictions);
      } else {
        setPredictions([]);
      }
    } catch (error) {
      console.error('Places API error:', error);
      setPredictions([]);
    } finally {
      setIsLoading(false);
    }
  }, [apiKey]);

  const debouncedSearch = useDebounce(searchPlaces, 300);

  const handleTextChange = (text: string) => {
    setQuery(text);
    setHasSelected(false);
    debouncedSearch(text);
  };

  const getPlaceDetails = async (placeId: string): Promise<StructuredAddress | null> => {
    if (!apiKey) return null;

    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=address_components,formatted_address,geometry&key=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.result) {
        const result = data.result;
        const components: { [key: string]: string } = {};

        for (const component of result.address_components || []) {
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
          } else if ((type === 'sublocality_level_1' || type === 'neighborhood') && !components.city) {
            components.city = component.long_name;
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
          latitude: result.geometry?.location?.lat,
          longitude: result.geometry?.location?.lng,
          placeId: placeId,
          formattedAddress: result.formatted_address,
        };
      }
    } catch (error) {
      console.error('Place details error:', error);
    }
    return null;
  };

  const handleSelectPrediction = async (prediction: Prediction) => {
    setIsLoading(true);
    const address = await getPlaceDetails(prediction.place_id);
    setIsLoading(false);

    if (address) {
      setQuery('');
      setPredictions([]);
      setHasSelected(true);
      onAddressSelected(address);
    }
  };

  const clearSelection = () => {
    setHasSelected(false);
    setQuery('');
    setPredictions([]);
  };

  if (!apiKey) {
    return null; // Silently fail if no API key
  }

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Ionicons name="search" size={16} color={colors.neutral[500]} />
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.optional}>(optional)</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor={colors.neutral[400]}
          autoCorrect={false}
        />
        {isLoading && (
          <ActivityIndicator size="small" color={colors.primary.main} style={styles.loader} />
        )}
      </View>

      {predictions.length > 0 && (
        <View style={styles.predictionsContainer}>
          <FlatList
            data={predictions}
            keyExtractor={(item) => item.place_id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.predictionRow}
                onPress={() => handleSelectPrediction(item)}
              >
                <Ionicons name="location-outline" size={18} color={colors.neutral[500]} />
                <View style={styles.predictionText}>
                  <Text style={styles.predictionMain} numberOfLines={1}>
                    {item.structured_formatting.main_text}
                  </Text>
                  <Text style={styles.predictionSecondary} numberOfLines={1}>
                    {item.structured_formatting.secondary_text}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            scrollEnabled={false}
          />
        </View>
      )}

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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 44,
    color: colors.neutral[900],
    fontSize: 14,
    backgroundColor: colors.neutral[50],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
  },
  loader: {
    position: 'absolute',
    right: spacing.md,
  },
  predictionsContainer: {
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: borderRadius.md,
    marginTop: 2,
    maxHeight: 200,
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
  predictionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  predictionText: {
    flex: 1,
  },
  predictionMain: {
    ...typography.sizes.sm,
    color: colors.neutral[900],
    fontWeight: typography.weights.medium as any,
  },
  predictionSecondary: {
    ...typography.sizes.xs,
    color: colors.neutral[500],
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
