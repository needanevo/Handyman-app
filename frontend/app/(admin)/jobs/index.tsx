import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../../src/constants/theme';
import { adminAPI } from '../../../src/services/api';

type JobStatus = 'requested' | 'quoted' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';

const STATUS_COLORS: Record<JobStatus, string> = {
  requested: colors.warning.main,
  quoted: colors.info.main,
  accepted: colors.primary.main,
  in_progress: colors.success.main,
  completed: colors.success.main,
  cancelled: colors.neutral[500],
};

const STATUS_LABELS: Record<JobStatus, string> = {
  requested: 'REQUESTED',
  quoted: 'QUOTED',
  accepted: 'ACCEPTED',
  in_progress: 'IN PROGRESS',
  completed: 'COMPLETED',
  cancelled: 'CANCELLED',
};

export default function JobsManagement() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  const { data: jobs, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'jobs', statusFilter],
    queryFn: () =>
      adminAPI.getJobs(statusFilter ? { status_filter: statusFilter } : undefined),
  });

  const renderJob = ({ item }: any) => (
    <TouchableOpacity
      style={styles.jobCard}
      onPress={() => router.push(`/(admin)/jobs/${item.id}`)}
    >
      <View style={styles.jobHeader}>
        <View style={styles.jobHeaderLeft}>
          <Text style={styles.jobTitle}>
            {item.service_category || 'Service Request'}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${STATUS_COLORS[item.status as JobStatus]}20` },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: STATUS_COLORS[item.status as JobStatus] },
              ]}
            >
              {STATUS_LABELS[item.status as JobStatus] || item.status}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.jobDescription} numberOfLines={2}>
        {item.description || 'No description provided'}
      </Text>

      <View style={styles.jobMeta}>
        <View style={styles.metaItem}>
          <Ionicons name="person-outline" size={16} color={colors.neutral[500]} />
          <Text style={styles.metaText}>
            {item.customer_first_name} {item.customer_last_name}
          </Text>
        </View>
        {item.contractor_first_name && (
          <View style={styles.metaItem}>
            <Ionicons name="construct-outline" size={16} color={colors.primary.main} />
            <Text style={styles.metaText}>
              {item.contractor_first_name} {item.contractor_last_name}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.jobFooter}>
        <View style={styles.footerItem}>
          <Ionicons name="calendar-outline" size={16} color={colors.neutral[500]} />
          <Text style={styles.footerText}>
            {item.created_at
              ? new Date(item.created_at).toLocaleDateString()
              : 'No date'}
          </Text>
        </View>
        {item.estimated_total && (
          <Text style={styles.jobAmount}>${item.estimated_total}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="briefcase-outline" size={80} color={colors.neutral[300]} />
      <Text style={styles.emptyTitle}>No Jobs Found</Text>
      <Text style={styles.emptyText}>
        {statusFilter ? 'No jobs with this status' : 'No jobs have been created yet'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primary.main} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Jobs</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterButton, !statusFilter && styles.filterButtonActive]}
            onPress={() => setStatusFilter(undefined)}
          >
            <Text
              style={[
                styles.filterButtonText,
                !statusFilter && styles.filterButtonTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              statusFilter === 'requested' && styles.filterButtonActive,
            ]}
            onPress={() => setStatusFilter('requested')}
          >
            <Text
              style={[
                styles.filterButtonText,
                statusFilter === 'requested' && styles.filterButtonTextActive,
              ]}
            >
              Requested
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              statusFilter === 'quoted' && styles.filterButtonActive,
            ]}
            onPress={() => setStatusFilter('quoted')}
          >
            <Text
              style={[
                styles.filterButtonText,
                statusFilter === 'quoted' && styles.filterButtonTextActive,
              ]}
            >
              Quoted
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              statusFilter === 'accepted' && styles.filterButtonActive,
            ]}
            onPress={() => setStatusFilter('accepted')}
          >
            <Text
              style={[
                styles.filterButtonText,
                statusFilter === 'accepted' && styles.filterButtonTextActive,
              ]}
            >
              Accepted
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              statusFilter === 'in_progress' && styles.filterButtonActive,
            ]}
            onPress={() => setStatusFilter('in_progress')}
          >
            <Text
              style={[
                styles.filterButtonText,
                statusFilter === 'in_progress' && styles.filterButtonTextActive,
              ]}
            >
              In Progress
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              statusFilter === 'completed' && styles.filterButtonActive,
            ]}
            onPress={() => setStatusFilter('completed')}
          >
            <Text
              style={[
                styles.filterButtonText,
                statusFilter === 'completed' && styles.filterButtonTextActive,
              ]}
            >
              Completed
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Jobs List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Loading jobs...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.error.main} />
          <Text style={styles.errorText}>Failed to load jobs</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={jobs || []}
          renderItem={renderJob}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
        />
      )}
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
  },
  headerSpacer: {
    width: 40,
  },
  filterContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: colors.neutral[200],
    marginRight: spacing.sm,
  },
  filterButtonActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  filterButtonText: {
    ...typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.neutral[700],
  },
  filterButtonTextActive: {
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    ...typography.sizes.base,
    color: colors.neutral[600],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  errorText: {
    ...typography.sizes.base,
    color: colors.error.main,
  },
  retryButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: 'white',
  },
  listContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  jobCard: {
    backgroundColor: 'white',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  jobHeaderLeft: {
    flex: 1,
  },
  jobTitle: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    ...typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  jobDescription: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    marginBottom: spacing.md,
  },
  jobMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    ...typography.sizes.xs,
    color: colors.neutral[600],
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  footerText: {
    ...typography.sizes.xs,
    color: colors.neutral[500],
  },
  jobAmount: {
    ...typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.primary.main,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
    gap: spacing.md,
  },
  emptyTitle: {
    ...typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.neutral[700],
  },
  emptyText: {
    ...typography.sizes.base,
    color: colors.neutral[500],
    textAlign: 'center',
    maxWidth: 250,
  },
});
