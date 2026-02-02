import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../src/constants/theme';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { Badge } from '../../src/components/Badge';
import { ProgressBar } from '../../src/components/ProgressBar';
import { EmptyState } from '../../src/components/EmptyState';
import { LoadingSpinner } from '../../src/components/LoadingSpinner';
import { jobsAPI } from '../../src/services/api';

type FilterType = 'all' | 'active' | 'completed';

export default function JobsListScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch all customer jobs
  const {
    data: jobs,
    isLoading: jobsLoading,
    refetch: refetchJobs
  } = useQuery({
    queryKey: ['customer-jobs'],
    queryFn: async () => {
      console.log('🔄 Fetching customer jobs...');
      const response = await jobsAPI.getJobs();
      console.log('📦 Jobs response:', response);
      return response || [];
    },
    staleTime: 0, // Always refetch on mount
    refetchOnMount: 'always', // Force refetch when component mounts
  });

  // Fetch all customer quotes
  const {
    data: quotes,
    isLoading: quotesLoading,
    refetch: refetchQuotes
  } = useQuery({
    queryKey: ['customer-quotes'],
    queryFn: async () => {
      console.log('🔄 Fetching customer quotes...');
      const response = await jobsAPI.getQuotes();
      console.log('📦 Quotes response:', response);
      return response || [];
    },
    staleTime: 0, // Always refetch on mount
    refetchOnMount: 'always', // Force refetch when component mounts
  });

  // Merge jobs and quotes into a single list
  const allJobs = React.useMemo(() => {
    console.log('🔀 Merging jobs and quotes...');
    console.log('Jobs count:', jobs?.length || 0);
    console.log('Quotes count:', quotes?.length || 0);

    const jobItems = (jobs || []).map((job: any) => ({ ...job, itemType: 'job' }));
    const quoteItems = (quotes || []).map((quote: any) => ({ ...quote, itemType: 'quote' }));

    console.log('Job items:', jobItems);
    console.log('Quote items:', quoteItems);

    // Merge and sort by created_at (most recent first)
    const merged = [...jobItems, ...quoteItems];
    merged.sort((a, b) => {
      const dateA = new Date(a.created_at || a.createdAt || 0).getTime();
      const dateB = new Date(b.created_at || b.createdAt || 0).getTime();
      return dateB - dateA; // Descending order
    });

    console.log('✅ Merged list:', merged.length, 'items');
    return merged;
  }, [jobs, quotes]);

  const isLoading = jobsLoading || quotesLoading;
  const queryClient = useQueryClient();

  // Delete job mutation
  const deleteJobMutation = useMutation({
    mutationFn: (jobId: string) => jobsAPI.deleteJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['customer-quotes'] });
      Alert.alert('Success', 'Job has been cancelled successfully.');
    },
    onError: (error: any) => {
      Alert.alert(
        'Error',
        error.response?.data?.detail || 'Failed to cancel job. Please try again.'
      );
    },
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchJobs(), refetchQuotes()]);
    setRefreshing(false);
  };

  const handleDeleteJob = (job: any) => {
    // Only allow deleting pending/draft jobs
    if (job.status !== 'pending' && job.status !== 'draft') {
      Alert.alert(
        'Cannot Delete',
        `Jobs in '${job.status}' status cannot be deleted. Only pending or draft jobs can be cancelled.`
      );
      return;
    }

    Alert.alert(
      'Cancel Job',
      'Are you sure you want to cancel this job? This action cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => deleteJobMutation.mutate(job.id),
        },
      ]
    );
  };

  const getStatusBadgeVariant = (status: string): 'success' | 'warning' | 'neutral' => {
    if (status === 'completed') return 'success';
    if (status.includes('pending')) return 'warning';
    return 'neutral';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getDaysAgo = (dateString: string) => {
    if (!dateString) return 0;
    const now = new Date();
    const past = new Date(dateString);
    const diffTime = Math.abs(now.getTime() - past.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusLabel = (status: string, itemType?: string) => {
    // Quote statuses - show as job progress
    if (itemType === 'quote') {
      const quoteLabels: Record<string, string> = {
        draft: 'Quote Ready',
        sent: 'Awaiting Accept',
        pending: 'Awaiting Accept',
        quoted: 'Quote Received',
        accepted: 'Accepted',
        rejected: 'Declined',
      };
      return quoteLabels[status.toLowerCase()] || 'Pending';
    }

    // Job statuses
    const labels: Record<string, string> = {
      pending_contractor: 'Finding Contractor',
      materials_ordered: 'Materials Ordered',
      in_progress_50: '50% Complete',
      completed: 'Completed',
    };
    return labels[status] || status;
  };

  // Filter items based on selected tab
  const allItems = allJobs || [];
  const activeItems = allItems.filter((item: any) => {
    const isActive = item.status !== 'completed' && item.status !== 'cancelled' && item.status !== 'rejected';
    console.log(`Filtering item ${item.id}: status=${item.status}, isActive=${isActive}`);
    return isActive;
  });
  const completedItems = allItems.filter((item: any) =>
    item.status === 'completed' || item.status === 'accepted'
  );

  console.log('📊 Filter counts - All:', allItems.length, 'Active:', activeItems.length, 'Completed:', completedItems.length);

  const filteredJobs =
    filter === 'active' ? activeItems :
    filter === 'completed' ? completedItems :
    allItems;

  console.log(`🎯 Current filter: ${filter}, Showing ${filteredJobs.length} jobs`);

  // Show loading spinner while fetching
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner fullScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Button
            title=""
            onPress={() => router.replace('/(customer)/dashboard')}
            variant="ghost"
            size="small"
            icon={<Ionicons name="arrow-back" size={24} color={colors.primary.main} />}
          />
          <Text style={styles.headerTitle}>My Jobs</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
            onPress={() => setFilter('all')}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === 'all' && styles.filterTabTextActive,
              ]}
            >
              All ({allItems.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, filter === 'active' && styles.filterTabActive]}
            onPress={() => setFilter('active')}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === 'active' && styles.filterTabTextActive,
              ]}
            >
              Active ({activeItems.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, filter === 'completed' && styles.filterTabActive]}
            onPress={() => setFilter('completed')}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === 'completed' && styles.filterTabTextActive,
              ]}
            >
              Completed ({completedItems.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {filteredJobs.length === 0 ? (
          <EmptyState
            icon="document-text-outline"
            title={filter === 'completed' ? 'No completed jobs' : 'No active jobs'}
            description={
              filter === 'completed'
                ? 'Completed jobs will appear here'
                : 'Post a job to get started'
            }
            actionLabel="Request a Job"
            onAction={() => router.push('/(customer)/job-request/step0-address')}
          />
        ) : (
          <View style={styles.jobsList}>
            {filteredJobs.map((job) => (
              <Card
                key={job.id}
                variant="elevated"
                padding="base"
                onPress={() => {
                  if (job.itemType === 'quote') {
                    router.push(`/(customer)/quotes/${job.id}` as any);
                  } else {
                    router.push(`/(customer)/job-detail/${job.id}`);
                  }
                }}
                style={styles.jobCard}
              >
                {/* Job Header */}
                <View style={styles.jobHeader}>
                  <View style={styles.jobTitleSection}>
                    <Text style={styles.jobTitle}>
                      {job.description || job.service_category || job.category || job.title || 'Service Request'}
                    </Text>
                    <View style={styles.jobMeta}>
                      <Badge
                        label={job.service_category || job.category || 'Service'}
                        variant="neutral"
                        size="sm"
                      />
                      <Badge
                        label={getStatusLabel(job.status, job.itemType)}
                        variant={getStatusBadgeVariant(job.status)}
                        size="sm"
                      />
                    </View>
                  </View>
                </View>

                {/* Progress - only show for jobs, not quotes */}
                {job.itemType === 'job' && job.status !== 'pending_contractor' && (
                  <ProgressBar
                    progress={typeof job.progress === 'number' ? job.progress : 0}
                    showPercentage
                    variant={job.status === 'completed' ? 'success' : 'primary'}
                    style={styles.jobProgress}
                  />
                )}

                {/* Contractor (if assigned) */}
                {job.contractor && (
                  <View style={styles.contractorSection}>
                    <Ionicons name="person" size={16} color={colors.neutral[600]} />
                    <Text style={styles.contractorName}>{job.contractor.name}</Text>
                    <View style={styles.contractorRating}>
                      <Ionicons name="star" size={14} color={colors.warning.main} />
                      <Text style={styles.ratingText}>{job.contractor.rating}</Text>
                    </View>
                  </View>
                )}

                {/* Footer */}
                <View style={styles.jobFooter}>
                  <View style={styles.jobDates}>
                    <Text style={styles.dateLabel}>Posted</Text>
                    <Text style={styles.dateValue}>
                      {formatDate(job.created_at || job.createdAt)}
                    </Text>
                    <Text style={styles.daysAgo}>
                      {getDaysAgo(job.created_at || job.createdAt)} days ago
                    </Text>
                  </View>

                  <View style={styles.costSection}>
                    <Text style={styles.costLabel}>
                      {job.itemType === 'quote' ? 'Quoted' : 'Total'}
                    </Text>
                    <Text style={styles.costAmount}>
                      {typeof job.total_amount === 'number'
                        ? `$${job.total_amount.toFixed(2)}`
                        : typeof job.totalCost === 'number'
                        ? `$${job.totalCost.toFixed(2)}`
                        : typeof job.estimated_total === 'number'
                        ? `$${job.estimated_total.toFixed(2)}`
                        : '$0.00'}
                    </Text>
                  </View>

                  {/* Delete button for jobs (not quotes) in pending/draft status */}
                  {job.itemType === 'job' && (job.status === 'pending' || job.status === 'draft') && (
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDeleteJob(job);
                      }}
                      disabled={deleteJobMutation.isPending}
                    >
                      <Ionicons name="trash-outline" size={20} color={colors.error.main} />
                    </TouchableOpacity>
                  )}

                  <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(customer)/job-request/step0-address')}
      >
        <Ionicons name="add" size={28} color={colors.background.primary} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    backgroundColor: colors.background.primary,
    paddingBottom: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  headerTitle: {
    ...typography.headings.h4,
    color: colors.neutral[900],
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  filterTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  filterTabActive: {
    borderBottomColor: colors.primary.main,
  },
  filterTabText: {
    ...typography.body.regular,
    color: colors.neutral[600],
    fontWeight: typography.weights.medium,
  },
  filterTabTextActive: {
    color: colors.primary.main,
    fontWeight: typography.weights.semibold,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  jobsList: {
    gap: spacing.md,
    paddingBottom: spacing['5xl'], // Space for FAB
  },
  jobCard: {
    marginBottom: 0,
  },
  jobHeader: {
    marginBottom: spacing.md,
  },
  jobTitleSection: {
    gap: spacing.sm,
  },
  jobTitle: {
    ...typography.headings.h5,
    color: colors.neutral[900],
  },
  jobMeta: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  jobProgress: {
    marginBottom: spacing.md,
  },
  contractorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  contractorName: {
    ...typography.caption.regular,
    color: colors.neutral[700],
    flex: 1,
  },
  contractorRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  ratingText: {
    ...typography.caption.regular,
    color: colors.neutral[700],
    fontWeight: typography.weights.medium,
  },
  jobFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  jobDates: {
    flex: 1,
  },
  dateLabel: {
    ...typography.caption.small,
    color: colors.neutral[600],
    marginBottom: spacing.xs,
  },
  dateValue: {
    ...typography.caption.regular,
    color: colors.neutral[700],
  },
  daysAgo: {
    ...typography.caption.small,
    color: colors.neutral[500],
    marginTop: spacing.xs / 2,
  },
  costSection: {
    alignItems: 'flex-end',
    marginRight: spacing.md,
  },
  costLabel: {
    ...typography.caption.small,
    color: colors.neutral[600],
    marginBottom: spacing.xs,
  },
  costAmount: {
    ...typography.headings.h5,
    color: colors.primary.main,
  },
  deleteButton: {
    padding: spacing.sm,
    marginHorizontal: spacing.xs,
  },
  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
