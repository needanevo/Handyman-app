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
import { colors, spacing, typography, borderRadius, shadows } from '../../../src/constants/theme';

export default function AvailableJobs() {
  const router = useRouter();
  const [selectedDistance, setSelectedDistance] = useState(25);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // TODO: Fetch from backend GET /api/handyman/jobs/available
  const mockJobs = [
    {
      id: '1',
      category: 'Drywall',
      title: 'Repair ceiling drywall',
      distance: 3.2,
      estimatedPay: 150,
      urgency: 'Today',
      customerRating: 4.8,
    },
    {
      id: '2',
      category: 'Painting',
      title: 'Paint bedroom walls',
      distance: 7.5,
      estimatedPay: 280,
      urgency: 'This week',
      customerRating: 4.9,
    },
  ];

  const categories = ['All', 'Drywall', 'Painting', 'Electrical', 'Plumbing', 'Carpentry'];
  const distances = [5, 10, 25, 50];

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
          {mockJobs.map((job) => (
            <TouchableOpacity key={job.id} style={styles.jobCard}>
              <View style={styles.jobHeader}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{job.category}</Text>
                </View>
                <View style={styles.urgencyBadge}>
                  <Ionicons name="time" size={14} color="#FFA500" />
                  <Text style={styles.urgencyText}>{job.urgency}</Text>
                </View>
              </View>

              <Text style={styles.jobTitle}>{job.title}</Text>

              <View style={styles.jobDetails}>
                <View style={styles.jobDetailItem}>
                  <Ionicons name="location" size={16} color={colors.neutral[600]} />
                  <Text style={styles.jobDetailText}>{job.distance} mi away</Text>
                </View>
                <View style={styles.jobDetailItem}>
                  <Ionicons name="star" size={16} color="#FFA500" />
                  <Text style={styles.jobDetailText}>{job.customerRating} customer</Text>
                </View>
              </View>

              <View style={styles.jobFooter}>
                <View>
                  <Text style={styles.estimatedPayLabel}>Estimated Pay</Text>
                  <Text style={styles.estimatedPayAmount}>${job.estimatedPay}</Text>
                </View>
                <TouchableOpacity style={styles.viewJobButton}>
                  <Text style={styles.viewJobText}>View Details</Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFF" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
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
