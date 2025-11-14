/**
 * Contractor Dashboard
 *
 * Main hub for contractors to manage jobs, track earnings, and access quick actions.
 * Designed for mobile-first use with visual hierarchy guiding to most important actions.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../src/constants/theme';
import { useAuth } from '../../src/contexts/AuthContext';
import { Card } from '../../src/components/Card';
import { Badge } from '../../src/components/Badge';
import { Button } from '../../src/components/Button';
import { DashboardStats, JobStatus } from '../../src/types/contractor';
import { contractorAPI } from '../../src/services/api';

export default function ContractorDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch real dashboard stats from API
  const { data: stats, refetch, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ['contractor', 'stats'],
    queryFn: async () => {
      const response = await contractorAPI.getDashboardStats();
      return response as DashboardStats;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.name}>{user?.firstName || 'Contractor'}</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push('/profile')}
          >
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        </View>

        {/* Loading State */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading dashboard...</Text>
          </View>
        )}

        {/* Error State */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              Failed to load dashboard data. Pull down to refresh.
            </Text>
          </View>
        )}

        {/* Registration Status Banner */}
        {!isLoading && !error && (
        <>
        <View style={styles.section}>
          <Card style={styles.registrationCard}>
            <View style={styles.registrationContent}>
              <View style={styles.registrationInfo}>
                <Ionicons name="shield-checkmark" size={32} color={colors.success.main} />
                <View style={styles.registrationText}>
                  <Text style={styles.registrationTitle}>Registration Active</Text>
                  <Text style={styles.registrationSubtitle}>
                    Expires: {/* TODO: Add actual expiration date */} Nov 12, 2026
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => router.push('/auth/contractor/register-step1')}
              >
                <Ionicons name="create-outline" size={20} color={colors.primary.main} />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>

        {/* Job Status Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Jobs</Text>
          <View style={styles.jobCardsGrid}>
            {/* Available Jobs */}
            <TouchableOpacity
              style={styles.jobCard}
              onPress={() => router.push('/(contractor)/jobs/available')}
              activeOpacity={0.7}
            >
              <View style={styles.jobCardHeader}>
                <Text style={styles.jobCardIcon}>📋</Text>
                {stats && stats.availableJobsCount > 0 && (
                  <View style={styles.jobCardBadge}>
                    <Text style={styles.jobCardBadgeText}>{stats.availableJobsCount}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.jobCardTitle}>Available</Text>
              <Text style={styles.jobCardSubtitle}>Jobs you can accept</Text>
            </TouchableOpacity>

            {/* Accepted Jobs */}
            <TouchableOpacity
              style={[styles.jobCard, styles.jobCardWarning]}
              onPress={() => router.push('/(contractor)/jobs/accepted')}
              activeOpacity={0.7}
            >
              <View style={styles.jobCardHeader}>
                <Text style={styles.jobCardIcon}>🤝</Text>
                {stats && stats.acceptedJobsCount > 0 && (
                  <View style={[styles.jobCardBadge, styles.jobCardBadgeWarning]}>
                    <Text style={styles.jobCardBadgeText}>{stats.acceptedJobsCount}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.jobCardTitle}>Accepted</Text>
              <Text style={styles.jobCardSubtitle}>Need scheduling</Text>
            </TouchableOpacity>

            {/* Scheduled Jobs */}
            <TouchableOpacity
              style={[styles.jobCard, styles.jobCardPrimary]}
              onPress={() => router.push('/(contractor)/jobs/scheduled')}
              activeOpacity={0.7}
            >
              <View style={styles.jobCardHeader}>
                <Text style={styles.jobCardIcon}>📅</Text>
                {stats && stats.scheduledJobsCount > 0 && (
                  <View style={[styles.jobCardBadge, styles.jobCardBadgePrimary]}>
                    <Text style={styles.jobCardBadgeText}>{stats.scheduledJobsCount}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.jobCardTitle}>Scheduled</Text>
              <Text style={styles.jobCardSubtitle}>Upcoming work</Text>
            </TouchableOpacity>

            {/* Completed Jobs */}
            <TouchableOpacity
              style={[styles.jobCard, styles.jobCardSuccess]}
              onPress={() => router.push('/(contractor)/jobs/completed')}
              activeOpacity={0.7}
            >
              <View style={styles.jobCardHeader}>
                <Text style={styles.jobCardIcon}>✅</Text>
              </View>
              <Text style={styles.jobCardTitle}>Completed</Text>
              <Text style={styles.jobCardSubtitle}>{stats?.completedThisMonth || 0} this month</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Financial Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financials</Text>

          <Card style={styles.financialCard}>
            {/* This Month */}
            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>This Month</Text>
              <View style={styles.financialValues}>
                <View style={styles.financialItem}>
                  <Text style={styles.financialItemLabel}>Revenue</Text>
                  <Text style={[styles.financialAmount, styles.revenueText]}>
                    {formatCurrency(stats?.revenueThisMonth || 0)}
                  </Text>
                </View>
                <View style={styles.financialDivider} />
                <View style={styles.financialItem}>
                  <Text style={styles.financialItemLabel}>Expenses</Text>
                  <Text style={[styles.financialAmount, styles.expenseText]}>
                    {formatCurrency(stats?.expensesThisMonth || 0)}
                  </Text>
                </View>
                <View style={styles.financialDivider} />
                <View style={styles.financialItem}>
                  <Text style={styles.financialItemLabel}>Profit</Text>
                  <Text style={[styles.financialAmount, styles.profitText]}>
                    {formatCurrency(stats?.profitThisMonth || 0)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Year to Date */}
            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>Year to Date</Text>
              <View style={styles.financialValues}>
                <View style={styles.financialItem}>
                  <Text style={styles.financialItemLabel}>Revenue</Text>
                  <Text style={[styles.financialAmount, styles.revenueText]}>
                    {formatCurrency(stats?.revenueYearToDate || 0)}
                  </Text>
                </View>
                <View style={styles.financialDivider} />
                <View style={styles.financialItem}>
                  <Text style={styles.financialItemLabel}>Profit</Text>
                  <Text style={[styles.financialAmount, styles.profitText]}>
                    {formatCurrency(stats?.profitYearToDate || 0)}
                  </Text>
                </View>
              </View>
            </View>
          </Card>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(contractor)/expenses')}
            >
              <Text style={styles.actionIcon}>🧾</Text>
              <Text style={styles.actionText}>Track Expense</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(contractor)/mileage')}
            >
              <Text style={styles.actionIcon}>🚗</Text>
              <Text style={styles.actionText}>Log Mileage</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(contractor)/mileage/map')}
            >
              <Text style={styles.actionIcon}>🗺️</Text>
              <Text style={styles.actionText}>View Map</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Mileage Summary */}
        {stats && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mileage Tracking</Text>
            <Card style={styles.mileageCard}>
              <View style={styles.mileageRow}>
                <View style={styles.mileageItem}>
                  <Text style={styles.mileageLabel}>This Month</Text>
                  <Text style={styles.mileageValue}>{formatNumber(stats.milesThisMonth)} mi</Text>
                </View>
                <View style={styles.mileageItem}>
                  <Text style={styles.mileageLabel}>Year to Date</Text>
                  <Text style={styles.mileageValue}>{formatNumber(stats.milesYearToDate)} mi</Text>
                </View>
                <View style={styles.mileageItem}>
                  <Text style={styles.mileageLabel}>All Time</Text>
                  <Text style={styles.mileageValue}>{formatNumber(stats.milesAllTime)} mi</Text>
                </View>
              </View>
            </Card>
          </View>
        </>
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
  greeting: {
    ...typography.sizes.base,
    color: colors.neutral[600],
  },
  name: {
    ...typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIcon: {
    fontSize: 24,
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
    ...typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
  sectionLink: {
    ...typography.sizes.sm,
    color: colors.primary.main,
    fontWeight: typography.weights.semibold,
  },
  jobCardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  jobCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.background.primary,
    padding: spacing.base,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  jobCardWarning: {
    backgroundColor: colors.warning.lightest,
  },
  jobCardPrimary: {
    backgroundColor: colors.primary.lightest,
  },
  jobCardSuccess: {
    backgroundColor: colors.success.lightest,
  },
  jobCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  jobCardIcon: {
    fontSize: 32,
  },
  jobCardBadge: {
    backgroundColor: colors.neutral[700],
    borderRadius: borderRadius.full,
    minWidth: 24,
    height: 24,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  jobCardBadgeWarning: {
    backgroundColor: colors.warning.main,
  },
  jobCardBadgePrimary: {
    backgroundColor: colors.primary.main,
  },
  jobCardBadgeText: {
    ...typography.sizes.xs,
    color: colors.background.primary,
    fontWeight: typography.weights.bold,
  },
  jobCardTitle: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  jobCardSubtitle: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
  },
  financialCard: {
    padding: spacing.lg,
  },
  financialRow: {
    gap: spacing.md,
  },
  financialLabel: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[700],
    marginBottom: spacing.sm,
  },
  financialValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  financialItem: {
    flex: 1,
    alignItems: 'center',
  },
  financialItemLabel: {
    ...typography.sizes.xs,
    color: colors.neutral[600],
    marginBottom: spacing.xs,
  },
  financialAmount: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  revenueText: {
    color: colors.secondary.main,
  },
  expenseText: {
    color: colors.error.main,
  },
  profitText: {
    color: colors.success.dark,
  },
  financialDivider: {
    width: 1,
    height: '100%',
    backgroundColor: colors.neutral[200],
    marginHorizontal: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral[200],
    marginVertical: spacing.lg,
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.background.primary,
    padding: spacing.base,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    ...shadows.sm,
  },
  actionIcon: {
    fontSize: 36,
    marginBottom: spacing.sm,
  },
  actionText: {
    ...typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[700],
    textAlign: 'center',
  },
  mileageCard: {
    padding: spacing.lg,
  },
  mileageRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  mileageItem: {
    alignItems: 'center',
  },
  mileageLabel: {
    ...typography.sizes.xs,
    color: colors.neutral[600],
    marginBottom: spacing.xs,
  },
  mileageValue: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primary.main,
  },
  registrationCard: {
    padding: spacing.base,
  },
  registrationContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  registrationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  registrationText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  registrationTitle: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  registrationSubtitle: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary.lightest,
    borderRadius: borderRadius.md,
  },
  editButtonText: {
    ...typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.primary.main,
    marginLeft: spacing.xs,
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...typography.sizes.base,
    color: colors.neutral[600],
  },
  errorContainer: {
    padding: spacing.xl,
    backgroundColor: colors.error.lightest,
    borderRadius: borderRadius.md,
    margin: spacing.md,
  },
  errorText: {
    ...typography.sizes.base,
    color: colors.error.main,
    textAlign: 'center',
  },
});
