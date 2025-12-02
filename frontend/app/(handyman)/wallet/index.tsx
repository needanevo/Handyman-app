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

export default function WalletIndex() {
  const router = useRouter();

  // TODO: Fetch from backend GET /api/handyman/wallet
  const totalEarned = 2850;
  const thisWeek = 325;
  const thisMonth = 1240;
  const pendingPayout = 450;
  const nextPayoutDate = '2025-11-28';
  const platformFeeRate = 0.15;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wallet</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Total Earned Card */}
        <View style={styles.totalCard}>
          <Ionicons name="wallet" size={40} color="#FFA500" />
          <Text style={styles.totalLabel}>Total Earned</Text>
          <Text style={styles.totalAmount}>${totalEarned.toLocaleString()}</Text>
          <Text style={styles.totalSubtext}>Since you joined</Text>
        </View>

        {/* Earnings Breakdown */}
        <View style={styles.breakdownCard}>
          <Text style={styles.sectionTitle}>Earnings Breakdown</Text>
          <View style={styles.breakdownRow}>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>This Week</Text>
              <Text style={styles.breakdownAmount}>${thisWeek}</Text>
            </View>
            <View style={styles.breakdownDivider} />
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>This Month</Text>
              <Text style={styles.breakdownAmount}>${thisMonth}</Text>
            </View>
          </View>
        </View>

        {/* Pending Payout */}
        <View style={styles.pendingCard}>
          <View style={styles.pendingHeader}>
            <Ionicons name="time" size={24} color="#FFA500" />
            <Text style={styles.pendingTitle}>Pending Payout</Text>
          </View>
          <Text style={styles.pendingAmount}>${pendingPayout}</Text>
          <View style={styles.pendingInfo}>
            <Ionicons name="calendar" size={16} color={colors.neutral[600]} />
            <Text style={styles.pendingText}>Expected: {nextPayoutDate}</Text>
          </View>
          <View style={styles.pendingInfo}>
            <Ionicons name="information-circle" size={16} color={colors.neutral[600]} />
            <Text style={styles.pendingText}>Direct deposit 2-3 business days</Text>
          </View>
        </View>

        {/* Fee Transparency */}
        <View style={styles.feeCard}>
          <Text style={styles.sectionTitle}>How Fees Work</Text>
          <View style={styles.feeRow}>
            <View style={styles.feeItem}>
              <Ionicons name="cash" size={20} color="#10B981" />
              <View style={styles.feeTextContainer}>
                <Text style={styles.feeLabel}>Your Earnings</Text>
                <Text style={styles.feeValue}>85% of job price</Text>
              </View>
            </View>
            <View style={styles.feeItem}>
              <Ionicons name="shield-checkmark" size={20} color="#FFA500" />
              <View style={styles.feeTextContainer}>
                <Text style={styles.feeLabel}>Platform Fee</Text>
                <Text style={styles.feeValue}>{platformFeeRate * 100}%</Text>
              </View>
            </View>
          </View>
          <View style={styles.feeInfoBox}>
            <Text style={styles.feeInfoText}>
              Platform fee covers payment processing, escrow protection, customer support,
              and marketing that brings you jobs.
            </Text>
          </View>
        </View>

        {/* Payout History Button */}
        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => router.push('/(handyman)/wallet/payouts')}
        >
          <Ionicons name="list" size={20} color="#FFA500" />
          <Text style={styles.historyButtonText}>View Payout History</Text>
          <Ionicons name="arrow-forward" size={16} color="#FFA500" />
        </TouchableOpacity>

        {/* Banking Info */}
        <TouchableOpacity style={styles.bankingCard}>
          <View style={styles.bankingHeader}>
            <Ionicons name="card" size={20} color={colors.neutral[700]} />
            <Text style={styles.bankingTitle}>Bank Account</Text>
          </View>
          <Text style={styles.bankingText}>****1234 (Chase Bank)</Text>
          <Text style={styles.bankingLink}>Update banking info</Text>
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
    gap: spacing.base,
  },
  totalCard: {
    backgroundColor: '#FFA50010',
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFA50030',
  },
  totalLabel: {
    ...typography.sizes.base,
    color: colors.neutral[600],
    marginTop: spacing.sm,
  },
  totalAmount: {
    ...typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    marginTop: spacing.xs,
  },
  totalSubtext: {
    ...typography.sizes.sm,
    color: colors.neutral[500],
    marginTop: spacing.xs,
  },
  breakdownCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    ...shadows.sm,
  },
  sectionTitle: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.base,
  },
  breakdownRow: {
    flexDirection: 'row',
  },
  breakdownItem: {
    flex: 1,
    alignItems: 'center',
  },
  breakdownDivider: {
    width: 1,
    backgroundColor: colors.neutral[200],
  },
  breakdownLabel: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    marginBottom: spacing.xs,
  },
  breakdownAmount: {
    ...typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
  },
  pendingCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    ...shadows.sm,
  },
  pendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  pendingTitle: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
  },
  pendingAmount: {
    ...typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: '#FFA500',
    marginBottom: spacing.sm,
  },
  pendingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  pendingText: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
  },
  feeCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    ...shadows.sm,
  },
  feeRow: {
    flexDirection: 'row',
    gap: spacing.base,
    marginBottom: spacing.base,
  },
  feeItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  feeTextContainer: {
    flex: 1,
  },
  feeLabel: {
    ...typography.sizes.xs,
    color: colors.neutral[600],
  },
  feeValue: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
  },
  feeInfoBox: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
  },
  feeInfoText: {
    ...typography.sizes.xs,
    color: colors.neutral[600],
    lineHeight: 16,
  },
  historyButton: {
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
  historyButtonText: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: '#FFA500',
  },
  bankingCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
  },
  bankingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  bankingTitle: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
  },
  bankingText: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    marginBottom: spacing.xs,
  },
  bankingLink: {
    ...typography.sizes.sm,
    color: '#FFA500',
    fontWeight: typography.weights.medium,
  },
});
