/**
 * Accepted Jobs Screen
 *
 * View all jobs that have been accepted but not yet scheduled.
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

export default function AcceptedJobsScreen() {
  const router = useRouter();

  // Fetch accepted jobs
  const { data: jobs, isLoading } = useQuery({
    queryKey: ['contractor', 'jobs', 'accepted'],
    queryFn: async () => {
      // TODO: Implement actual API call
      // return await contractorAPI.getJobsByStatus('accepted');

      // Mock data for now
      return [];
    },
  });

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Loading accepted jobs..." />;
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
        <Text style={styles.headerTitle}>Accepted Jobs</Text>
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
                </View>
                <Badge variant="warning" label="Accepted" />
              </View>
            </Card>
          )}
        />
      ) : (
        <EmptyState
          icon="briefcase-outline"
          title="No Accepted Jobs"
          description="Jobs you accept will appear here until you schedule them"
          action={{
            label: 'View Available Jobs',
            onPress: () => router.push('/(contractor)/jobs/available'),
          }}
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
  },
});
