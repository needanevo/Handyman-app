/**
 * Customer Settings Screen
 *
 * Placeholder settings screen for customer preferences.
 * CUSTOMER-ONLY UI - no contractor/business elements.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../src/constants/theme';
import { Card } from '../../src/components/Card';
import { authAPI } from '../../src/services/api';
import { storage } from '../../src/utils/storage';
import { useAuth } from '../../src/contexts/AuthContext';

export default function CustomerSettingsScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  // Local state for toggles (not persisted yet)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [marketingEmails, setMarketingEmails] = useState(false);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Request Account Deletion',
      'Your account will be marked for deletion. An admin must approve before your data is permanently removed. You have 30 days to cancel this request.\n\nYou will be logged out immediately and cannot undo this action.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request Deletion',
          style: 'destructive',
          onPress: async () => {
            Alert.alert(
              'Final Confirmation',
              'Are you absolutely sure? This will request permanent deletion of your account.',
              [
                { text: 'Go Back', style: 'cancel' },
                {
                  text: 'Yes, Request Deletion',
                  style: 'destructive',
                  onPress: async () => {
                    setIsDeleting(true);
                    try {
                      await authAPI.requestAccountDeletion();
                      // Clear tokens and logout
                      await storage.removeItem('accessToken');
                      await storage.removeItem('refreshToken');
                      Alert.alert(
                        'Deletion Requested',
                        'Your account has been marked for deletion. An admin will review and approve. Contact support if you want to cancel.'
                      );
                      router.replace('/auth/welcome');
                    } catch (error: any) {
                      const message = error.response?.data?.detail || 'Failed to request deletion. Make sure you have no active jobs.';
                      Alert.alert('Error', message);
                    } finally {
                      setIsDeleting(false);
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

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
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Notifications Section */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Push Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive updates about your jobs
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: colors.neutral[300], true: colors.primary.light }}
              thumbColor={notificationsEnabled ? colors.primary.main : colors.neutral[400]}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Email Notifications</Text>
              <Text style={styles.settingDescription}>
                Get job updates via email
              </Text>
            </View>
            <Switch
              value={emailNotifications}
              onValueChange={setEmailNotifications}
              trackColor={{ false: colors.neutral[300], true: colors.primary.light }}
              thumbColor={emailNotifications ? colors.primary.main : colors.neutral[400]}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>SMS Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive text message updates
              </Text>
            </View>
            <Switch
              value={smsNotifications}
              onValueChange={setSmsNotifications}
              trackColor={{ false: colors.neutral[300], true: colors.primary.light }}
              thumbColor={smsNotifications ? colors.primary.main : colors.neutral[400]}
            />
          </View>
        </Card>

        {/* Privacy Section */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Marketing Emails</Text>
              <Text style={styles.settingDescription}>
                Receive promotional offers and updates
              </Text>
            </View>
            <Switch
              value={marketingEmails}
              onValueChange={setMarketingEmails}
              trackColor={{ false: colors.neutral[300], true: colors.primary.light }}
              thumbColor={marketingEmails ? colors.primary.main : colors.neutral[400]}
            />
          </View>
        </Card>

        {/* Account Section */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <TouchableOpacity style={styles.actionRow}>
            <View style={styles.actionInfo}>
              <Ionicons name="key-outline" size={20} color={colors.neutral[700]} />
              <Text style={styles.actionLabel}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.actionRow}>
            <View style={styles.actionInfo}>
              <Ionicons name="shield-outline" size={20} color={colors.neutral[700]} />
              <Text style={styles.actionLabel}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.actionRow}>
            <View style={styles.actionInfo}>
              <Ionicons name="document-text-outline" size={20} color={colors.neutral[700]} />
              <Text style={styles.actionLabel}>Terms of Service</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity 
            style={[styles.actionRow, styles.deleteRow]}
            onPress={handleDeleteAccount}
            disabled={isDeleting}
          >
            <View style={styles.actionInfo}>
              <Ionicons name="trash-outline" size={20} color={colors.error.main} />
              <Text style={[styles.actionLabel, styles.deleteText]}>
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </Text>
            </View>
          </TouchableOpacity>
        </Card>

        {/* About Section */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>App Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
        </Card>
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
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing['4xl'],
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
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingLabel: {
    ...typography.sizes.base,
    color: colors.neutral[900],
    fontWeight: typography.weights.medium,
    marginBottom: spacing.xs,
  },
  settingDescription: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral[200],
    marginVertical: spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  actionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  actionLabel: {
    ...typography.sizes.base,
    color: colors.neutral[900],
    fontWeight: typography.weights.medium,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  infoLabel: {
    ...typography.sizes.base,
    color: colors.neutral[600],
  },
  infoValue: {
    ...typography.sizes.base,
    color: colors.neutral[900],
    fontWeight: typography.weights.medium,
  },
  deleteRow: {
    marginTop: spacing.sm,
  },
  deleteText: {
    color: colors.error.main,
  },
});
