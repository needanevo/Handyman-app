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
import { colors, spacing, typography, borderRadius, shadows } from '../../../src/constants/theme';
import { useAuth } from '../../../src/contexts/AuthContext';

export default function HandymanSettings() {
  const router = useRouter();
  const { logout } = useAuth();

  // TODO: Fetch from backend GET /api/handyman/settings
  const [notifications, setNotifications] = useState({
    newJobs: true,
    jobUpdates: true,
    messages: true,
    payouts: true,
    marketing: false,
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    // TODO: Save to backend PATCH /api/handyman/settings
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure? This will permanently delete your account, job history, and all data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: DELETE /api/handyman/account
            logout();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.settingsCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>New Jobs Available</Text>
                <Text style={styles.settingDescription}>
                  Get notified when jobs match your skills
                </Text>
              </View>
              <Switch
                value={notifications.newJobs}
                onValueChange={() => toggleNotification('newJobs')}
                trackColor={{ false: colors.neutral[300], true: '#FFA50060' }}
                thumbColor={notifications.newJobs ? '#FFA500' : colors.neutral[400]}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Job Updates</Text>
                <Text style={styles.settingDescription}>
                  Customer messages and job status changes
                </Text>
              </View>
              <Switch
                value={notifications.jobUpdates}
                onValueChange={() => toggleNotification('jobUpdates')}
                trackColor={{ false: colors.neutral[300], true: '#FFA50060' }}
                thumbColor={notifications.jobUpdates ? '#FFA500' : colors.neutral[400]}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Messages</Text>
                <Text style={styles.settingDescription}>
                  Direct messages from customers
                </Text>
              </View>
              <Switch
                value={notifications.messages}
                onValueChange={() => toggleNotification('messages')}
                trackColor={{ false: colors.neutral[300], true: '#FFA50060' }}
                thumbColor={notifications.messages ? '#FFA500' : colors.neutral[400]}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Payout Notifications</Text>
                <Text style={styles.settingDescription}>
                  When payments are processed
                </Text>
              </View>
              <Switch
                value={notifications.payouts}
                onValueChange={() => toggleNotification('payouts')}
                trackColor={{ false: colors.neutral[300], true: '#FFA50060' }}
                thumbColor={notifications.payouts ? '#FFA500' : colors.neutral[400]}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Marketing & Tips</Text>
                <Text style={styles.settingDescription}>
                  Business growth tips and platform updates
                </Text>
              </View>
              <Switch
                value={notifications.marketing}
                onValueChange={() => toggleNotification('marketing')}
                trackColor={{ false: colors.neutral[300], true: '#FFA50060' }}
                thumbColor={notifications.marketing ? '#FFA500' : colors.neutral[400]}
              />
            </View>
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.settingsCard}>
            <TouchableOpacity style={styles.actionRow}>
              <Ionicons name="lock-closed" size={20} color={colors.neutral[700]} />
              <Text style={styles.actionText}>Change Password</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionRow}>
              <Ionicons name="card" size={20} color={colors.neutral[700]} />
              <Text style={styles.actionText}>Update Banking Info</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionRow}>
              <Ionicons name="shield-checkmark" size={20} color={colors.neutral[700]} />
              <Text style={styles.actionText}>Privacy Policy</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionRow}>
              <Ionicons name="document-text" size={20} color={colors.neutral[700]} />
              <Text style={styles.actionText}>Terms of Service</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.settingsCard}>
            <TouchableOpacity style={styles.actionRow}>
              <Ionicons name="help-circle" size={20} color={colors.neutral[700]} />
              <Text style={styles.actionText}>Help Center</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionRow}>
              <Ionicons name="chatbubble" size={20} color={colors.neutral[700]} />
              <Text style={styles.actionText}>Contact Support</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionRow}>
              <Ionicons name="bug" size={20} color={colors.neutral[700]} />
              <Text style={styles.actionText}>Report a Problem</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.dangerTitle}>Danger Zone</Text>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
            <Ionicons name="trash" size={20} color={colors.error.main} />
            <Text style={styles.deleteText}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionCard}>
          <Text style={styles.versionText}>The Real Johnson Handyman</Text>
          <Text style={styles.versionNumber}>Version 1.0.0</Text>
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
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  headerTitle: {
    ...typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
  },
  content: {
    padding: spacing.lg,
    gap: spacing.base,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
  },
  dangerTitle: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.error.main,
  },
  settingsCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.base,
  },
  settingLabel: {
    ...typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  settingDescription: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  actionText: {
    ...typography.sizes.base,
    color: colors.neutral[700],
    flex: 1,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.error.lightest,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.error.main,
  },
  deleteText: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.error.main,
  },
  versionCard: {
    alignItems: 'center',
    padding: spacing.base,
  },
  versionText: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
  },
  versionNumber: {
    ...typography.sizes.xs,
    color: colors.neutral[500],
    marginTop: spacing.xs,
  },
});
