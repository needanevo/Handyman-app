import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../src/constants/theme';
import { adminAPI } from '../../src/services/api';

export default function AdminDashboard() {
  const router = useRouter();

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['admin', 'dashboard', 'stats'],
    queryFn: () => adminAPI.getDashboardStats(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.error.main} />
          <Text style={styles.errorText}>Failed to load dashboard</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <TouchableOpacity
          onPress={() => router.push('/(admin)/settings')}
          style={styles.settingsButton}
        >
          <Ionicons name="settings-outline" size={24} color={colors.primary.main} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Users Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Users</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="people" size={32} color={colors.primary.main} />
              <Text style={styles.statValue}>{stats?.users.total_customers || 0}</Text>
              <Text style={styles.statLabel}>Total Customers</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="construct" size={32} color={colors.success.main} />
              <Text style={styles.statValue}>{stats?.users.total_contractors || 0}</Text>
              <Text style={styles.statLabel}>Total Contractors</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="checkmark-circle" size={32} color={colors.success.main} />
              <Text style={styles.statValue}>{stats?.users.active_contractors || 0}</Text>
              <Text style={styles.statLabel}>Active Contractors</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="trending-up" size={32} color={colors.info.main} />
              <Text style={styles.statValue}>
                +{stats?.users.new_customers_this_week || 0}
              </Text>
              <Text style={styles.statLabel}>New Customers (Week)</Text>
            </View>
          </View>
        </View>

        {/* Jobs Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Jobs</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="clipboard" size={32} color={colors.primary.main} />
              <Text style={styles.statValue}>{stats?.jobs.total || 0}</Text>
              <Text style={styles.statLabel}>Total Jobs</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="time" size={32} color={colors.warning.main} />
              <Text style={styles.statValue}>{stats?.jobs.pending || 0}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="build" size={32} color={colors.info.main} />
              <Text style={styles.statValue}>{stats?.jobs.in_progress || 0}</Text>
              <Text style={styles.statLabel}>In Progress</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="checkmark-done" size={32} color={colors.success.main} />
              <Text style={styles.statValue}>{stats?.jobs.completed || 0}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="calendar" size={32} color={colors.primary.main} />
              <Text style={styles.statValue}>{stats?.jobs.completed_this_month || 0}</Text>
              <Text style={styles.statLabel}>This Month</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="timer" size={32} color={colors.info.main} />
              <Text style={styles.statValue}>{stats?.jobs.completed_this_week || 0}</Text>
              <Text style={styles.statLabel}>This Week</Text>
            </View>
          </View>
        </View>

        {/* Revenue Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Revenue</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, styles.revenueCard]}>
              <Ionicons name="cash" size={40} color={colors.success.main} />
              <Text style={styles.revenueValue}>
                ${stats?.revenue.total?.toLocaleString() || '0'}
              </Text>
              <Text style={styles.statLabel}>Total Revenue</Text>
            </View>
            <View style={[styles.statCard, styles.revenueCard]}>
              <Ionicons name="trending-up" size={40} color={colors.primary.main} />
              <Text style={styles.revenueValue}>
                ${stats?.revenue.this_month?.toLocaleString() || '0'}
              </Text>
              <Text style={styles.statLabel}>This Month</Text>
            </View>
          </View>
        </View>

        {/* Management Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Management</Text>
          <TouchableOpacity
            style={styles.managementCard}
            onPress={() => router.push('/(admin)/contractors')}
          >
            <View style={styles.managementCardLeft}>
              <Ionicons name="construct" size={32} color={colors.primary.main} />
              <View style={styles.managementCardText}>
                <Text style={styles.managementCardTitle}>Contractors</Text>
                <Text style={styles.managementCardSubtitle}>
                  Manage contractor accounts and assignments
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.neutral[400]} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.managementCard}
            onPress={() => router.push('/(admin)/customers')}
          >
            <View style={styles.managementCardLeft}>
              <Ionicons name="people" size={32} color={colors.info.main} />
              <View style={styles.managementCardText}>
                <Text style={styles.managementCardTitle}>Customers</Text>
                <Text style={styles.managementCardSubtitle}>
                  View customer accounts and history
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.neutral[400]} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.managementCard}
            onPress={() => router.push('/(admin)/jobs')}
          >
            <View style={styles.managementCardLeft}>
              <Ionicons name="briefcase" size={32} color={colors.success.main} />
              <View style={styles.managementCardText}>
                <Text style={styles.managementCardTitle}>Jobs</Text>
                <Text style={styles.managementCardSubtitle}>
                  View and manage all jobs
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.neutral[400]} />
          </TouchableOpacity>
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
  headerTitle: {
    ...typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
  },
  settingsButton: {
    padding: spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    ...typography.sizes.base,
    color: colors.neutral[600],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  errorText: {
    ...typography.sizes.base,
    color: colors.error.main,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.xl,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 150,
    flex: 1,
    gap: spacing.xs,
    ...shadows.sm,
  },
  statValue: {
    ...typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    marginTop: spacing.xs,
  },
  statLabel: {
    ...typography.sizes.xs,
    color: colors.neutral[600],
    textAlign: 'center',
  },
  revenueCard: {
    minWidth: '45%',
  },
  revenueValue: {
    ...typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.success.main,
    marginTop: spacing.sm,
  },
  managementCard: {
    backgroundColor: 'white',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadows.sm,
  },
  managementCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  managementCardText: {
    flex: 1,
  },
  managementCardTitle: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.xs / 2,
  },
  managementCardSubtitle: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
  },
});
