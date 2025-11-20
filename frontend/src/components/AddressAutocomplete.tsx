/**
 * Address Autocomplete with Verification
 *
 * Uses Google Places API to:
 * - Suggest addresses as user types
 * - Validate address exists
 * - Return complete address components
 * - Include geocoded coordinates
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
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
  placeholder = 'Enter your business address',
  label = 'Business Address',
  required = false,
  error,
}: AddressAutocompleteProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<AddressComponents | null>(null);
  const autocompleteRef = useRef<any>(null);
  const [hasError, setHasError] = useState(false);

  // Check if API key exists
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;

  if (!apiKey || hasError) {
    return (
      <View style={styles.container}>
        {label && (
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
        )}
        <View style={[styles.textInputContainer, styles.textInputError]}>
          <Text style={styles.errorText}>
            ⚠️ Address autocomplete temporarily unavailable. Please enter address manually in the backend.
          </Text>
        </View>
        <Text style={styles.helpText}>
          Contact support if this issue persists.
        </Text>
      </View>
    );
  }

  const parseAddressComponents = (place: any): AddressComponents | null => {
    const components = place.address_components || [];
    let street = '';
    let city = '';
    let state = '';
    let zipCode = '';

    // Extract street number and route
    const streetNumber = components.find((c: any) => c.types.includes('street_number'))?.long_name || '';
    const route = components.find((c: any) => c.types.includes('route'))?.long_name || '';
    street = `${streetNumber} ${route}`.trim();

    // Extract city (locality or sublocality)
    city = components.find((c: any) => c.types.includes('locality'))?.long_name ||
           components.find((c: any) => c.types.includes('sublocality'))?.long_name || '';

    // Extract state (administrative_area_level_1)
    state = components.find((c: any) => c.types.includes('administrative_area_level_1'))?.short_name || '';

    // Extract ZIP code
    zipCode = components.find((c: any) => c.types.includes('postal_code'))?.long_name || '';

    // Get coordinates
    const latitude = place.geometry?.location?.lat || 0;
    const longitude = place.geometry?.location?.lng || 0;

    return {
      street,
      city,
      state,
      zipCode,
      latitude,
      longitude,
      formattedAddress: place.formatted_address || '',
    };
  };

  const handlePlaceSelect = (data: any, details: any) => {
    if (!details) return;

    const addressComponents = parseAddressComponents(details);
    if (!addressComponents) return;

    setSelectedAddress(addressComponents);
    setShowConfirmation(true);
  };

  const confirmAddress = () => {
    if (selectedAddress) {
      onAddressSelected(selectedAddress);
      setShowConfirmation(false);
    }
  };

  const editAddress = () => {
    setShowConfirmation(false);
    setSelectedAddress(null);
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

      {/* Google Places Autocomplete */}
      <GooglePlacesAutocomplete
        ref={autocompleteRef}
        placeholder={placeholder}
        onPress={handlePlaceSelect}
        onFail={(error) => {
          console.error('Google Places error:', error);
          setHasError(true);
        }}
        query={{
          key: apiKey,
          language: 'en',
          types: 'address',
          components: 'country:us', // Restrict to US addresses
        }}
        fetchDetails={true}
        enablePoweredByContainer={false}
        styles={{
          container: styles.autocompleteContainer,
          textInputContainer: styles.textInputContainer,
          textInput: [
            styles.textInput,
            error ? styles.textInputError : null,
          ],
          listView: styles.listView,
          row: styles.row,
          description: styles.description,
          poweredContainer: { display: 'none' },
        }}
        textInputProps={{
          placeholderTextColor: colors.neutral[500],
          returnKeyType: 'search',
        }}
      />

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={16} color={colors.error.main} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Help Text */}
      <Text style={styles.helpText}>
        Start typing your address - we'll verify it and get exact coordinates
      </Text>

      {/* Address Confirmation Modal */}
      <Modal
        visible={showConfirmation}
        transparent={true}
        animationType="fade"
        onRequestClose={editAddress}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="checkmark-circle" size={48} color={colors.success.main} />
              <Text style={styles.modalTitle}>Verify Your Address</Text>
            </View>

            {selectedAddress && (
              <View style={styles.addressDetails}>
                <View style={styles.addressRow}>
                  <Ionicons name="location" size={20} color={colors.primary.main} />
                  <View style={styles.addressInfo}>
                    <Text style={styles.addressLabel}>Street</Text>
                    <Text style={styles.addressValue}>{selectedAddress.street}</Text>
                  </View>
                </View>

                <View style={styles.addressRow}>
                  <Ionicons name="business" size={20} color={colors.primary.main} />
                  <View style={styles.addressInfo}>
                    <Text style={styles.addressLabel}>City</Text>
                    <Text style={styles.addressValue}>{selectedAddress.city}</Text>
                  </View>
                </View>

                <View style={styles.addressRow}>
                  <Ionicons name="map" size={20} color={colors.primary.main} />
                  <View style={styles.addressInfo}>
                    <Text style={styles.addressLabel}>State & ZIP</Text>
                    <Text style={styles.addressValue}>
                      {selectedAddress.state} {selectedAddress.zipCode}
                    </Text>
                  </View>
                </View>

                <View style={styles.addressRow}>
                  <Ionicons name="navigate" size={20} color={colors.success.main} />
                  <View style={styles.addressInfo}>
                    <Text style={styles.addressLabel}>Coordinates</Text>
                    <Text style={styles.addressValue}>
                      {selectedAddress.latitude.toFixed(4)}, {selectedAddress.longitude.toFixed(4)}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmAddress}
              >
                <Ionicons name="checkmark" size={20} color="white" />
                <Text style={styles.confirmButtonText}>Confirm Address</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.editButton]}
                onPress={editAddress}
              >
                <Ionicons name="create" size={20} color={colors.primary.main} />
                <Text style={styles.editButtonText}>Edit Address</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  autocompleteContainer: {
    flex: 0,
    zIndex: 1,
  },
  textInputContainer: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  textInput: {
    height: 48,
    color: colors.neutral[900],
    fontSize: 16,
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    ...typography.sizes.base,
  },
  textInputError: {
    borderColor: colors.error.main,
  },
  listView: {
    backgroundColor: 'white',
    borderRadius: borderRadius.md,
    marginTop: spacing.xs,
    ...shadows.md,
  },
  row: {
    backgroundColor: 'white',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  description: {
    ...typography.sizes.sm,
    color: colors.neutral[800],
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
  },
  helpText: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    marginTop: spacing.xs,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 500,
    ...shadows.lg,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  modalTitle: {
    ...typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    marginTop: spacing.md,
  },
  addressDetails: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.md,
  },
  addressInfo: {
    flex: 1,
  },
  addressLabel: {
    ...typography.sizes.xs,
    color: colors.neutral[600],
    textTransform: 'uppercase',
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.xs / 2,
  },
  addressValue: {
    ...typography.sizes.base,
    color: colors.neutral[900],
    fontWeight: typography.weights.medium,
  },
  modalActions: {
    gap: spacing.md,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  confirmButton: {
    backgroundColor: colors.primary.main,
  },
  confirmButtonText: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: 'white',
  },
  editButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary.main,
  },
  editButtonText: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.primary.main,
  },
});
