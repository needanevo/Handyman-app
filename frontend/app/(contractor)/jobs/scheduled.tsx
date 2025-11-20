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
import { contractorAPI } from '../../../src/services/api';

export default function ScheduledJobsScreen() {
  const router = useRouter();

  const { data: jobs, isLoading, error } = useQuery({
    queryKey: ['contractor', 'jobs', 'scheduled'],
    queryFn: () => contractorAPI.getScheduledJobs(),
  });

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="calendar-outline" size={80} color={colors.neutral[300]} />
      <Text style={styles.emptyTitle}>No Scheduled Jobs</Text>
      <Text style={styles.emptyText}>
        Scheduled jobs with confirmed dates will appear here.
      </Text>
    </View>
  );

  const renderJob = ({ item }: any) => (
    <TouchableOpacity
      style={styles.jobCard}
      onPress={() => router.push(`/(contractor)/jobs/${item.id}`)}
    >
      <View style={styles.jobHeader}>
        <Text style={styles.jobTitle}>{item.service_category || 'Job'}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>SCHEDULED</Text>
        </View>
      </View>
      <Text style={styles.jobDescription} numberOfLines={2}>
        {item.description || 'No description'}
      </Text>
      <View style={styles.jobFooter}>
        <View style={styles.jobMeta}>
          <Ionicons name="calendar" size={16} color={colors.primary.main} />
          <Text style={styles.jobMetaTextScheduled}>
            {item.scheduled_date ? new Date(item.scheduled_date).toLocaleDateString() : 'Date TBD'}
          </Text>
        </View>
        {item.agreed_amount && (
          <Text style={styles.jobAmount}>${item.agreed_amount}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primary.main} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scheduled Jobs</Text>
        <View style={styles.headerSpacer} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.error.main} />
          <Text style={styles.errorText}>Failed to load scheduled jobs</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  listContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  jobCard: {
    backgroundColor: 'white',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary.main,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  jobTitle: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    flex: 1,
  },
  badge: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.sm,
  },
  badgeText: {
    ...typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: 'white',
  },
  jobDescription: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    marginBottom: spacing.md,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  jobMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  jobMetaTextScheduled: {
    ...typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.primary.main,
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
