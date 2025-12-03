/**
 * Completed Jobs Screen
 *
 * Shows jobs that contractor has finished.
 * Clean list view with search and filtering capabilities.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../../src/constants/theme';
import { Job } from '../../../src/types/contractor';
import { JobCard } from '../../../src/components/contractor/JobCard';
import { EmptyState } from '../../../src/components/EmptyState';
import { LoadingSpinner } from '../../../src/components/LoadingSpinner';
import { contractorAPI } from '../../../src/services/api';

export default function CompletedJobs() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch completed jobs using unified query key (matches dashboard)
  const { data: jobs, refetch, isLoading, error } = useQuery<Job[]>({
    queryKey: ['contractor-completed-jobs'],
    queryFn: async () => {
      const response = await contractorAPI.getCompletedJobs();
      const jobsData = response.jobs || [];

      return jobsData.map((job: any) => ({
        id: job.id,
        customerId: job.customer_id,
        contractorId: job.contractor_id,
        quoteId: job.quote_id,
        status: job.status || 'completed',
        title: job.description?.substring(0, 50) || 'Untitled Job',
        description: job.description || '',
        category: job.service_category || 'Other',
        location: job.customer_address || {},
        quotedAmount: job.agreed_amount || 0,
        estimatedDuration: job.estimated_hours || 0,
        distance: job.distance_miles,
        completedDate: job.completed_date,
        photos: [],
        customerPhotos: [],
        expenses: [],
        timeLogs: [],
        totalExpenses: 0,
        totalLaborHours: 0,
        depositPaid: false,
        createdAt: job.created_at,
        updatedAt: job.updated_at,
      })) as Job[];
    },
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });

  const jobsList = jobs || [];

  const filteredJobs = jobsList.filter((job) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      job.title?.toLowerCase().includes(searchLower) ||
      job.description?.toLowerCase().includes(searchLower) ||
      job.category?.toLowerCase().includes(searchLower) ||
      job.location?.city?.toLowerCase().includes(searchLower)
    );
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.primary.main} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Completed Jobs</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color={colors.neutral[400]}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search jobs..."
          placeholderTextColor={colors.neutral[400]}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Jobs List */}
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load completed jobs</Text>
          <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : filteredJobs.length === 0 ? (
        <EmptyState
          icon="checkmark-done-outline"
          title="No Completed Jobs"
          message={
            searchQuery
              ? "No jobs match your search"
              : "Jobs you complete will appear here with full history and earnings."
          }
        />
      ) : (
        <FlatList
          data={filteredJobs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <JobCard
              job={item}
              onPress={() => router.push(`/(contractor)/jobs/${item.id}`)}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.primary.main,
  },
  headerRight: {
    width: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral[300],
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    paddingVertical: spacing.sm,
    color: colors.neutral[900],
  },
  listContent: {
    padding: spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  errorText: {
    ...typography.body,
    color: colors.error.main,
    marginBottom: spacing.md,
  },
  retryButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.sm,
  },
  retryText: {
    ...typography.button,
    color: colors.background.primary,
  },
});
