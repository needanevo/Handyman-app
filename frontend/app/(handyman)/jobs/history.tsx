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
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../../src/constants/theme';
import { contractorAPI } from '../../../src/services/api';
import { LoadingSpinner } from '../../../src/components/LoadingSpinner';

export default function JobHistory() {
  const router = useRouter();

  // Fetch completed jobs from API
  // Using unified query key for cache synchronization with dashboard
  const { data: completedJobs, isLoading } = useQuery({
    queryKey: ['handyman-completed-jobs'],
    queryFn: async () => {
      const response: any = await contractorAPI.getCompletedJobs();
      return response.jobs || [];
    },
    staleTime: 2 * 60 * 1000,
  });

  const totalCompleted = completedJobs?.length || 0;
  const totalEarned = completedJobs?.reduce((sum: number, job: any) => sum + (job.payout || 0), 0) || 0;
  const averageRating = completedJobs && completedJobs.length > 0
    ? (completedJobs.reduce((sum: number, job: any) => sum + (job.rating || 0), 0) / completedJobs.length).toFixed(1)
    : '0.0';

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Loading job history..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job History</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Stats Summary */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalCompleted}</Text>
            <Text style={styles.statLabel}>Jobs Completed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>${totalEarned}</Text>
            <Text style={styles.statLabel}>Total Earned</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={20} color="#FFA500" />
              <Text style={styles.statValue}>{averageRating}</Text>
            </View>
            <Text style={styles.statLabel}>Avg Rating</Text>
          </View>
        </View>

        {/* Improve Rating CTA */}
        <TouchableOpacity
          style={styles.improveCTA}
          onPress={() => router.push('/(handyman)/growth')}
        >
          <Ionicons name="trending-up" size={20} color="#FFA500" />
          <Text style={styles.improveCTAText}>
            Want to improve your rating? Check Growth Center
          </Text>
          <Ionicons name="arrow-forward" size={16} color="#FFA500" />
        </TouchableOpacity>

        {/* Job History List */}
        <View style={styles.historyList}>
          {completedJobs && completedJobs.length > 0 ? completedJobs.map((job: any) => (
            <View key={job.id} style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{job.category}</Text>
                </View>
                <Text style={styles.dateText}>{job.completedDate}</Text>
              </View>

              <Text style={styles.jobTitle}>{job.title}</Text>

              <View style={styles.customerRow}>
                <Ionicons name="person" size={16} color={colors.neutral[600]} />
                <Text style={styles.customerText}>{job.customer}</Text>
              </View>

              <View style={styles.ratingSection}>
                <View style={styles.stars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name={star <= job.rating ? 'star' : 'star-outline'}
                      size={16}
                      color={star <= job.rating ? '#FFA500' : colors.neutral[400]}
                    />
                  ))}
                </View>
                <Text style={styles.reviewText}>"{job.review}"</Text>
              </View>

              <View style={styles.payoutRow}>
                <Text style={styles.payoutLabel}>Payout</Text>
                <Text style={styles.payoutAmount}>${job.payout}</Text>
              </View>
            </View>
          )) : (
            <View style={styles.emptyHistoryState}>
              <Ionicons name="time-outline" size={64} color={colors.neutral[400]} />
              <Text style={styles.emptyHistoryText}>No completed jobs yet</Text>
            </View>
          )}
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
    ...typography.headings.h4,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
  },
  content: {
    padding: spacing.lg,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    ...shadows.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
  },
  statLabel: {
    ...typography.caption.small,
    color: colors.neutral[600],
    marginTop: spacing.xs,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.neutral[200],
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  improveCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#FFA50010',
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: '#FFA50030',
  },
  improveCTAText: {
    ...typography.caption.regular,
    color: colors.neutral[700],
    flex: 1,
  },
  historyList: {
    gap: spacing.base,
  },
  historyCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    ...shadows.sm,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryBadge: {
    backgroundColor: colors.primary.lightest,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  categoryText: {
    ...typography.caption.small,
    fontWeight: typography.weights.semibold,
    color: colors.primary.main,
  },
  dateText: {
    ...typography.caption.small,
    color: colors.neutral[600],
  },
  jobTitle: {
    ...typography.headings.h5,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  customerText: {
    ...typography.caption.regular,
    color: colors.neutral[600],
  },
  ratingSection: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  stars: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  reviewText: {
    ...typography.caption.regular,
    color: colors.neutral[700],
    fontStyle: 'italic',
  },
  payoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  payoutLabel: {
    ...typography.caption.regular,
    color: colors.neutral[600],
  },
  payoutAmount: {
    ...typography.headings.h5,
    fontWeight: typography.weights.bold,
    color: '#FFA500',
  },
  emptyHistoryState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyHistoryText: {
    ...typography.body.regular,
    color: colors.neutral[600],
    marginTop: spacing.base,
  },
});
