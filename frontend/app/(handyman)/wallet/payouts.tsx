import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../../src/constants/theme';

export default function PayoutsHistory() {
  const router = useRouter();

  // TODO: Fetch from backend GET /api/handyman/wallet/payouts
  const mockPayouts = [
    {
      id: '1',
      date: '2025-11-20',
      amount: 170,
      jobTitle: 'Install door frame',
      jobAmount: 200,
      platformFee: 30,
      status: 'Completed',
    },
    {
      id: '2',
      date: '2025-11-18',
      amount: 102,
      jobTitle: 'Replace light fixture',
      jobAmount: 120,
      platformFee: 18,
      status: 'Completed',
    },
    {
      id: '3',
      date: '2025-11-15',
      amount: 238,
      jobTitle: 'Paint bedroom walls',
      jobAmount: 280,
      platformFee: 42,
      status: 'Completed',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payout History</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Filter/Sort Options */}
        <View style={styles.filterRow}>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="calendar" size={16} color={colors.neutral[700]} />
            <Text style={styles.filterText}>This Month</Text>
            <Ionicons name="chevron-down" size={16} color={colors.neutral[700]} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="funnel" size={16} color={colors.neutral[700]} />
            <Text style={styles.filterText}>All</Text>
            <Ionicons name="chevron-down" size={16} color={colors.neutral[700]} />
          </TouchableOpacity>
        </View>

        {/* Payout Cards */}
        <View style={styles.payoutsList}>
          {mockPayouts.map((payout) => (
            <View key={payout.id} style={styles.payoutCard}>
              <View style={styles.payoutHeader}>
                <View>
                  <Text style={styles.payoutDate}>{payout.date}</Text>
                  <Text style={styles.payoutJobTitle}>{payout.jobTitle}</Text>
                </View>
                <View style={styles.statusBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={styles.statusText}>{payout.status}</Text>
                </View>
              </View>

              <View style={styles.payoutBreakdown}>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Job Amount</Text>
                  <Text style={styles.breakdownValue}>${payout.jobAmount}</Text>
                </View>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Platform Fee (15%)</Text>
                  <Text style={styles.breakdownDeduction}>-${payout.platformFee}</Text>
                </View>
                <View style={[styles.breakdownRow, styles.breakdownTotal]}>
                  <Text style={styles.totalLabel}>Your Payout</Text>
                  <Text style={styles.totalAmount}>${payout.amount}</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.viewJobButton}>
                <Text style={styles.viewJobText}>View Job Details</Text>
                <Ionicons name="arrow-forward" size={14} color="#FFA500" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Tax Information Notice */}
        <View style={styles.taxNotice}>
          <Ionicons name="information-circle" size={20} color={colors.neutral[600]} />
          <View style={styles.taxNoticeText}>
            <Text style={styles.taxNoticeTitle}>Tax Information</Text>
            <Text style={styles.taxNoticeDescription}>
              As an independent contractor, you are responsible for tracking your income
              and paying taxes. We recommend keeping these records for tax filing.
            </Text>
          </View>
        </View>

        {/* Export/Download Button */}
        <TouchableOpacity style={styles.exportButton}>
          <Ionicons name="download" size={20} color="#FFA500" />
          <Text style={styles.exportText}>Export Payout History (CSV)</Text>
        </TouchableOpacity>
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
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.background.secondary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral[300],
  },
  filterText: {
    ...typography.sizes.sm,
    color: colors.neutral[700],
  },
  payoutsList: {
    gap: spacing.base,
    marginBottom: spacing.lg,
  },
  payoutCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    ...shadows.sm,
  },
  payoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.base,
  },
  payoutDate: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    marginBottom: spacing.xs,
  },
  payoutJobTitle: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: '#10B98110',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    ...typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: '#10B981',
  },
  payoutBreakdown: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  breakdownLabel: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
  },
  breakdownValue: {
    ...typography.sizes.sm,
    color: colors.neutral[700],
  },
  breakdownDeduction: {
    ...typography.sizes.sm,
    color: colors.error.main,
  },
  breakdownTotal: {
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[300],
  },
  totalLabel: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
  },
  totalAmount: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: '#FFA500',
  },
  viewJobButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  viewJobText: {
    ...typography.sizes.sm,
    color: '#FFA500',
    fontWeight: typography.weights.medium,
  },
  taxNotice: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.base,
  },
  taxNoticeText: {
    flex: 1,
  },
  taxNoticeTitle: {
    ...typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  taxNoticeDescription: {
    ...typography.sizes.xs,
    color: colors.neutral[600],
    lineHeight: 16,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: '#FFA50020',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#FFA500',
  },
  exportText: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: '#FFA500',
  },
});
