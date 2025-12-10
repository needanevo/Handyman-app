/**
 * Customer Profile Screen
 *
 * Displays and allows editing of customer profile information.
 * CUSTOMER-ONLY UI - no contractor/business elements.
 */

import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useForm } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { colors, spacing, typography, borderRadius, shadows } from '../../../src/constants/theme';
import { useAuth } from '../../../src/contexts/AuthContext';
import { Card } from '../../../src/components/Card';
import { Button } from '../../../src/components/Button';
import { AddressForm } from '../../../src/components/AddressForm';
import { LogoutButton } from '../../../src/components/LogoutButton';
import { profileAPI, verificationAPI } from '../../../src/services/api';

interface AddressFormData {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  unitNumber?: string;
}

export default function CustomerProfileScreen() {
  const router = useRouter();
  const { user, refreshUser, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Phone state (not in AddressForm)
  const [phone, setPhone] = useState(user?.phone || '');

  // Address form control
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AddressFormData>({
    defaultValues: {
      street: user?.addresses?.[0]?.street || '',
      city: user?.addresses?.[0]?.city || '',
      state: user?.addresses?.[0]?.state || '',
      zipCode: user?.addresses?.[0]?.zipCode || '',
    },
  });

  const hasAddress = user?.addresses && user.addresses.length > 0;

  // Verification state
  const [isVerifying, setIsVerifying] = useState(false);
  const [autoVerifyEnabled, setAutoVerifyEnabled] = useState(user?.verification?.autoVerifyEnabled ?? true);
  const autoVerifyAttempted = useRef(false);

  // Auto-verification on focus (PHASE 3) - same logic as dashboard
  useFocusEffect(
    useCallback(() => {
      const autoVerifyLocation = async () => {
        if (user?.role !== 'customer') return;
        if (!user?.verification?.autoVerifyEnabled) return;
        if (user?.verification?.status === 'verified') return;
        if (autoVerifyAttempted.current) return;
        autoVerifyAttempted.current = true;

        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') return;

          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });

          await verificationAPI.verifyLocation(
            location.coords.latitude,
            location.coords.longitude
          );

          await refreshUser();
        } catch (error) {
          console.log('Auto-verification failed (silent):', error);
        }
      };

      autoVerifyLocation();

      return () => {
        autoVerifyAttempted.current = false;
      };
    }, [user?.role, user?.verification?.autoVerifyEnabled, user?.verification?.status])
  );

  const handleVerifyLocation = async () => {
    setIsVerifying(true);
    try {
      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Location permission is needed to verify your address. Please enable it in Settings.'
        );
        setIsVerifying(false);
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Call verification API
      const response = await verificationAPI.verifyLocation(
        location.coords.latitude,
        location.coords.longitude
      );

      // Refresh user to get updated verification status
      await refreshUser();

      // Show appropriate message based on result
      const status_value = response.verification.status;
      if (status_value === 'verified') {
        Alert.alert('Success', 'Your location has been verified!');
      } else if (status_value === 'mismatch') {
        Alert.alert(
          'Location Mismatch',
          'Your current location does not match your profile address. Please update your address if you have moved.'
        );
      } else {
        Alert.alert(
          'Verification Failed',
          'Unable to verify your location. Make sure your address has valid coordinates.'
        );
      }
    } catch (error: any) {
      console.error('Location verification error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.detail || error.message || 'Failed to verify location'
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleAutoVerifyToggle = async (value: boolean) => {
    try {
      setAutoVerifyEnabled(value);
      await verificationAPI.updatePreferences(value);
      await refreshUser();
    } catch (error: any) {
      console.error('Failed to update auto-verify preference:', error);
      // Revert on error
      setAutoVerifyEnabled(!value);
      Alert.alert('Error', 'Failed to update preference. Please try again.');
    }
  };

  const handleSave = async (data: AddressFormData) => {
    setIsSaving(true);
    try {
      // Save address to profile
      const addressData = {
        street: data.street,
        city: data.city,
        state: data.state,
        zip_code: data.zipCode,
        is_default: true,
      };

      console.log('Saving address:', addressData);
      await profileAPI.addAddress(addressData);
      console.log('Address saved successfully');

      // Try to refresh user data, but don't fail if it errors
      try {
        await refreshUser();
        console.log('User data refreshed');
      } catch (refreshError: any) {
        console.warn('Failed to refresh user data:', refreshError);
        // Non-critical - address was saved, just couldn't refresh
        // User can reload the page to see updates
      }

      setIsEditing(false);
      Alert.alert('Success', 'Address saved successfully');
    } catch (error: any) {
      console.error('Failed to save address:', error);
      Alert.alert(
        'Error',
        error.response?.data?.detail || error.message || 'Failed to save address. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to original values
    setPhone(user?.phone || '');
    setValue('street', user?.addresses?.[0]?.street || '');
    setValue('city', user?.addresses?.[0]?.city || '');
    setValue('state', user?.addresses?.[0]?.state || '');
    setValue('zipCode', user?.addresses?.[0]?.zipCode || '');
    setIsEditing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/auth/welcome');
            } catch (error) {
              console.error('Logout failed:', error);
              // Still navigate even if logout fails
              router.replace('/auth/welcome');
            }
          },
        },
      ]
    );
  };

  // Memoize default values to prevent infinite loops
  const defaultValues = useMemo(() => {
    if (user?.addresses && user.addresses.length > 0) {
      return {
        street: user.addresses[0].street || '',
        city: user.addresses[0].city || '',
        state: user.addresses[0].state || '',
        zipCode: user.addresses[0].zipCode || '',
      };
    }
    return undefined;
  }, [user?.addresses]);

  // Fix back-stack parallel profile bug
  useFocusEffect(
    useCallback(() => {
      router.setParams({});
    }, [])
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity
          onPress={() => isEditing ? handleCancel() : setIsEditing(true)}
          style={styles.editButton}
        >
          <Text style={styles.editButtonText}>
            {isEditing ? 'Cancel' : 'Edit'}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        {/* Profile Photo */}
        <View style={styles.photoSection}>
          <View style={styles.photoContainer}>
            {user?.profilePhoto ? (
              <Ionicons name="person" size={64} color={colors.primary.main} />
            ) : (
              <Ionicons name="person-circle" size={96} color={colors.neutral[400]} />
            )}
          </View>
          <Text style={styles.profileName}>
            {user?.firstName} {user?.lastName}
          </Text>
          {isEditing && (
            <TouchableOpacity style={styles.changePhotoButton}>
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Basic Info */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>
              {user?.firstName} {user?.lastName}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{user?.email}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Phone</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Phone number"
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.value}>{user?.phone || 'Not provided'}</Text>
            )}
          </View>
        </Card>

        {/* Address */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Address</Text>

          {!hasAddress && !isEditing && (
            <View style={styles.emptyState}>
              <Ionicons name="location-outline" size={48} color={colors.neutral[400]} />
              <Text style={styles.emptyText}>No address added yet</Text>
              <Text style={styles.emptySubtext}>
                Add your address to request services
              </Text>
            </View>
          )}

          {(hasAddress || isEditing) && !isEditing && (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Street Address</Text>
                <Text style={styles.value}>{user?.addresses?.[0]?.street || 'Not provided'}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>City</Text>
                <Text style={styles.value}>{user?.addresses?.[0]?.city || 'Not provided'}</Text>
              </View>

              <View style={styles.infoRowHalf}>
                <View style={styles.halfColumn}>
                  <Text style={styles.label}>State</Text>
                  <Text style={styles.value}>{user?.addresses?.[0]?.state || 'N/A'}</Text>
                </View>

                <View style={styles.halfColumn}>
                  <Text style={styles.label}>ZIP Code</Text>
                  <Text style={styles.value}>{user?.addresses?.[0]?.zipCode || 'N/A'}</Text>
                </View>
              </View>
            </>
          )}

          {isEditing && (
            <View style={styles.addressFormContainer}>
              <AddressForm
                control={control}
                errors={errors}
                setValue={setValue as any}
                defaultValues={defaultValues}
                showUnitNumber={false}
              />
            </View>
          )}
        </Card>

        {/* Location Verification */}
        {!isEditing && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Location Verification</Text>

            {/* Verification Status */}
            <View style={styles.verificationStatus}>
              <View style={[
                styles.statusIndicator,
                user?.verification?.status === 'verified' && styles.statusVerified,
                user?.verification?.status === 'mismatch' && styles.statusMismatch,
                (!user?.verification || user?.verification?.status === 'unverified') && styles.statusUnverified,
              ]}>
                <Ionicons
                  name={
                    user?.verification?.status === 'verified' ? 'checkmark-circle' :
                    user?.verification?.status === 'mismatch' ? 'alert-circle' :
                    'help-circle'
                  }
                  size={24}
                  color={
                    user?.verification?.status === 'verified' ? colors.success.main :
                    user?.verification?.status === 'mismatch' ? colors.warning.main :
                    colors.neutral[400]
                  }
                />
                <Text style={[
                  styles.statusText,
                  user?.verification?.status === 'verified' && styles.statusTextVerified,
                  user?.verification?.status === 'mismatch' && styles.statusTextMismatch,
                ]}>
                  {user?.verification?.status === 'verified' ? 'Verified Location' :
                   user?.verification?.status === 'mismatch' ? 'Location Mismatch' :
                   'No Verified Location'}
                </Text>
              </View>

              <Text style={styles.statusCaption}>
                {user?.verification?.status === 'verified' ?
                  'Your location matches your address.' :
                 user?.verification?.status === 'mismatch' ?
                  'Your device location does not match your address.' :
                  'No verified location on file.'}
              </Text>
            </View>

            {/* Verify Location Button */}
            <Button
              title={isVerifying ? 'Verifying...' : 'Verify My Location'}
              onPress={handleVerifyLocation}
              variant="primary"
              size="large"
              disabled={isVerifying}
              icon={isVerifying ?
                <ActivityIndicator size="small" color={colors.background.primary} /> :
                <Ionicons name="location" size={20} color={colors.background.primary} />
              }
              style={styles.verifyButton}
            />

            {/* Update Address Button (if mismatch) */}
            {user?.verification?.status === 'mismatch' && (
              <Button
                title="Update My Address Instead"
                onPress={() => setIsEditing(true)}
                variant="outline"
                size="large"
                style={styles.updateAddressButton}
              />
            )}

            {/* Auto-verify Toggle */}
            <View style={styles.autoVerifyRow}>
              <View style={styles.autoVerifyText}>
                <Text style={styles.autoVerifyLabel}>
                  Automatically verify my location when I use the app
                </Text>
              </View>
              <Switch
                value={autoVerifyEnabled}
                onValueChange={handleAutoVerifyToggle}
                trackColor={{ false: colors.neutral[300], true: colors.primary.light }}
                thumbColor={autoVerifyEnabled ? colors.primary.main : colors.neutral[400]}
              />
            </View>
          </Card>
        )}

        {/* Save Button */}
        {isEditing && (
          <View style={styles.actions}>
            <Button
              title="Save Changes"
              onPress={handleSubmit(handleSave)}
              variant="primary"
              size="large"
              disabled={isSaving}
            />
          </View>
        )}

        {/* Logout Button */}
        <View style={styles.actions}>
          <LogoutButton />
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
  },
  editButton: {
    padding: spacing.xs,
  },
  editButtonText: {
    ...typography.sizes.base,
    color: colors.primary.main,
    fontWeight: typography.weights.semibold,
  },
  keyboardView: {
    flex: 1,
  },
  photoSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: colors.background.primary,
  },
  photoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  changePhotoButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
  },
  changePhotoText: {
    ...typography.sizes.sm,
    color: colors.primary.main,
    fontWeight: typography.weights.semibold,
  },
  section: {
    marginHorizontal: spacing.base,
    marginTop: spacing.base,
    padding: spacing.base,
  },
  sectionTitle: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    marginBottom: spacing.base,
  },
  infoRow: {
    marginBottom: spacing.base,
  },
  infoRowHalf: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.base,
  },
  halfColumn: {
    flex: 1,
  },
  label: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    marginBottom: spacing.xs,
  },
  value: {
    ...typography.sizes.base,
    color: colors.neutral[900],
    fontWeight: typography.weights.medium,
  },
  input: {
    ...typography.sizes.base,
    color: colors.neutral[900],
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral[300],
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    ...typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.neutral[700],
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    textAlign: 'center',
  },
  addressFormContainer: {
    marginTop: spacing.md,
  },
  actions: {
    paddingHorizontal: spacing.base,
    marginTop: spacing.xl,
  },
  logoutButton: {
    borderColor: colors.error.main,
  },
  profileName: {
    ...typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    marginTop: spacing.sm,
  },
  verificationStatus: {
    marginBottom: spacing.base,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  statusText: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[700],
  },
  statusTextVerified: {
    color: colors.success.main,
  },
  statusTextMismatch: {
    color: colors.warning.main,
  },
  statusVerified: {
    backgroundColor: colors.success.light,
    borderColor: colors.success.main,
  },
  statusMismatch: {
    backgroundColor: colors.warning.light,
    borderColor: colors.warning.main,
  },
  statusUnverified: {
    backgroundColor: colors.neutral[100],
    borderColor: colors.neutral[300],
  },
  statusCaption: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    marginTop: spacing.xs,
  },
  verifyButton: {
    marginTop: spacing.base,
  },
  updateAddressButton: {
    marginTop: spacing.sm,
  },
  autoVerifyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.base,
    paddingTop: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  autoVerifyText: {
    flex: 1,
    marginRight: spacing.base,
  },
  autoVerifyLabel: {
    ...typography.sizes.sm,
    color: colors.neutral[700],
  },
});
