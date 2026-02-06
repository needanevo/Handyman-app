import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../src/constants/theme';
import { adminAPI } from '../../src/services/api';

type TimePeriod = 'day' | 'week' | 'month' | 'year' | 'ytd';

export default function AdminDashboard() {
  const router = useRouter();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('month');
  const [refreshing, setRefreshing] = useState(false);

  const { data: stats, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'dashboard', 'stats', timePeriod],
    queryFn: () => adminAPI.getDashboardStats(),
    refetchInterval: 60000, // Refresh every minute
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const timePeriodOptions: { value: TimePeriod; label: string }[] = [
    { value: 'day', label: 'Today' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'year', label: 'Year' },
    { value: 'ytd', label: 'YTD' },
  ];

  if (isLoading && !stats) {
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
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
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

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Time Period Selector */}
        <View style={styles.timePeriodSelector}>
          {timePeriodOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.timePeriodButton,
                timePeriod === option.value && styles.timePeriodButtonActive,
              ]}
              onPress={() => setTimePeriod(option.value)}
            >
              <Text
                style={[
                  styles.timePeriodButtonText,
                  timePeriod === option.value && styles.timePeriodButtonTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Stats Row */}
        <View style={styles.quickStatsRow}>
          <View style={styles.quickStatCard}>
            <View style={[styles.quickStatIcon, { backgroundColor: colors.primary.lightest }]}>
              <Ionicons name="people" size={24} color={colors.primary.main} />
            </View>
            <View style={styles.quickStatContent}>
              <Text style={styles.quickStatValue}>
                {(stats?.users.total_customers || 0) + (stats?.users.total_contractors || 0)}
              </Text>
              <Text style={styles.quickStatLabel}>Total Users</Text>
            </View>
          </View>
          <View style={styles.quickStatCard}>
            <View style={[styles.quickStatIcon, { backgroundColor: colors.success.lightest }]}>
              <Ionicons name="cash" size={24} color={colors.success.main} />
            </View>
            <View style={styles.quickStatContent}>
              <Text style={styles.quickStatValue}>
                ${(stats?.revenue.total || 0).toLocaleString()}
              </Text>
              <Text style={styles.quickStatLabel}>Total Revenue</Text>
            </View>
          </View>
          <View style={styles.quickStatCard}>
            <View style={[styles.quickStatIcon, { backgroundColor: colors.info.lightest }]}>
              <Ionicons name="briefcase" size={24} color={colors.info.main} />
            </View>
            <View style={styles.quickStatContent}>
              <Text style={styles.quickStatValue}>{stats?.jobs.total || 0}</Text>
              <Text style={styles.quickStatLabel}>Total Jobs</Text>
            </View>
          </View>
        </View>

        {/* Users Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Users Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="people" size={28} color={colors.primary.main} />
              <Text style={styles.statValue}>{stats?.users.total_customers || 0}</Text>
              <Text style={styles.statLabel}>Customers</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="construct" size={28} color={colors.warning.main} />
              <Text style={styles.statValue}>{stats?.users.total_contractors || 0}</Text>
              <Text style={styles.statLabel}>Contractors</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="checkmark-circle" size={28} color={colors.success.main} />
              <Text style={styles.statValue}>{stats?.users.active_contractors || 0}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="person-add" size={28} color={colors.info.main} />
              <Text style={styles.statValue}>
                +{stats?.users.new_customers_this_week || 0}
              </Text>
              <Text style={styles.statLabel}>New This Week</Text>
            </View>
          </View>
        </View>

        {/* Jobs Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Jobs Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="clipboard" size={28} color={colors.primary.main} />
              <Text style={styles.statValue}>{stats?.jobs.total || 0}</Text>
              <Text style={styles.statLabel}>Total Jobs</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="time" size={28} color={colors.warning.main} />
              <Text style={styles.statValue}>{stats?.jobs.pending || 0}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="build" size={28} color={colors.info.main} />
              <Text style={styles.statValue}>{stats?.jobs.in_progress || 0}</Text>
              <Text style={styles.statLabel}>In Progress</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="checkmark-done" size={28} color={colors.success.main} />
              <Text style={styles.statValue}>{stats?.jobs.completed || 0}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="calendar" size={28} color={colors.primary.main} />
              <Text style={styles.statValue}>{stats?.jobs.completed_this_month || 0}</Text>
              <Text style={styles.statLabel}>This Month</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="timer" size={28} color={colors.info.main} />
              <Text style={styles.statValue}>{stats?.jobs.completed_this_week || 0}</Text>
              <Text style={styles.statLabel}>This Week</Text>
            </View>
          </View>
        </View>

        {/* Revenue Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Revenue Overview</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, styles.revenueCard]}>
              <Ionicons name="cash" size={36} color={colors.success.main} />
              <Text style={styles.revenueValue}>
                ${(stats?.revenue.total || 0).toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>Total Revenue</Text>
            </View>
            <View style={[styles.statCard, styles.revenueCard]}>
              <Ionicons name="trending-up" size={36} color={colors.primary.main} />
              <Text style={styles.revenueValue}>
                ${(stats?.revenue.this_month || 0).toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>This Month</Text>
            </View>
          </View>
          {/* Revenue Progress Bar */}
          <View style={styles.revenueProgressContainer}>
            <View style={styles.revenueProgressBar}>
              <View
                style={[
                  styles.revenueProgressFill,
                  {
                    width: stats?.revenue.total
                      ? `${Math.min((stats.revenue.this_month / stats.revenue.total) * 100, 100)}%`
                      : '0%',
                  },
                ]}
              />
            </View>
            <Text style={styles.revenueProgressText}>
              {(stats?.revenue.total
                ? ((stats.revenue.this_month / stats.revenue.total) * 100).toFixed(1)
                : 0)}
              % of total revenue this month
            </Text>
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
              <View style={[styles.managementIcon, { backgroundColor: colors.primary.lightest }]}>
                <Ionicons name="construct" size={28} color={colors.primary.main} />
              </View>
              <View style={styles.managementCardText}>
                <Text style={styles.managementCardTitle}>Contractors</Text>
                <Text style={styles.managementCardSubtitle}>
                  Manage contractor accounts, approvals & assignments
                </Text>
              </View>
            </View>
            <View style={styles.managementCardRight}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{stats?.users.total_contractors || 0}</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.neutral[400]} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.managementCard}
            onPress={() => router.push('/(admin)/customers')}
          >
            <View style={styles.managementCardLeft}>
              <View style={[styles.managementIcon, { backgroundColor: colors.info.lightest }]}>
                <Ionicons name="people" size={28} color={colors.info.main} />
              </View>
              <View style={styles.managementCardText}>
                <Text style={styles.managementCardTitle}>Customers</Text>
                <Text style={styles.managementCardSubtitle}>
                  View customer accounts & job history
                </Text>
              </View>
            </View>
            <View style={styles.managementCardRight}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{stats?.users.total_customers || 0}</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.neutral[400]} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.managementCard}
            onPress={() => router.push('/(admin)/jobs')}
          >
            <View style={styles.managementCardLeft}>
              <View style={[styles.managementIcon, { backgroundColor: colors.success.lightest }]}>
                <Ionicons name="briefcase" size={28} color={colors.success.main} />
              </View>
              <View style={styles.managementCardText}>
                <Text style={styles.managementCardTitle}>Jobs</Text>
                <Text style={styles.managementCardSubtitle}>
                  View, assign & manage all jobs
                </Text>
              </View>
            </View>
            <View style={styles.managementCardRight}>
              <View style={[styles.badge, { backgroundColor: colors.warning.lightest }]}>
                <Text style={[styles.badgeText, { color: colors.warning.main }]}>
                  {stats?.jobs.pending || 0}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.neutral[400]} />
            </View>
          </TouchableOpacity>

          {/* Additional Management Options */}
          <Text style={styles.sectionSubtitle}>Additional</Text>

          <TouchableOpacity
            style={styles.managementCard}
            onPress={() => router.push('/(admin)/quotes' as any)}
          >
            <View style={styles.managementCardLeft}>
              <View style={[styles.managementIcon, { backgroundColor: colors.secondary.lightest }]}>
                <Ionicons name="document-text" size={28} color={colors.secondary.main} />
              </View>
              <View style={styles.managementCardText}>
                <Text style={styles.managementCardTitle}>Quotes</Text>
                <Text style={styles.managementCardSubtitle}>
                  Send & manage quotes
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.neutral[400]} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.managementCard}
            onPress={() => router.push('/(admin)/refunds' as any)}
          >
            <View style={styles.managementCardLeft}>
              <View style={[styles.managementIcon, { backgroundColor: colors.error.lightest }]}>
                <Ionicons name="return-down-back" size={28} color={colors.error.main} />
              </View>
              <View style={styles.managementCardText}>
                <Text style={styles.managementCardTitle}>Refunds</Text>
                <Text style={styles.managementCardSubtitle}>
                  Process refunds & adjustments
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.neutral[400]} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.managementCard}
            onPress={() => router.push('/(admin)/approvals' as any)}
          >
            <View style={styles.managementCardLeft}>
              <View style={[styles.managementIcon, { backgroundColor: colors.warning.lightest }]}>
                <Ionicons name="shield-checkmark" size={28} color={colors.warning.main} />
              </View>
              <View style={styles.managementCardText}>
                <Text style={styles.managementCardTitle}>Approvals</Text>
                <Text style={styles.managementCardSubtitle}>
                  Contractor & handyman registrations
                </Text>
              </View>
            </View>
            <View style={styles.managementCardRight}>
              <View style={[styles.badge, { backgroundColor: colors.error.main }]}>
                <Text style={[styles.badgeText, { color: 'white' }]}>
                  {stats?.pending_approvals || 0}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.neutral[400]} />
            </View>
          </TouchableOpacity>
        </View>

        {/* System Health */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Health</Text>
          <View style={styles.healthCard}>
            <View style={styles.healthRow}>
              <Ionicons name="server-outline" size={24} color={colors.success.main} />
              <Text style={styles.healthText}>Database: Connected</Text>
            </View>
            <View style={styles.healthRow}>
              <Ionicons name="cloud-outline" size={24} color={colors.success.main} />
              <Text style={styles.healthText}>API: Online</Text>
            </View>
            <View style={styles.healthRow}>
              <Ionicons name="notifications-outline" size={24} color={colors.info.main} />
              <Text style={styles.healthText}>Notifications: Active</Text>
            </View>
          </View>
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
    backgroundColor: colors.background.primary,
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
  retryButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    ...typography.sizes.base,
    color: 'white',
    fontWeight: typography.weights.semibold,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
  timePeriodSelector: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.lg,
    padding: spacing.xs,
    marginBottom: spacing.lg,
  },
  timePeriodButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  timePeriodButtonActive: {
    backgroundColor: colors.background.primary,
    ...shadows.sm,
  },
  timePeriodButtonText: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    fontWeight: typography.weights.medium,
  },
  timePeriodButtonTextActive: {
    color: colors.primary.main,
    fontWeight: typography.weights.semibold,
  },
  quickStatsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  quickStatCard: {
    flex: 1,
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.sm,
  },
  quickStatIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  quickStatContent: {
    flex: 1,
  },
  quickStatValue: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
  },
  quickStatLabel: {
    ...typography.sizes.xs,
    color: colors.neutral[600],
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
  sectionSubtitle: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[700],
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 140,
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
    ...typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.success.main,
    marginTop: spacing.sm,
  },
  revenueProgressContainer: {
    marginTop: spacing.lg,
  },
  revenueProgressBar: {
    height: 8,
    backgroundColor: colors.neutral[200],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  revenueProgressFill: {
    height: '100%',
    backgroundColor: colors.success.main,
    borderRadius: borderRadius.full,
  },
  revenueProgressText: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  managementCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  managementCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  managementCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  managementIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
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
  badge: {
    backgroundColor: colors.primary.lightest,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    minWidth: 32,
    alignItems: 'center',
  },
  badgeText: {
    ...typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.primary.main,
  },
  healthCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  healthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  healthText: {
    ...typography.sizes.base,
    color: colors.neutral[700],
  },
});
