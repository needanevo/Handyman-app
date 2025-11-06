import React, { useState } from 'react';
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
import { colors, spacing, typography, borderRadius } from '../../src/constants/theme';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { Badge } from '../../src/components/Badge';
import { ProgressBar } from '../../src/components/ProgressBar';
import { EmptyState } from '../../src/components/EmptyState';

// Mock data
const mockJobs = [
  {
    id: '1',
    title: 'Fix hole in bedroom wall',
    category: 'drywall',
    status: 'in_progress_50',
    progress: 50,
    contractor: { name: 'Mike Johnson', rating: 4.8 },
    totalCost: 300,
    createdAt: '2025-11-02',
  },
  {
    id: '2',
    title: 'Install ceiling fan',
    category: 'electrical',
    status: 'pending_contractor',
    progress: 10,
    totalCost: 250,
    createdAt: '2025-11-05',
  },
  {
    id: '3',
    title: 'Fix leaky faucet',
    category: 'plumbing',
    status: 'completed',
    progress: 100,
    contractor: { name: 'Sarah Williams', rating: 4.9 },
    totalCost: 180,
    createdAt: '2025-10-28',
    completedAt: '2025-10-30',
  },
];

type FilterType = 'all' | 'active' | 'completed';

export default function JobsListScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterType>('all');

  const getStatusBadgeVariant = (status: string): 'success' | 'warning' | 'neutral' => {
    if (status === 'completed') return 'success';
    if (status.includes('pending')) return 'warning';
    return 'neutral';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending_contractor: 'Finding Contractor',
      materials_ordered: 'Materials Ordered',
      in_progress_50: '50% Complete',
      completed: 'Completed',
    };
    return labels[status] || status;
  };

  const filteredJobs = mockJobs.filter((job) => {
    if (filter === 'active') return job.status !== 'completed';
    if (filter === 'completed') return job.status === 'completed';
    return true;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Button
            title=""
            onPress={() => router.back()}
            variant="ghost"
            size="small"
            icon={<Ionicons name="arrow-back" size={24} color={colors.primary.main} />}
          />
          <Text style={styles.headerTitle}>All Jobs</Text>
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
              All ({mockJobs.length})
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
              Active ({mockJobs.filter((j) => j.status !== 'completed').length})
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
              Completed ({mockJobs.filter((j) => j.status === 'completed').length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
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
            onAction={() => router.push('/(customer)/job-request/step1-photos')}
          />
        ) : (
          <View style={styles.jobsList}>
            {filteredJobs.map((job) => (
              <Card
                key={job.id}
                variant="elevated"
                padding="base"
                onPress={() => router.push(`/(customer)/job-detail/${job.id}`)}
                style={styles.jobCard}
              >
                {/* Job Header */}
                <View style={styles.jobHeader}>
                  <View style={styles.jobTitleSection}>
                    <Text style={styles.jobTitle}>{job.title}</Text>
                    <View style={styles.jobMeta}>
                      <Badge label={job.category} variant="neutral" size="sm" />
                      <Badge
                        label={getStatusLabel(job.status)}
                        variant={getStatusBadgeVariant(job.status)}
                        size="sm"
                      />
                    </View>
                  </View>
                </View>

                {/* Progress */}
                {job.status !== 'pending_contractor' && (
                  <ProgressBar
                    progress={job.progress}
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
                    <Text style={styles.dateLabel}>
                      {job.status === 'completed' ? 'Completed' : 'Posted'}
                    </Text>
                    <Text style={styles.dateValue}>
                      {job.status === 'completed' ? job.completedAt : job.createdAt}
                    </Text>
                  </View>

                  <View style={styles.costSection}>
                    <Text style={styles.costLabel}>Total</Text>
                    <Text style={styles.costAmount}>${job.totalCost.toFixed(2)}</Text>
                  </View>

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
        onPress={() => router.push('/(customer)/job-request/step1-photos')}
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
    ...typography.sizes.xl,
    fontWeight: typography.weights.bold,
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
    ...typography.sizes.base,
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
    ...typography.sizes.lg,
    fontWeight: typography.weights.semibold,
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
    ...typography.sizes.sm,
    color: colors.neutral[700],
    flex: 1,
  },
  contractorRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  ratingText: {
    ...typography.sizes.sm,
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
    ...typography.sizes.xs,
    color: colors.neutral[600],
    marginBottom: spacing.xs,
  },
  dateValue: {
    ...typography.sizes.sm,
    color: colors.neutral[700],
  },
  costSection: {
    alignItems: 'flex-end',
    marginRight: spacing.md,
  },
  costLabel: {
    ...typography.sizes.xs,
    color: colors.neutral[600],
    marginBottom: spacing.xs,
  },
  costAmount: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primary.main,
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
