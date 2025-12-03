/**
 * Available Jobs Screen
 *
 * Shows jobs that contractors can accept.
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
import { contractorAPI } from '../../../src/services/api';

export default function AvailableJobs() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch real available jobs from API using unified query key
  const { data: jobs, refetch, isLoading, error } = useQuery<Job[]>({
    queryKey: ['contractor-available-jobs'],
    queryFn: async () => {
      const response = await contractorAPI.getAvailableJobs();
      // Backend returns { jobs: [], count, max_distance_miles, contractor_location }
      const jobsData = response.jobs || [];

      // Map backend job format to frontend Job type
      return jobsData.map((job: any) => ({
        id: job.id,
        customerId: job.customer_id,
        contractorId: job.contractor_id,
        quoteId: job.quote_id,
        status: job.status || 'pending',
        title: job.description?.substring(0, 50) || 'Untitled Job',
        description: job.description || '',
        category: job.service_category || 'Other',
        location: job.customer_address || {},
        quotedAmount: job.agreed_amount || 0,
        estimatedDuration: job.estimated_hours || 0,
        distance: job.distance_miles,
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
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });

  // Fallback to empty array if no data
  const jobsList = jobs || [];

  // Filter by search query
  const filteredJobs = jobsList.filter((job) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      job.title?.toLowerCase().includes(searchLower) ||
      job.description?.toLowerCase().includes(searchLower) ||
      job.category?.toLowerCase().includes(searchLower) ||
      job.location?.city?.toLowerCase().includes(searchLower)
    );
  });

  // Remove the old mock data array
  /*
  const oldMockData = [
        {
          id: '1',
          customerId: 'c1',
          customer: {
            id: 'c1',
            firstName: 'John',
            lastName: 'Smith',
            email: 'john@example.com',
            phone: '(555) 123-4567',
          },
          status: 'AVAILABLE' as const,
          title: 'Fix Leaking Pipe',
          description: 'Kitchen pipe is leaking under the sink.',
          category: 'Plumbing',
          location: {
            street: '456 Elm St',
            city: 'San Francisco',
            state: 'CA',
            zipCode: '94103',
          },
          quotedAmount: 150,
          estimatedDuration: 1.5,
          photos: [],
          customerPhotos: [],
          expenses: [],
          timeLogs: [],
          totalExpenses: 0,
          totalLaborHours: 0,
          depositPaid: false,
          createdAt: '2025-11-10T10:00:00',
          updatedAt: '2025-11-10T10:00:00',
        },
        {
          id: '2',
          customerId: 'c2',
          customer: {
            id: 'c2',
            firstName: 'Emily',
            lastName: 'Davis',
            email: 'emily@example.com',
            phone: '(555) 987-6543',
          },
          status: 'AVAILABLE' as const,
          title: 'Install Ceiling Fan',
          description: 'Need ceiling fan installed in master bedroom. Fan already purchased.',
          category: 'Electrical',
          location: {
            street: '789 Oak Ave',
            city: 'Oakland',
            state: 'CA',
            zipCode: '94607',
          },
          quotedAmount: 200,
          estimatedDuration: 2,
          photos: [],
          customerPhotos: [],
          expenses: [],
          timeLogs: [],
          totalExpenses: 0,
          totalLaborHours: 0,
          depositPaid: false,
          createdAt: '2025-11-11T14:30:00',
          updatedAt: '2025-11-11T14:30:00',
        },
      ];
  */

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.neutral[900]} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Available Jobs</Text>
          <View style={styles.backButton} />
        </View>
        <Text style={styles.headerSubtitle}>
          {filteredJobs?.length || 0} jobs available
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search jobs..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.neutral[400]}
        />
      </View>

      {/* Jobs List */}
      <FlatList
        data={filteredJobs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <JobCard job={item} showPhotoBadge={false} />}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            title="No Available Jobs"
            message={
              searchQuery
                ? 'No jobs match your search'
                : 'Check back later for new job opportunities'
            }
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.lg,
    backgroundColor: colors.background.primary,
    ...shadows.sm,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    flex: 1,
    textAlign: 'center',
  },
  headerSubtitle: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    marginTop: spacing.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    marginHorizontal: spacing.base,
    marginTop: spacing.base,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.base,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral[300],
  },
  searchIcon: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.sizes.base,
    color: colors.neutral[900],
    paddingVertical: spacing.md,
  },
  listContent: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.xl,
  },
});
