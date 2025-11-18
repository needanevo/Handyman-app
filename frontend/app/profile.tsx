/**
 * Customer Profile Page
 *
 * Displays customer information and manages addresses.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../src/constants/theme';
import { useAuth } from '../src/contexts/AuthContext';
import { Card } from '../src/components/Card';
import { Button } from '../src/components/Button';
import { profileAPI } from '../src/services/api';

export default function CustomerProfile() {
  const router = useRouter();
  const { user, logout, refreshUser } = useAuth();
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Address form state
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');

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
            await logout();
            router.replace('/auth/welcome');
          },
        },
      ]
    );
  };

  const handleAddAddress = async () => {
    if (!street || !city || !state || !zipCode) {
      Alert.alert('Error', 'Please fill in all address fields');
      return;
    }

    try {
      setIsLoading(true);
      await profileAPI.addAddress({
        street,
        city,
        state,
        zip_code: zipCode,
        is_default: user?.addresses?.length === 0, // First address is default
      });

      // Refresh user to get updated addresses
      await refreshUser();

      // Reset form
      setStreet('');
      setCity('');
      setState('');
      setZipCode('');
      setIsAddingAddress(false);

      Alert.alert('Success', 'Address added successfully');
    } catch (error: any) {
      console.error('Failed to add address:', error);
      Alert.alert(
        'Error',
        error.response?.data?.detail || 'Failed to add address. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.primary.main} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Profile Card */}
        <View style={styles.section}>
          <Card style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>
                  {user?.firstName} {user?.lastName}
                </Text>
                <Text style={styles.profileRole}>Customer</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <Card style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={20} color={colors.neutral[600]} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user?.email}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={20} color={colors.neutral[600]} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{user?.phone || 'Not provided'}</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Addresses */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Addresses</Text>
            <TouchableOpacity onPress={() => setIsAddingAddress(!isAddingAddress)}>
              <Ionicons
                name={isAddingAddress ? "close" : "add-circle-outline"}
                size={24}
                color={colors.primary.main}
              />
            </TouchableOpacity>
          </View>

          {/* Add Address Form */}
          {isAddingAddress && (
            <Card style={styles.addAddressCard}>
              <Text style={styles.addAddressTitle}>Add New Address</Text>

              <TextInput
                style={styles.input}
                placeholder="Street Address"
                value={street}
                onChangeText={setStreet}
                placeholderTextColor={colors.neutral[400]}
              />

              <TextInput
                style={styles.input}
                placeholder="City"
                value={city}
                onChangeText={setCity}
                placeholderTextColor={colors.neutral[400]}
              />

              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.inputHalf]}
                  placeholder="State"
                  value={state}
                  onChangeText={setState}
                  maxLength={2}
                  autoCapitalize="characters"
                  placeholderTextColor={colors.neutral[400]}
                />
                <TextInput
                  style={[styles.input, styles.inputHalf]}
                  placeholder="Zip Code"
                  value={zipCode}
                  onChangeText={setZipCode}
                  keyboardType="numeric"
                  maxLength={10}
                  placeholderTextColor={colors.neutral[400]}
                />
              </View>

              <Button
                title="Save Address"
                onPress={handleAddAddress}
                loading={isLoading}
                size="medium"
                fullWidth
              />
            </Card>
          )}

          {/* Existing Addresses */}
          {user?.addresses && user.addresses.length > 0 ? (
            user.addresses.map((address, index) => (
              <Card key={address.id || index} style={styles.addressCard}>
                <View style={styles.addressHeader}>
                  <Ionicons name="location-outline" size={20} color={colors.neutral[600]} />
                  {address.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>Default</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.addressStreet}>{address.street}</Text>
                <Text style={styles.addressCity}>
                  {address.city}, {address.state} {address.zipCode}
                </Text>
              </Card>
            ))
          ) : !isAddingAddress ? (
            <Card style={styles.emptyCard}>
              <Ionicons name="location-outline" size={48} color={colors.neutral[400]} />
              <Text style={styles.emptyText}>No addresses saved</Text>
              <Text style={styles.emptySubtext}>
                Add an address to request services
              </Text>
            </Card>
          ) : null}
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="outline"
            size="large"
            fullWidth
            icon={<Ionicons name="log-out-outline" size={20} color={colors.error.main} />}
            style={styles.logoutButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing['4xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.lg,
    backgroundColor: colors.background.primary,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
  },
  section: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.base,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
  profileCard: {
    padding: spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.base,
  },
  avatarText: {
    ...typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.background.primary,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  profileRole: {
    ...typography.sizes.base,
    color: colors.neutral[600],
  },
  infoCard: {
    padding: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  infoLabel: {
    ...typography.sizes.xs,
    color: colors.neutral[600],
    marginBottom: spacing.xs,
  },
  infoValue: {
    ...typography.sizes.base,
    color: colors.neutral[900],
    fontWeight: typography.weights.medium,
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral[200],
    marginVertical: spacing.base,
  },
  addAddressCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  addAddressTitle: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.sizes.base,
    color: colors.neutral[900],
    marginBottom: spacing.md,
    backgroundColor: colors.background.primary,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  inputHalf: {
    flex: 1,
  },
  addressCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  defaultBadge: {
    backgroundColor: colors.primary.lightest,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  defaultBadgeText: {
    ...typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.primary.main,
  },
  addressStreet: {
    ...typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  addressCity: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
  },
  emptyCard: {
    padding: spacing['2xl'],
    alignItems: 'center',
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
  logoutButton: {
    borderColor: colors.error.main,
  },
});
