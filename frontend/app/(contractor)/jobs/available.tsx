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
import { LoadingSpinner, EmptyState } from '../../../src/components';
import { contractorAPI } from '../../../src/services/api';

export default function AvailableJobs() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch real available jobs from API
  // Using unified query key for cache synchronization with dashboard
  const { data: jobs, refetch, isLoading, error } = useQuery<Job[]>({
    queryKey: ['contractor-available-jobs'],
    queryFn: async () => {
      const response = await contractorAPI.getAvailableJobs() as any;
      // Backend returns { jobs: [], count, max_distance_miles, contractor_location }
      const jobsData = response.jobs || [];

      // Map backend job format to frontend Job type
      return jobsData.map((job: any) => ({
        id: job.id,
        customerId: job.customer_id,
        contractorId: job.contractor_id,
        quoteId: job.quote_id,
        status: job.status || 'pending',
        title: job.title || job.description || 'Untitled Job',
        description: job.description || '',
        category: job.category || job.service_category || 'Other',
        location: job.customer_address || {},
        quotedAmount: job.price || job.total_amount || job.agreed_amount || 0,
        estimatedDuration: job.estimated_hours || 0,
        distance: job.distance_miles || job.distance || 0,
        itemType: job.item_type, // 'quote' or 'job'
        photos: job.photos || [],
        customerPhotos: job.photos || [],
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

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LoadingSpinner fullScreen text="Loading available jobs..." color={colors.primary.main} />
      </SafeAreaView>
    );
  }

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
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.jobCard}
            onPress={() => router.push(`/(contractor)/jobs/${item.id}` as any)}
          >
            <View style={styles.jobHeader}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{item.category}</Text>
              </View>
              <View style={[
                styles.typeBadge,
                item.itemType === 'quote' ? styles.quoteBadge : styles.jobBadge
              ]}>
                <Text style={[
                  styles.typeText,
                  item.itemType === 'quote' ? styles.quoteText : styles.jobText
                ]}>
                  {item.itemType === 'quote' ? 'Open for Bids' : 'Ready to Accept'}
                </Text>
              </View>
            </View>

            <Text style={styles.jobTitle}>{item.title}</Text>

            <View style={styles.jobDetails}>
              <View style={styles.jobDetailItem}>
                <Ionicons name="location" size={16} color={colors.neutral[600]} />
                <Text style={styles.jobDetailText}>
                  {item.distance} mi • {item.location?.city}, {item.location?.state}
                </Text>
              </View>
              <View style={styles.jobDetailItem}>
                <Ionicons name="calendar" size={16} color={colors.neutral[600]} />
                <Text style={styles.jobDetailText}>
                  Posted {Math.floor((new Date().getTime() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days ago
                </Text>
              </View>
            </View>

            <View style={styles.jobFooter}>
              <View>
                <Text style={styles.estimatedPayLabel}>
                  {item.itemType === 'quote' ? 'Customer Budget' : 'Agreed Amount'}
                </Text>
                <Text style={styles.estimatedPayAmount}>
                  ${typeof item.quotedAmount === 'number' ? item.quotedAmount.toFixed(2) : '0.00'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.viewJobButton}
                onPress={() => router.push(`/(contractor)/jobs/${item.id}` as any)}
              >
                <Text style={styles.viewJobText}>
                  {item.itemType === 'quote' ? 'Submit Bid' : 'Accept Job'}
                </Text>
                <Ionicons name="arrow-forward" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="briefcase-outline"
            title="No Available Jobs"
            description={
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
    ...typography.headings.h2,
    color: colors.neutral[900],
    flex: 1,
    textAlign: 'center',
  },
  headerSubtitle: {
    ...typography.caption.regular,
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
    ...typography.body.regular,
    color: colors.neutral[900],
    paddingVertical: spacing.md,
  },
  listContent: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.xl,
  },
  jobCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    ...shadows.sm,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  categoryBadge: {
    backgroundColor: colors.primary.lightest,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  categoryText: {
    ...typography.caption.small,
    fontWeight: typography.weights.semibold,
    color: colors.primary.main,
  },
  typeBadge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  quoteBadge: {
    backgroundColor: '#E3F2FD',
  },
  jobBadge: {
    backgroundColor: '#E8F5E9',
  },
  typeText: {
    ...typography.caption.small,
    fontWeight: typography.weights.semibold,
  },
  quoteText: {
    color: '#1976D2',
  },
  jobText: {
    color: '#388E3C',
  },
  jobTitle: {
    ...typography.headings.h5,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.sm,
  },
  jobDetails: {
    flexDirection: 'row',
    gap: spacing.base,
    marginBottom: spacing.base,
  },
  jobDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  jobDetailText: {
    ...typography.caption.regular,
    color: colors.neutral[600],
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  estimatedPayLabel: {
    ...typography.caption.small,
    color: colors.neutral[600],
  },
  estimatedPayAmount: {
    ...typography.headings.h4,
    fontWeight: typography.weights.bold,
    color: '#FFA500',
  },
  viewJobButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: '#FFA500',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderRadius: borderRadius.md,
  },
  viewJobText: {
    ...typography.caption.regular,
    fontWeight: typography.weights.semibold,
    color: '#FFF',
  },
});
