/**
 * All Jobs Discovery Feed
 *
 * Read-only feed showing jobs in the customer's geofence.
 * Non-interactive cards for browsing available jobs.
 * CUSTOMER-ONLY UI - no contractor/business elements.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../src/constants/theme';
import { Card } from '../../src/components/Card';
import { Badge } from '../../src/components/Badge';
import { EmptyState } from '../../src/components/EmptyState';
import { LoadingSpinner } from '../../src/components/LoadingSpinner';
import { jobsAPI } from '../../src/services/api';

export default function AllJobsScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch jobs using the existing API
  // TODO: When geofence API is available, use that instead
  const {
    data: allJobs,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['customer-jobs'],
    queryFn: async () => {
      const response = await jobsAPI.getJobs();
      return response || [];
    },
    staleTime: 2 * 60 * 1000,
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const jobs = allJobs || [];

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner fullScreen />
      </SafeAreaView>
    );
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
        <Text style={styles.headerTitle}>All Jobs</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {jobs.length === 0 ? (
          <EmptyState
            icon="search-outline"
            title="No jobs available"
            description="Jobs in your area will appear here when they become available"
          />
        ) : (
          <View style={styles.jobsList}>
            <View style={styles.infoCard}>
              <Ionicons name="information-circle-outline" size={20} color={colors.primary.main} />
              <Text style={styles.infoText}>
                Browse jobs in your area. Tap cards to view details.
              </Text>
            </View>

            {jobs.map((job) => (
              <Card
                key={job.id}
                variant="elevated"
                padding="base"
                style={styles.jobCard}
              >
                {/* Job Photo/Icon */}
                <View style={styles.jobImagePlaceholder}>
                  <Ionicons name="construct" size={32} color={colors.neutral[400]} />
                </View>

                {/* Job Info */}
                <View style={styles.jobContent}>
                  <Text style={styles.jobTitle} numberOfLines={2}>
                    {job.title}
                  </Text>

                  <View style={styles.jobMeta}>
                    <Badge label={job.category} variant="neutral" size="sm" />
                  </View>

                  {/* Location hint */}
                  <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={14} color={colors.neutral[600]} />
                    <Text style={styles.locationText}>
                      {job.address?.city || 'Nearby'}
                    </Text>
                  </View>

                  {/* Footer */}
                  <View style={styles.jobFooter}>
                    <View>
                      <Text style={styles.costLabel}>Budget</Text>
                      <Text style={styles.costAmount}>
                        ${job.totalCost?.toFixed(2) || 'TBD'}
                      </Text>
                    </View>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusText}>View Only</Text>
                    </View>
                  </View>
                </View>
              </Card>
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
    backgroundColor: colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
  },
  placeholder: {
    width: 40,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.base,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary.lightest,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.base,
  },
  infoText: {
    ...typography.sizes.sm,
    color: colors.neutral[700],
    flex: 1,
  },
  jobsList: {
    gap: spacing.md,
  },
  jobCard: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: 0,
  },
  jobImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  jobContent: {
    flex: 1,
    gap: spacing.sm,
  },
  jobTitle: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
  },
  jobMeta: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  locationText: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
  },
  jobFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  costLabel: {
    ...typography.sizes.xs,
    color: colors.neutral[600],
    marginBottom: spacing.xs,
  },
  costAmount: {
    ...typography.sizes.base,
    color: colors.primary.main,
    fontWeight: typography.weights.bold,
  },
  statusBadge: {
    backgroundColor: colors.neutral[100],
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
  },
  statusText: {
    ...typography.sizes.xs,
    color: colors.neutral[600],
    fontWeight: typography.weights.medium,
  },
});
