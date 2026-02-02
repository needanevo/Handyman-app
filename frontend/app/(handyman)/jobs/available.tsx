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
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../../src/constants/theme';
import { contractorAPI } from '../../../src/services/api';
import { LoadingSpinner } from '../../../src/components/LoadingSpinner';

export default function AvailableJobs() {
  const router = useRouter();
  const [selectedDistance, setSelectedDistance] = useState(25);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Fetch real available jobs from API with filters
  // Include filters in queryKey so changing them triggers refetch
  const { data: jobs, isLoading, refetch } = useQuery({
    queryKey: ['handyman-available-jobs', selectedDistance, selectedCategory],
    queryFn: async () => {
      const filters: any = {
        max_distance: selectedDistance,
      };
      // Only add category if not "All"
      if (selectedCategory !== 'All') {
        filters.category = selectedCategory;
      }
      const response: any = await contractorAPI.getAvailableJobs(filters);
      return response.jobs || [];
    },
    staleTime: 30 * 1000, // 30 seconds - shorter for filter changes
  });

  const categories = ['All', 'Drywall', 'Painting', 'Electrical', 'Plumbing', 'Carpentry'];
  const distances = [5, 10, 25, 50];

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Loading available jobs..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Available Jobs</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Filters */}
        <View style={styles.filtersSection}>
          <Text style={styles.filterLabel}>Distance</Text>
          <View style={styles.filterRow}>
            {distances.map((dist) => (
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

          <Text style={styles.filterLabel}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterRow}>
              {categories.map((cat) => (
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

        {/* Job Cards */}
        <View style={styles.jobsList}>
          {jobs && jobs.length > 0 ? jobs.map((job: any) => (
            <TouchableOpacity
              key={job.id}
              style={styles.jobCard}
              onPress={() => router.push(`/(handyman)/jobs/${job.id}` as any)}
            >
              <View style={styles.jobHeader}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{job.category || job.service_category}</Text>
                </View>
                <View style={[
                  styles.typeBadge,
                  job.item_type === 'quote' ? styles.quoteBadge : styles.jobBadge
                ]}>
                  <Text style={[
                    styles.typeText,
                    job.item_type === 'quote' ? styles.quoteText : styles.jobText
                  ]}>
                    {job.item_type === 'quote' ? 'Open for Bids' : 'Ready to Accept'}
                  </Text>
                </View>
              </View>

              <Text style={styles.jobTitle}>{job.title || job.description}</Text>

              <View style={styles.jobDetails}>
                <View style={styles.jobDetailItem}>
                  <Ionicons name="location" size={16} color={colors.neutral[600]} />
                  <Text style={styles.jobDetailText}>
                    {job.distance_miles || job.distance} mi • {job.customer_address?.city}, {job.customer_address?.state}
                  </Text>
                </View>
                <View style={styles.jobDetailItem}>
                  <Ionicons name="calendar" size={16} color={colors.neutral[600]} />
                  <Text style={styles.jobDetailText}>
                    Posted {Math.floor((new Date().getTime() - new Date(job.created_at).getTime()) / (1000 * 60 * 60 * 24))} days ago
                  </Text>
                </View>
              </View>

              <View style={styles.jobFooter}>
                <View>
                  <Text style={styles.estimatedPayLabel}>
                    {job.item_type === 'quote' ? 'Customer Budget' : 'Agreed Amount'}
                  </Text>
                  <Text style={styles.estimatedPayAmount}>
                    ${typeof job.price === 'number' ? job.price.toFixed(2) : job.total_amount?.toFixed(2) || '0.00'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.viewJobButton}
                  onPress={() => router.push(`/(handyman)/jobs/${job.id}` as any)}
                >
                  <Text style={styles.viewJobText}>
                    {job.item_type === 'quote' ? 'Submit Bid' : 'Accept Job'}
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFF" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )) : (
            <View style={styles.emptyState}>
              <Ionicons name="briefcase-outline" size={64} color={colors.neutral[400]} />
              <Text style={styles.emptyStateText}>No jobs available in your area</Text>
            </View>
          )}
        </View>
      </ScrollView>
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
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  headerTitle: {
    ...typography.headings.h4,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
  },
  content: {
    padding: spacing.lg,
  },
  filtersSection: {
    marginBottom: spacing.lg,
  },
  filterLabel: {
    ...typography.caption.regular,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  filterRow: {
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
  jobsList: {
    gap: spacing.base,
  },
  jobCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
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
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  urgencyText: {
    ...typography.caption.small,
    color: '#FFA500',
    fontWeight: typography.weights.medium,
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyStateText: {
    ...typography.body.regular,
    color: colors.neutral[600],
    marginTop: spacing.base,
  },
});
