/**
 * Address Input with Autocomplete and Verification
 *
 * Standard address entry flow:
 * 1. User types street address - autocomplete suggestions appear
 * 2. User fills city, state, zip (auto-filled if suggestion selected)
 * 3. On verification request, validates against Google Places
 * 4. Shows suggestion modal if better match found
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../constants/theme';

export interface AddressData {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  placeId?: string;
  formattedAddress?: string;
  isVerified?: boolean;
}

interface AddressInputProps {
  value: AddressData;
  onChange: (address: AddressData) => void;
  onVerified?: (address: AddressData) => void;
  label?: string;
  required?: boolean;
  error?: string;
}

interface Prediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export function AddressInput({
  value,
  onChange,
  onVerified,
  label = 'Address',
  required = false,
  error,
}: AddressInputProps) {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [suggestedAddress, setSuggestedAddress] = useState<AddressData | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;

  // Debounce street search
  const searchTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchStreetAddress = useCallback(async (text: string) => {
    if (!apiKey || text.length < 3) {
      setPredictions([]);
      return;
    }

    setIsSearching(true);
    try {
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(text)}&types=address&components=country:us&key=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.predictions) {
        setPredictions(data.predictions.slice(0, 5));
      } else {
        setPredictions([]);
      }
    } catch (err) {
      console.error('Street search error:', err);
      setPredictions([]);
    } finally {
      setIsSearching(false);
    }
  }, [apiKey]);

  const handleStreetChange = (text: string) => {
    onChange({ ...value, street: text, isVerified: false });

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => searchStreetAddress(text), 300);
  };

  const getPlaceDetails = async (placeId: string): Promise<AddressData | null> => {
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
          if (type === 'street_number') components.street_number = component.long_name;
          else if (type === 'route') components.route = component.long_name;
          else if (type === 'locality') components.city = component.long_name;
          else if (type === 'administrative_area_level_1') components.state = component.short_name;
          else if (type === 'postal_code') components.zipCode = component.long_name;
          else if (type === 'country') components.country = component.short_name;
          else if ((type === 'sublocality_level_1' || type === 'neighborhood') && !components.city) {
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
          isVerified: true,
        };
      }
    } catch (err) {
      console.error('Place details error:', err);
    }
    return null;
  };

  const handleSelectPrediction = async (prediction: Prediction) => {
    setPredictions([]);
    setIsSearching(true);

    const address = await getPlaceDetails(prediction.place_id);
    setIsSearching(false);

    if (address) {
      onChange(address);
      onVerified?.(address);
    }
  };

  // Verify entered address against Google Places
  const verifyAddress = async (): Promise<AddressData | null> => {
    if (!apiKey || !value.street) return null;

    const searchQuery = `${value.street}, ${value.city}, ${value.state} ${value.zipCode}`;

    try {
      // First get place predictions for the full address
      const autocompleteUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(searchQuery)}&types=address&components=country:us&key=${apiKey}`;
      const autocompleteResponse = await fetch(autocompleteUrl);
      const autocompleteData = await autocompleteResponse.json();

      if (autocompleteData.status === 'OK' && autocompleteData.predictions?.length > 0) {
        // Get details for the top match
        const topMatch = autocompleteData.predictions[0];
        return await getPlaceDetails(topMatch.place_id);
      }
    } catch (err) {
      console.error('Address verification error:', err);
    }
    return null;
  };

  // Public method to verify and potentially show suggestion
  const handleVerifyAddress = async () => {
    if (!value.street || !value.city || !value.state || !value.zipCode) {
      return false;
    }

    setIsVerifying(true);
    const verified = await verifyAddress();
    setIsVerifying(false);

    if (verified) {
      // Check if the verified address is different
      const isDifferent =
        verified.street.toLowerCase() !== value.street.toLowerCase() ||
        verified.city.toLowerCase() !== value.city.toLowerCase() ||
        verified.state.toLowerCase() !== value.state.toLowerCase() ||
        verified.zipCode !== value.zipCode;

      if (isDifferent) {
        setSuggestedAddress(verified);
        setShowSuggestionModal(true);
        return false; // Don't proceed until user decides
      } else {
        // Address matches - mark as verified
        onChange({ ...value, ...verified, isVerified: true });
        onVerified?.({ ...value, ...verified, isVerified: true });
        return true;
      }
    }

    // No verification result - accept as entered
    onChange({ ...value, isVerified: true });
    onVerified?.({ ...value, isVerified: true });
    return true;
  };

  const acceptSuggestion = () => {
    if (suggestedAddress) {
      onChange(suggestedAddress);
      onVerified?.(suggestedAddress);
    }
    setShowSuggestionModal(false);
    setSuggestedAddress(null);
  };

  const keepOriginal = () => {
    onChange({ ...value, isVerified: true });
    onVerified?.({ ...value, isVerified: true });
    setShowSuggestionModal(false);
    setSuggestedAddress(null);
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
      )}

      {/* Street Address with Autocomplete */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Street Address</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={[styles.input, error && styles.inputError]}
            value={value.street}
            onChangeText={handleStreetChange}
            placeholder="123 Main St"
            placeholderTextColor={colors.neutral[400]}
            autoCorrect={false}
          />
          {isSearching && (
            <ActivityIndicator size="small" color={colors.primary.main} style={styles.loader} />
          )}
        </View>

        {/* Street Predictions Dropdown */}
        {predictions.length > 0 && (
          <View style={styles.predictionsContainer}>
            <FlatList
              data={predictions}
              keyExtractor={(item) => item.place_id}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.predictionRow}
                  onPress={() => handleSelectPrediction(item)}
                >
                  <Ionicons name="location-outline" size={16} color={colors.neutral[500]} />
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
      </View>

      {/* City */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>City</Text>
        <TextInput
          style={[styles.input, error && styles.inputError]}
          value={value.city}
          onChangeText={(text) => onChange({ ...value, city: text, isVerified: false })}
          placeholder="City"
          placeholderTextColor={colors.neutral[400]}
        />
      </View>

      {/* State and ZIP */}
      <View style={styles.row}>
        <View style={[styles.fieldContainer, styles.halfField]}>
          <Text style={styles.fieldLabel}>State</Text>
          <TextInput
            style={[styles.input, error && styles.inputError]}
            value={value.state}
            onChangeText={(text) => onChange({ ...value, state: text.toUpperCase(), isVerified: false })}
            placeholder="TX"
            placeholderTextColor={colors.neutral[400]}
            maxLength={2}
            autoCapitalize="characters"
          />
        </View>

        <View style={[styles.fieldContainer, styles.halfField]}>
          <Text style={styles.fieldLabel}>ZIP Code</Text>
          <TextInput
            style={[styles.input, error && styles.inputError]}
            value={value.zipCode}
            onChangeText={(text) => onChange({ ...value, zipCode: text, isVerified: false })}
            placeholder="78701"
            placeholderTextColor={colors.neutral[400]}
            keyboardType="numeric"
            maxLength={5}
          />
        </View>
      </View>

      {/* Verification Status */}
      {value.isVerified && (
        <View style={styles.verifiedBadge}>
          <Ionicons name="checkmark-circle" size={16} color={colors.success.main} />
          <Text style={styles.verifiedText}>Address verified</Text>
        </View>
      )}

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {/* Verify Button */}
      {!value.isVerified && value.street && value.city && value.state && value.zipCode && (
        <TouchableOpacity
          style={styles.verifyButton}
          onPress={handleVerifyAddress}
          disabled={isVerifying}
        >
          {isVerifying ? (
            <ActivityIndicator size="small" color={colors.primary.main} />
          ) : (
            <>
              <Ionicons name="shield-checkmark-outline" size={18} color={colors.primary.main} />
              <Text style={styles.verifyButtonText}>Verify Address</Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {/* Suggestion Modal */}
      <Modal
        visible={showSuggestionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuggestionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="help-circle" size={32} color={colors.primary.main} />
              <Text style={styles.modalTitle}>Did you mean?</Text>
            </View>

            <Text style={styles.modalSubtitle}>We found a verified address:</Text>

            {suggestedAddress && (
              <View style={styles.suggestionBox}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success.main} />
                <View style={styles.suggestionText}>
                  <Text style={styles.suggestionStreet}>{suggestedAddress.street}</Text>
                  <Text style={styles.suggestionCity}>
                    {suggestedAddress.city}, {suggestedAddress.state} {suggestedAddress.zipCode}
                  </Text>
                </View>
              </View>
            )}

            <Text style={styles.modalSubtitle}>You entered:</Text>

            <View style={styles.originalBox}>
              <Ionicons name="create-outline" size={20} color={colors.neutral[500]} />
              <View style={styles.suggestionText}>
                <Text style={styles.originalStreet}>{value.street}</Text>
                <Text style={styles.originalCity}>
                  {value.city}, {value.state} {value.zipCode}
                </Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.acceptButton} onPress={acceptSuggestion}>
                <Text style={styles.acceptButtonText}>Use Suggested</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.keepButton} onPress={keepOriginal}>
                <Text style={styles.keepButtonText}>Keep Original</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Export verification function for use in parent components
export const useAddressVerification = () => {
  const addressRef = React.useRef<{ handleVerifyAddress: () => Promise<boolean> } | null>(null);
  return addressRef;
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold as any,
    color: colors.neutral[900],
    marginBottom: spacing.sm,
  },
  required: {
    color: colors.error.main,
  },
  fieldContainer: {
    marginBottom: spacing.sm,
    zIndex: 1000,
  },
  fieldLabel: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    marginBottom: spacing.xs,
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    color: colors.neutral[900],
    backgroundColor: colors.background.primary,
  },
  inputError: {
    borderColor: colors.error.main,
  },
  loader: {
    position: 'absolute',
    right: spacing.md,
    top: 14,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfField: {
    flex: 1,
  },
  predictionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: borderRadius.md,
    marginTop: 2,
    zIndex: 1001,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
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
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  verifiedText: {
    ...typography.sizes.sm,
    color: colors.success.main,
  },
  errorText: {
    ...typography.sizes.sm,
    color: colors.error.main,
    marginTop: spacing.xs,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary.main,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary.lightest,
  },
  verifyButtonText: {
    ...typography.sizes.sm,
    color: colors.primary.main,
    fontWeight: typography.weights.medium as any,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    ...typography.sizes.xl,
    fontWeight: typography.weights.bold as any,
    color: colors.neutral[900],
    marginTop: spacing.sm,
  },
  modalSubtitle: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    marginBottom: spacing.sm,
  },
  suggestionBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.success.lightest,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.success.light,
    marginBottom: spacing.md,
  },
  suggestionText: {
    flex: 1,
  },
  suggestionStreet: {
    ...typography.sizes.base,
    fontWeight: typography.weights.medium as any,
    color: colors.neutral[900],
  },
  suggestionCity: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
  },
  originalBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    marginBottom: spacing.lg,
  },
  originalStreet: {
    ...typography.sizes.base,
    color: colors.neutral[700],
  },
  originalCity: {
    ...typography.sizes.sm,
    color: colors.neutral[500],
  },
  modalActions: {
    gap: spacing.sm,
  },
  acceptButton: {
    backgroundColor: colors.primary.main,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  acceptButtonText: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold as any,
    color: 'white',
  },
  keepButton: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[300],
  },
  keepButtonText: {
    ...typography.sizes.base,
    color: colors.neutral[700],
  },
});
