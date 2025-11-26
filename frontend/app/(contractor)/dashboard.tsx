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
import { Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { colors, spacing, typography, borderRadius, shadows } from '../../src/constants/theme';
import { useAuth } from '../../src/contexts/AuthContext';
import { Card } from '../../src/components/Card';
import { Badge } from '../../src/components/Badge';
import { Button } from '../../src/components/Button';
import { DashboardStats, JobStatus } from '../../src/types/contractor';

export default function ContractorDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
    // Hidden Growth Center unlock logic
  const jobsCompleted = user?.stats?.completedJobs || 0;
  const avgRating = user?.stats?.averageRating || 0;
  const paymentsReceived = user?.stats?.paymentsReceived || 0;

  // Unlock conditions
  const unlock1 = jobsCompleted >= 1;
  const unlock2 = jobsCompleted >= 2 && paymentsReceived >= 1;
  const unlock3 = jobsCompleted >= 3 && avgRating >= 4.8;

  // Final unlock state
  const growthCenterUnlocked = unlock3;
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  React.useEffect(() => {
    if (unlock3 && !growthCenterUnlocked) {
      setShowUnlockModal(true);
    }
  }, [unlock3]);


  // In production, this would fetch from API
  // For now, we'll use mock data
  const { data: stats, refetch } = useQuery<DashboardStats>({
    queryKey: ['contractor', 'stats'],
    queryFn: async () => {
      // Mock data - replace with actual API call
      return {
        availableJobsCount: 8,
        acceptedJobsCount: 3,
        scheduledJobsCount: 5,
        completedThisMonth: 12,
        completedYearToDate: 47,
        revenueThisMonth: 8500,
        revenueYearToDate: 42300,
        expensesThisMonth: 2100,
        expensesYearToDate: 9800,
        profitThisMonth: 6400,
        profitYearToDate: 32500,
        milesThisMonth: 245,
        milesYearToDate: 1823,
        milesAllTime: 5642,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
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
                {/* Unlock Hint #1 */}
        {!growthCenterUnlocked && unlock1 && !unlock2 && (
          <View style={styles.unlockHint}>
            <Text style={styles.unlockHintText}>
              Keep going — something unlocks soon.
            </Text>
          </View>
        )}

        {/* Unlock Hint #2 */}
        {!growthCenterUnlocked && unlock2 && !unlock3 && (
          <View style={styles.unlockHint}>
            <Text style={styles.unlockHintText}>
              One more job… and the real magic starts.
            </Text>
          </View>
        )}

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.name}>{user?.firstName || 'Contractor'}</Text>
          </View>
          {/* Secret Growth Center button */}
          {growthCenterUnlocked && (
            <TouchableOpacity
              style={styles.growthButton}
              onPress={() => router.push('/(contractor)/growth')}
            >
              <Text style={styles.growthButtonIcon}>📈</Text>
            </TouchableOpacity>
          )}       
        
          
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push('/profile')}
          >
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
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
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Financials</Text>
            <TouchableOpacity onPress={() => router.push('/(contractor)/reports')}>
              <Text style={styles.sectionLink}>View Reports</Text>
            </TouchableOpacity>
          </View>

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
        )}
      </ScrollView>
            {/* Growth Center Unlock Modal */}
      <Modal
        visible={showUnlockModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowUnlockModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>You’ve Proven Yourself</Text>
            <Text style={styles.modalMessage}>
              You’re officially invited to the Growth Center.
              Unlock powerful tools to raise prices, scale smarter,
              and access the elite side of the platform.
            </Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setShowUnlockModal(false);
                router.push('/(contractor)/growth');
              }}
            >
              <Text style={styles.modalButtonText}>Enter Growth Center</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
    ...typography.body.regular,
    color: colors.neutral[600],
  },
  name: {
    ...typography.headings.h2,
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
    ...typography.headings.h3,
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
  sectionLink: {
    ...typography.body.small,
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
    ...typography.caption.small,
    color: colors.background.primary,
    fontWeight: typography.weights.bold,
  },
  jobCardTitle: {
    ...typography.headings.h5,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  jobCardSubtitle: {
    ...typography.caption.regular,
    color: colors.neutral[600],
  },
  financialCard: {
    padding: spacing.lg,
  },
  financialRow: {
    gap: spacing.md,
  },
  financialLabel: {
    ...typography.body.regular,
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
    ...typography.caption.small,
    color: colors.neutral[600],
    marginBottom: spacing.xs,
  },
  financialAmount: {
    ...typography.headings.h5,
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
    ...typography.caption.regular,
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
    ...typography.caption.small,
    color: colors.neutral[600],
    marginBottom: spacing.xs,
  },
  mileageValue: {
    ...typography.headings.h5,
    color: colors.primary.main,
  },
    modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    ...shadows.md,
  },
  modalTitle: {
    fontSize: typography.xl,
    fontWeight: '700',
    marginBottom: spacing.md,
    color: colors.neutral[900],
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: typography.md,
    lineHeight: 22,
    marginBottom: spacing.lg,
    color: colors.neutral[700],
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: colors.primary[600],
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  modalButtonText: {
    color: colors.white,
    fontSize: typography.md,
    fontWeight: '600',
  },
    growthButton: {
    marginRight: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.sm,
  },
  growthButtonIcon: {
    fontSize: typography.xl,
    color: colors.primary[600],
  },
});
