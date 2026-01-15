import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useForm } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../../src/constants/theme';
import { useAuth } from '../../../src/contexts/AuthContext';
import { AddressForm } from '../../../src/components/AddressForm';
import { LogoutButton } from '../../../src/components/LogoutButton';
import { profileAPI } from '../../../src/services/api';

interface AddressFormData {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  unitNumber?: string;
}

export default function HandymanProfile() {
  const router = useRouter();
  const { user, refreshUser, logout } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  // TODO: Fetch from backend GET /api/handyman/profile
  const mockProfile = {
    firstName: user?.firstName || 'John',
    lastName: user?.lastName || 'Smith',
    email: user?.email || 'john@example.com',
    phone: '410-555-1234',
    businessName: "John's Handyman Services",
    businessAddress: '123 Main St, Baltimore, MD 21201',
    skills: ['Drywall', 'Painting', 'Electrical', 'Plumbing', 'Carpentry'],
    yearsExperience: 5,
    rating: 4.7,
    jobsCompleted: 23,
    hasLLC: false,
    isLicensed: false,
    isInsured: false,
  };

  const [skills, setSkills] = useState(mockProfile.skills);

  const hasAddress = user?.addresses && user.addresses.length > 0;

  const availableSkills = [
    'Drywall', 'Painting', 'Electrical', 'Plumbing', 'Carpentry',
    'HVAC', 'Flooring', 'Roofing', 'Landscaping', 'Appliance',
    'Windows & Doors', 'Other',
  ];

  const toggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter((s) => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  const handleSaveAddress = async (data: AddressFormData) => {
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
    setValue('street', user?.addresses?.[0]?.street || '');
    setValue('city', user?.addresses?.[0]?.city || '');
    setValue('state', user?.addresses?.[0]?.state || '');
    setValue('zipCode', user?.addresses?.[0]?.zipCode || '');
    setSkills(mockProfile.skills);
    setIsEditing(false);
  };

  const saveProfile = () => {
    // TODO: Save to backend PATCH /api/handyman/profile
    setIsEditing(false);
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={() => isEditing ? handleCancel() : setIsEditing(true)}>
          <Text style={styles.editButton}>{isEditing ? 'Cancel' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="#FFA500" />
          </View>
          <Text style={styles.profileName}>
            {mockProfile.firstName} {mockProfile.lastName}
          </Text>
          <Text style={styles.profileBusiness}>{mockProfile.businessName}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{mockProfile.jobsCompleted}</Text>
              <Text style={styles.statLabel}>Jobs</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={16} color="#FFA500" />
                <Text style={styles.statValue}>{mockProfile.rating}</Text>
              </View>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{mockProfile.yearsExperience}</Text>
              <Text style={styles.statLabel}>Years</Text>
            </View>
          </View>
        </View>

        {/* Business Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Status</Text>
          <View style={styles.statusGrid}>
            <View style={[styles.statusCard, mockProfile.hasLLC && styles.statusCardActive]}>
              <Ionicons
                name={mockProfile.hasLLC ? 'checkmark-circle' : 'ellipse-outline'}
                size={24}
                color={mockProfile.hasLLC ? '#10B981' : colors.neutral[400]}
              />
              <Text style={styles.statusLabel}>LLC Formed</Text>
            </View>
            <View style={[styles.statusCard, mockProfile.isLicensed && styles.statusCardActive]}>
              <Ionicons
                name={mockProfile.isLicensed ? 'checkmark-circle' : 'ellipse-outline'}
                size={24}
                color={mockProfile.isLicensed ? '#10B981' : colors.neutral[400]}
              />
              <Text style={styles.statusLabel}>Licensed</Text>
            </View>
            <View style={[styles.statusCard, mockProfile.isInsured && styles.statusCardActive]}>
              <Ionicons
                name={mockProfile.isInsured ? 'checkmark-circle' : 'ellipse-outline'}
                size={24}
                color={mockProfile.isInsured ? '#10B981' : colors.neutral[400]}
              />
              <Text style={styles.statusLabel}>Insured</Text>
            </View>
          </View>
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="mail" size={20} color={colors.neutral[600]} />
              <Text style={styles.infoText}>{mockProfile.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="call" size={20} color={colors.neutral[600]} />
              <Text style={styles.infoText}>{mockProfile.phone}</Text>
            </View>
          </View>
        </View>

        {/* Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Home Address</Text>
          <View style={styles.infoCard}>
            {!hasAddress && !isEditing && (
              <View style={styles.emptyState}>
                <Ionicons name="location-outline" size={48} color={colors.neutral[400]} />
                <Text style={styles.emptyText}>No address added yet</Text>
                <Text style={styles.emptySubtext}>
                  Add your business address for job location matching
                </Text>
              </View>
            )}

            {(hasAddress || isEditing) && !isEditing && (
              <View style={styles.infoRow}>
                <Ionicons name="location" size={20} color={colors.neutral[600]} />
                <Text style={styles.infoText}>
                  {user?.addresses?.[0]?.street}, {user?.addresses?.[0]?.city}, {user?.addresses?.[0]?.state} {user?.addresses?.[0]?.zipCode}
                </Text>
              </View>
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
          </View>
        </View>

        {/* Skills */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills & Services</Text>
          <View style={styles.skillsGrid}>
            {availableSkills.map((skill) => (
              <TouchableOpacity
                key={skill}
                style={[
                  styles.skillChip,
                  skills.includes(skill) && styles.skillChipActive,
                  !isEditing && styles.skillChipDisabled,
                ]}
                onPress={() => isEditing && toggleSkill(skill)}
                disabled={!isEditing}
              >
                <Text
                  style={[
                    styles.skillChipText,
                    skills.includes(skill) && styles.skillChipTextActive,
                  ]}
                >
                  {skill}
                </Text>
                {skills.includes(skill) && (
                  <Ionicons name="checkmark-circle" size={16} color="#FFA500" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Save Button */}
        {isEditing && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSubmit(handleSaveAddress)}
              disabled={isSaving}
            >
              <Text style={styles.saveButtonText}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Actions */}
        {!isEditing && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/(handyman)/growth')}
            >
              <Ionicons name="trending-up" size={20} color="#FFA500" />
              <Text style={styles.actionText}>View Growth Center</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.neutral[600]} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/(handyman)/profile/settings')}
            >
              <Ionicons name="settings" size={20} color="#FFA500" />
              <Text style={styles.actionText}>Settings & Notifications</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.neutral[600]} />
            </TouchableOpacity>

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
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  headerTitle: {
    ...typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
  },
  editButton: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: '#FFA500',
  },
  content: {
    padding: spacing.lg,
    gap: spacing.base,
  },
  profileHeader: {
    alignItems: 'center',
    backgroundColor: '#FFA50010',
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    borderWidth: 2,
    borderColor: '#FFA50030',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFA500',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.base,
  },
  profileName: {
    ...typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
  },
  profileBusiness: {
    ...typography.sizes.base,
    color: colors.neutral[600],
    marginBottom: spacing.base,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
  },
  statLabel: {
    ...typography.sizes.xs,
    color: colors.neutral[600],
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.neutral[300],
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  section: {
    gap: spacing.base,
  },
  sectionTitle: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
  },
  statusGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statusCard: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
  },
  statusCardActive: {
    backgroundColor: '#10B98110',
  },
  statusLabel: {
    ...typography.sizes.xs,
    color: colors.neutral[700],
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    gap: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoText: {
    ...typography.sizes.sm,
    color: colors.neutral[700],
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.neutral[200],
  },
  skillChipActive: {
    backgroundColor: '#FFA50020',
    borderColor: '#FFA500',
  },
  skillChipDisabled: {
    opacity: 1,
  },
  skillChipText: {
    ...typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.neutral[700],
  },
  skillChipTextActive: {
    color: '#FFA500',
    fontWeight: typography.weights.semibold,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  actionText: {
    ...typography.sizes.base,
    color: colors.neutral[700],
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    opacity: 0.6,
  },
  addressFormContainer: {
    paddingVertical: spacing.base,
  },
  saveButton: {
    backgroundColor: colors.primary.main,
    padding: spacing.base,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  saveButtonText: {
    ...typography.sizes.base,
    color: colors.background.primary,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
  },
  actions: {
    paddingHorizontal: spacing.base,
    marginTop: spacing.xl,
  },
});
