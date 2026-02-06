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
import { colors, spacing, typography, borderRadius, shadows } from '../../src/constants/theme';
import { useAuth } from '../../src/contexts/AuthContext';

export default function AdminSettings() {
  const router = useRouter();
  const { user, logout } = useAuth();

  // Settings state (would be fetched from/saved to backend in production)
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    autoApproveContractors: false,
    requireInsurance: true,
    requireLicense: true,
    maintenanceMode: false,
  });

  const handleToggle = (key: keyof typeof settings) => {
    if (key === 'maintenanceMode') {
      Alert.alert(
        'Maintenance Mode',
        settings.maintenanceMode
          ? 'This will take the app out of maintenance mode and allow normal operations.'
          : 'This will put the app in maintenance mode. Users will see a maintenance message.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: settings.maintenanceMode ? 'Disable' : 'Enable',
            style: settings.maintenanceMode ? 'default' : 'destructive',
            onPress: () => setSettings(prev => ({ ...prev, [key]: !prev[key] }))
          },
        ]
      );
    } else {
      setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth/welcome');
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primary.main} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Admin Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Admin Account</Text>
          <View style={styles.infoCard}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={32} color={colors.primary.main} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoName}>
                {user?.firstName} {user?.lastName}
              </Text>
              <Text style={styles.infoEmail}>{user?.email}</Text>
              <Text style={styles.infoRole}>Administrator</Text>
            </View>
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Email Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive email alerts for new registrations and issues
              </Text>
            </View>
            <Switch
              value={settings.emailNotifications}
              onValueChange={() => handleToggle('emailNotifications')}
              trackColor={{ false: colors.neutral[300], true: colors.primary.light }}
              thumbColor={settings.emailNotifications ? colors.primary.main : colors.neutral[100]}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Push Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive push notifications for urgent matters
              </Text>
            </View>
            <Switch
              value={settings.pushNotifications}
              onValueChange={() => handleToggle('pushNotifications')}
              trackColor={{ false: colors.neutral[300], true: colors.primary.light }}
              thumbColor={settings.pushNotifications ? colors.primary.main : colors.neutral[100]}
            />
          </View>
        </View>

        {/* Registration Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Registration Requirements</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Auto-Approve Contractors</Text>
              <Text style={styles.settingDescription}>
                Automatically approve contractor registrations
              </Text>
            </View>
            <Switch
              value={settings.autoApproveContractors}
              onValueChange={() => handleToggle('autoApproveContractors')}
              trackColor={{ false: colors.neutral[300], true: colors.primary.light }}
              thumbColor={settings.autoApproveContractors ? colors.primary.main : colors.neutral[100]}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Require Insurance</Text>
              <Text style={styles.settingDescription}>
                Require proof of insurance for contractors
              </Text>
            </View>
            <Switch
              value={settings.requireInsurance}
              onValueChange={() => handleToggle('requireInsurance')}
              trackColor={{ false: colors.neutral[300], true: colors.primary.light }}
              thumbColor={settings.requireInsurance ? colors.primary.main : colors.neutral[100]}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Require License</Text>
              <Text style={styles.settingDescription}>
                Require professional license for contractors
              </Text>
            </View>
            <Switch
              value={settings.requireLicense}
              onValueChange={() => handleToggle('requireLicense')}
              trackColor={{ false: colors.neutral[300], true: colors.primary.light }}
              thumbColor={settings.requireLicense ? colors.primary.main : colors.neutral[100]}
            />
          </View>
        </View>

        {/* System */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System</Text>

          <View style={[styles.settingRow, settings.maintenanceMode && styles.dangerRow]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, settings.maintenanceMode && styles.dangerText]}>
                Maintenance Mode
              </Text>
              <Text style={styles.settingDescription}>
                Temporarily disable app for maintenance
              </Text>
            </View>
            <Switch
              value={settings.maintenanceMode}
              onValueChange={() => handleToggle('maintenanceMode')}
              trackColor={{ false: colors.neutral[300], true: colors.error.light }}
              thumbColor={settings.maintenanceMode ? colors.error.main : colors.neutral[100]}
            />
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => Alert.alert('Cache Cleared', 'App cache has been cleared.')}
          >
            <Ionicons name="trash-outline" size={24} color={colors.primary.main} />
            <Text style={styles.actionButtonText}>Clear Cache</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => Alert.alert('Export', 'Data export feature coming soon.')}
          >
            <Ionicons name="download-outline" size={24} color={colors.primary.main} />
            <Text style={styles.actionButtonText}>Export Data</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={24} color={colors.error.main} />
            <Text style={[styles.actionButtonText, styles.logoutText]}>Logout</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
          </TouchableOpacity>
        </View>

        {/* Version Info */}
        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>Handyman App Admin v1.0.0</Text>
          <Text style={styles.versionSubtext}>Build 2026.02.05</Text>
        </View>
      </ScrollView>
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[700],
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary.lightest,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  infoContent: {
    flex: 1,
  },
  infoName: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
  },
  infoEmail: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    marginTop: spacing.xs,
  },
  infoRole: {
    ...typography.sizes.xs,
    color: colors.primary.main,
    fontWeight: typography.weights.semibold,
    marginTop: spacing.xs,
    textTransform: 'uppercase',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  dangerRow: {
    borderWidth: 1,
    borderColor: colors.error.light,
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingLabel: {
    ...typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.neutral[900],
  },
  dangerText: {
    color: colors.error.main,
  },
  settingDescription: {
    ...typography.sizes.sm,
    color: colors.neutral[500],
    marginTop: spacing.xs,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  actionButtonText: {
    ...typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.neutral[900],
    flex: 1,
    marginLeft: spacing.md,
  },
  logoutButton: {
    marginTop: spacing.md,
  },
  logoutText: {
    color: colors.error.main,
  },
  versionInfo: {
    alignItems: 'center',
    paddingTop: spacing.xl,
  },
  versionText: {
    ...typography.sizes.sm,
    color: colors.neutral[500],
  },
  versionSubtext: {
    ...typography.sizes.xs,
    color: colors.neutral[400],
    marginTop: spacing.xs,
  },
});
