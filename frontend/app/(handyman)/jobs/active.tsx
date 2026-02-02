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

export default function ActiveJobs() {
  const router = useRouter();

  // Fetch scheduled jobs only (backend truth, no frontend grouping)
  // Using unified query key for cache synchronization with dashboard
  const { data: scheduledJobs, isLoading } = useQuery({
    queryKey: ['handyman-scheduled-jobs'],
    queryFn: async () => {
      const response: any = await contractorAPI.getScheduledJobs();
      return response.jobs || [];
    },
    staleTime: 2 * 60 * 1000,
  });

  // Use scheduled jobs directly from backend (no merging)
  const activeJobs = scheduledJobs || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return '#3B82F6';
      case 'in_progress':
        return '#FFA500';
      case 'accepted':
        return '#8B5CF6';
      case 'pending':
        return colors.warning.main;
      case 'completed':
        return colors.success.main;
      case 'cancelled':
        return colors.error.main;
      default:
        return colors.neutral[600];
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Loading active jobs..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Active Jobs</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {activeJobs.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="briefcase-outline" size={64} color={colors.neutral[400]} />
            <Text style={styles.emptyStateTitle}>No Active Jobs</Text>
            <Text style={styles.emptyStateText}>
              Check out available jobs to get started
            </Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => router.push('/(handyman)/jobs/available')}
            >
              <Text style={styles.browseButtonText}>Browse Jobs</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.jobsList}>
            {activeJobs.map((job: any) => (
              <TouchableOpacity
                key={job.id}
                style={styles.jobCard}
                onPress={() => router.push(`/(handyman)/jobs/${job.id}` as any)}
              >
                <View style={styles.jobHeader}>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{job.category}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: `${getStatusColor(job.status)}20` },
                    ]}
                  >
                    <Text style={[styles.statusText, { color: getStatusColor(job.status) }]}>
                      {job.status}
                    </Text>
                  </View>
                </View>

                <Text style={styles.jobTitle}>{job.title}</Text>

                <View style={styles.jobInfo}>
                  <View style={styles.jobInfoRow}>
                    <Ionicons name="person" size={16} color={colors.neutral[600]} />
                    <Text style={styles.jobInfoText}>{job.customer}</Text>
                  </View>
                  <View style={styles.jobInfoRow}>
                    <Ionicons name="location" size={16} color={colors.neutral[600]} />
                    <Text style={styles.jobInfoText}>{job.address}</Text>
                  </View>
                  <View style={styles.jobInfoRow}>
                    <Ionicons name="calendar" size={16} color={colors.neutral[600]} />
                    <Text style={styles.jobInfoText}>{job.scheduledDate}</Text>
                  </View>
                </View>

                <View style={styles.jobFooter}>
                  <View>
                    <Text style={styles.payLabel}>Estimated Pay</Text>
                    <Text style={styles.payAmount}>${job.estimatedPay}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => router.push(`/(handyman)/jobs/${job.id}` as any)}
                  >
                    <Text style={styles.actionButtonText}>View Details</Text>
                    <Ionicons name="arrow-forward" size={16} color="#FFF" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
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
    color: colors.neutral[900],
  },
  content: {
    padding: spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyStateTitle: {
    ...typography.headings.h4,
    color: colors.neutral[900],
    marginTop: spacing.base,
    marginBottom: spacing.xs,
  },
  emptyStateText: {
    ...typography.body.regular,
    color: colors.neutral[600],
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  browseButton: {
    backgroundColor: '#FFA500',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
  },
  browseButtonText: {
    ...typography.body.regular,
    fontWeight: typography.weights.semibold,
    color: '#FFF',
  },
  jobsList: {
    gap: spacing.base,
  },
  jobCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    ...shadows.sm,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  statusBadge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    ...typography.caption.small,
    fontWeight: typography.weights.semibold,
  },
  jobTitle: {
    ...typography.headings.h5,
    color: colors.neutral[900],
    marginBottom: spacing.sm,
  },
  jobInfo: {
    gap: spacing.xs,
    marginBottom: spacing.base,
  },
  jobInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  jobInfoText: {
    ...typography.caption.regular,
    color: colors.neutral[600],
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  payLabel: {
    ...typography.caption.small,
    color: colors.neutral[600],
  },
  payAmount: {
    ...typography.headings.h4,
    color: '#FFA500',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: '#FFA500',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderRadius: borderRadius.md,
  },
  actionButtonText: {
    ...typography.caption.regular,
    fontWeight: typography.weights.semibold,
    color: '#FFF',
  },
});
