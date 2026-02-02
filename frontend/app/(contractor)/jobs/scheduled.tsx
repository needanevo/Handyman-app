/**
 * Scheduled Jobs Screen
 *
 * View all jobs that have been scheduled with specific dates/times.
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

export default function ScheduledJobsScreen() {
  const router = useRouter();

  // Fetch scheduled jobs
  // Using unified query key for cache synchronization with dashboard
  const { data: jobs, isLoading } = useQuery({
    queryKey: ['contractor-scheduled-jobs'],
    queryFn: async () => {
      const response = await contractorAPI.getScheduledJobs() as any;
      return response.data.jobs || [];
    },
    staleTime: 2 * 60 * 1000,
  });

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Loading scheduled jobs..." />;
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
        <Text style={styles.headerTitle}>Scheduled Jobs</Text>
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
                  {item.scheduledDate && (
                    <Text style={styles.scheduledDate}>
                      📅 {new Date(item.scheduledDate).toLocaleDateString()}
                    </Text>
                  )}
                </View>
                <Badge variant="primary" label="Scheduled" />
              </View>
            </Card>
          )}
        />
      ) : (
        <EmptyState
          icon="calendar-outline"
          title="No Scheduled Jobs"
          description="Jobs with confirmed dates will appear here"
          actionLabel="View Accepted Jobs"
          onAction={() => router.push('/(contractor)/jobs/accepted')}
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
  scheduledDate: {
    ...typography.sizes.sm,
    color: colors.primary.main,
    fontWeight: typography.weights.medium,
  },
});
