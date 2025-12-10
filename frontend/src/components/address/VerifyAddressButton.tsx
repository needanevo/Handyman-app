/**
 * Address Verification Button Component
 *
 * Verifies address with external API and returns validation status
 * Issue #37 fix
 */

import React, { useState } from 'react';
import { Alert } from 'react-native';
import { Button } from '../Button';
import { authAPI } from '../../services/api';

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  unitNumber?: string;
}

interface VerifyAddressButtonProps {
  address: Address;
  onVerified?: (verified: boolean) => void;
  disabled?: boolean;
}

export function VerifyAddressButton({
  address,
  onVerified,
  disabled = false
}: VerifyAddressButtonProps) {
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    console.log('[VerifyAddress] Starting verification...', address);
    setIsVerifying(true);

    try {
      // Call backend verification endpoint
      const response = await authAPI.post('/address/verify', {
        street: address.street,
        city: address.city,
        state: address.state,
        zip_code: address.zipCode,
        unit_number: address.unitNumber,
      });

      console.log('[VerifyAddress] Verification response:', response.data);

      if (response.data.success) {
        Alert.alert('Success', 'Address verified successfully!');
        onVerified?.(true);
      } else {
        Alert.alert(
          'Verification Failed',
          response.data.message || 'Could not verify address. Please check your input.'
        );
        onVerified?.(false);
      }
    } catch (error: any) {
      console.error('[VerifyAddress] Verification error:', error);
      console.error('[VerifyAddress] Error response:', error.response?.data);
      console.error('[VerifyAddress] Error message:', error.message);

      const errorMessage = error.response?.data?.message
        || error.response?.data?.detail
        || error.message
        || 'Network error. Please try again.';

      Alert.alert('Verification Error', errorMessage);
      onVerified?.(false);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Button
      title="Verify Address"
      onPress={handleVerify}
      loading={isVerifying}
      disabled={disabled || isVerifying}
      variant="outline"
      icon="checkmark-circle-outline"
    />
  );
}
