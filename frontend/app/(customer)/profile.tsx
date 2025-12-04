/**
 * Customer Profile Screen
 *
 * Displays and allows editing of customer profile information.
 * CUSTOMER-ONLY UI - no contractor/business elements.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../src/constants/theme';
import { useAuth } from '../../src/contexts/AuthContext';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { AddressForm } from '../../src/components/AddressForm';
import { profileAPI } from '../../src/services/api';

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

      await profileAPI.addAddress(addressData);

      // Refresh user to get updated data
      await refreshUser();

      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      Alert.alert('Error', error.response?.data?.detail || 'Failed to update profile');
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

  // Get default values for AddressForm
  const defaultValues = user?.addresses && user.addresses.length > 0
    ? {
        street: user.addresses[0].street || '',
        city: user.addresses[0].city || '',
        state: user.addresses[0].state || '',
        zipCode: user.addresses[0].zipCode || '',
      }
    : undefined;

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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
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
                setValue={setValue}
                defaultValues={defaultValues}
                showUnitNumber={false}
              />
            </View>
          )}
        </Card>

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
        {!isEditing && (
          <View style={styles.actions}>
            <Button
              title="Logout"
              onPress={handleLogout}
              variant="outline"
              size="large"
              icon={<Ionicons name="log-out-outline" size={20} color={colors.error.main} />}
              style={styles.logoutButton}
            />
          </View>
        )}
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing['4xl'],
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
});
