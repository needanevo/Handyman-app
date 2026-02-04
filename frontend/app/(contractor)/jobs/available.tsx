/**
 * Available Jobs Screen - Contractor Version
 * 
 * Shows jobs that contractors can accept.
 * Unified layout with handyman version - includes distance/category filters.
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
  ScrollView,
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

const CATEGORIES = ['All', 'Drywall', 'Painting', 'Electrical', 'Plumbing', 'Carpentry', 'HVAC', 'General'];
const DISTANCES = [5, 10, 25, 50, 100];

export default function AvailableJobs() {
  const router = useRouter();
  const [selectedDistance, setSelectedDistance] = useState(50);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch available jobs with filters
  const { data: jobs, isLoading, error, refetch } = useQuery<Job[]>({
    queryKey: ['contractor-available-jobs', selectedDistance, selectedCategory],
    queryFn: async () => {
      const filters: any = {
        max_distance: selectedDistance,
      };
      if (selectedCategory !== 'All') {
        filters.category = selectedCategory;
      }
      const response = await contractorAPI.getAvailableJobs(filters) as any;
      return response.jobs || [];
    },
    staleTime: 30 * 1000,
    retry: 2,
  });

  // Filter by search query
  const filteredJobs = (jobs || []).filter((job) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      job.title?.toLowerCase().includes(search) ||
      job.description?.toLowerCase().includes(search) ||
      job.category?.toLowerCase().includes(search) ||
      job.location?.city?.toLowerCase().includes(search)
    );
  });

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

      {/* Filters */}
      <View style={styles.filtersSection}>
        {/* Distance Filter */}
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Distance</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipRow}>
              {DISTANCES.map((dist) => (
                <TouchableOpacity
                  key={dist}
                  style={[
                    styles.filterChip,
                    selectedDistance === dist && styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedDistance(dist)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedDistance === dist && styles.filterChipTextActive,
                    ]}
                  >
                    {dist} mi
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Category Filter */}
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipRow}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.filterChip,
                    selectedCategory === cat && styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedCategory === cat && styles.filterChipTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={colors.neutral[400]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search jobs..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.neutral[400]}
          />
        </View>
      </View>

      {/* Jobs List */}
      <FlatList
        data={filteredJobs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.jobCard}
            onPress={() => router.push(`/(contractor)/jobs/available/${item.id}` as any)}
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
                onPress={() => router.push(`/(contractor)/jobs/available/${item.id}` as any)}
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
                : `No jobs within ${selectedDistance} miles for ${selectedCategory === 'All' ? 'any category' : selectedCategory}`
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
  filtersSection: {
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  filterRow: {
    marginTop: spacing.md,
  },
  filterLabel: {
    ...typography.caption.regular,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.base,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.neutral[300],
  },
  filterChipActive: {
    backgroundColor: '#FFA500',
    borderColor: '#FFA500',
  },
  filterChipText: {
    ...typography.caption.regular,
    color: colors.neutral[700],
  },
  filterChipTextActive: {
    color: '#FFF',
    fontWeight: typography.weights.semibold,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    marginTop: spacing.md,
    paddingHorizontal: spacing.base,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral[300],
  },
  searchInput: {
    flex: 1,
    ...typography.body.regular,
    color: colors.neutral[900],
    paddingVertical: spacing.md,
    paddingLeft: spacing.sm,
  },
  listContent: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.xl,
  },
  jobCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginTop: spacing.base,
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
