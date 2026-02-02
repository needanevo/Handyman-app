/**
 * Completed Jobs Screen
 *
 * View all jobs that have been marked as completed.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../../src/constants/theme';
import { Card } from '../../../src/components/Card';
import { Badge } from '../../../src/components/Badge';
import { LoadingSpinner } from '../../../src/components/LoadingSpinner';
import { EmptyState } from '../../../src/components/EmptyState';
import { contractorAPI } from '../../../src/services/api';

export default function CompletedJobsScreen() {
  const router = useRouter();

  // Fetch completed jobs
  // Using unified query key for cache synchronization with dashboard
  const { data: jobs, isLoading } = useQuery({
    queryKey: ['contractor-completed-jobs'],
    queryFn: async () => {
      const response = await contractorAPI.getCompletedJobs() as any;
      return response.data.jobs || [];
    },
    staleTime: 2 * 60 * 1000,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Loading completed jobs..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Completed Jobs</Text>
        <View style={{ width: 40 }} />
      </View>

      {jobs && jobs.length > 0 ? (
        <FlatList
          data={jobs}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }: any) => (
            <Card
              style={styles.jobCard}
              onPress={() => router.push(`/(contractor)/jobs/${item.id}`)}
            >
              <View style={styles.jobHeader}>
                <View style={styles.jobInfo}>
                  <Text style={styles.jobTitle}>{item.title || 'Job Details'}</Text>
                  <Text style={styles.jobLocation}>{item.location || 'Location TBD'}</Text>
                  {item.completedDate && (
                    <Text style={styles.completedDate}>
                      ✅ Completed {new Date(item.completedDate).toLocaleDateString()}
                    </Text>
                  )}
                </View>
                <View style={styles.statusContainer}>
                  <Badge variant="success" label="Completed" />
                  {item.payout && (
                    <Text style={styles.payoutAmount}>
                      {formatCurrency(item.payout)}
                    </Text>
                  )}
                </View>
              </View>
            </Card>
          )}
        />
      ) : (
        <EmptyState
          icon="checkmark-done-outline"
          title="No Completed Jobs"
          description="Finished jobs will appear here for your records"
          actionLabel="View Available Jobs"
          onAction={() => router.push('/(contractor)/jobs/available')}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.lg,
    backgroundColor: colors.background.primary,
    ...shadows.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
  },
  listContent: {
    padding: spacing.base,
  },
  jobCard: {
    padding: spacing.base,
    marginBottom: spacing.md,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  jobInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  jobTitle: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  jobLocation: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    marginBottom: spacing.xs,
  },
  completedDate: {
    ...typography.sizes.sm,
    color: colors.success.dark,
    fontWeight: typography.weights.medium,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  payoutAmount: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.success.dark,
    marginTop: spacing.sm,
  },
});
