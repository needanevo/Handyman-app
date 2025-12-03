/**
 * Customer Warranties Screen
 *
 * Displays platform warranty information and active warranties for completed jobs.
 * CUSTOMER-ONLY UI - no contractor/business elements.
 */

import React from 'react';
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
import { colors, spacing, typography, borderRadius, shadows } from '../../src/constants/theme';
import { Card } from '../../src/components/Card';
import { EmptyState } from '../../src/components/EmptyState';
import { LoadingSpinner } from '../../src/components/LoadingSpinner';
import { jobsAPI } from '../../src/services/api';

export default function CustomerWarrantiesScreen() {
  const router = useRouter();

  // Fetch completed jobs (which have warranties)
  const { data: allJobs, isLoading } = useQuery({
    queryKey: ['customer-jobs'],
    queryFn: async () => {
      const response = await jobsAPI.getJobs();
      return response || [];
    },
    staleTime: 2 * 60 * 1000,
  });

  const completedJobs = (allJobs || []).filter((job: any) => job.status === 'completed');

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner fullScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Warranties</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Platform Warranty Info */}
        <Card style={styles.warrantyInfoCard}>
          <View style={styles.warrantyHeader}>
            <View style={styles.iconCircle}>
              <Ionicons name="shield-checkmark" size={32} color={colors.success.main} />
            </View>
            <Text style={styles.warrantyTitle}>Platform Warranty</Text>
          </View>

          <Text style={styles.warrantyDescription}>
            All jobs completed through our platform are protected by our standard warranty coverage.
          </Text>

          <View style={styles.warrantyDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success.main} />
              <Text style={styles.detailText}>
                <Text style={styles.detailBold}>6-month minimum coverage</Text> on all labor and materials
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success.main} />
              <Text style={styles.detailText}>
                Contractors agree to warranty terms when accepting jobs
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success.main} />
              <Text style={styles.detailText}>
                Covers defects in workmanship and materials
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success.main} />
              <Text style={styles.detailText}>
                Easy warranty claim process through the app
              </Text>
            </View>
          </View>
        </Card>

        {/* Active Warranties */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Active Warranties</Text>

          {completedJobs.length === 0 ? (
            <EmptyState
              icon="shield-outline"
              title="No warranties yet"
              description="Complete jobs to earn warranty protection on your projects"
            />
          ) : (
            <View style={styles.warrantyList}>
              {completedJobs.map((job) => (
                <Card
                  key={job.id}
                  variant="elevated"
                  padding="base"
                  style={styles.warrantyCard}
                >
                  <View style={styles.warrantyCardHeader}>
                    <View style={styles.warrantyIcon}>
                      <Ionicons name="shield-checkmark" size={20} color={colors.success.main} />
                    </View>
                    <View style={styles.warrantyCardInfo}>
                      <Text style={styles.warrantyCardTitle} numberOfLines={1}>
                        {job.title}
                      </Text>
                      <Text style={styles.warrantyCardSubtitle}>
                        Completed: {job.completedAt || 'Recently'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.warrantyCardFooter}>
                    <View style={styles.coverageInfo}>
                      <Text style={styles.coverageLabel}>Coverage Period</Text>
                      <Text style={styles.coverageValue}>6 months</Text>
                    </View>

                    <View style={styles.statusBadge}>
                      <View style={styles.statusDot} />
                      <Text style={styles.statusText}>Active</Text>
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          )}
        </View>

        {/* How to File a Claim */}
        <Card style={styles.claimInfoCard}>
          <Text style={styles.claimTitle}>How to File a Warranty Claim</Text>
          <Text style={styles.claimDescription}>
            If you experience any issues with completed work:
          </Text>

          <View style={styles.claimSteps}>
            <View style={styles.stepRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepText}>
                Go to the completed job details
              </Text>
            </View>

            <View style={styles.stepRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepText}>
                Tap "Request Warranty Service"
              </Text>
            </View>

            <View style={styles.stepRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepText}>
                Describe the issue with photos
              </Text>
            </View>

            <View style={styles.stepRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <Text style={styles.stepText}>
                We'll coordinate with the contractor to resolve it
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>
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
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing['4xl'],
  },
  warrantyInfoCard: {
    marginHorizontal: spacing.base,
    marginTop: spacing.base,
    padding: spacing.lg,
    backgroundColor: colors.success.lightest,
  },
  warrantyHeader: {
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  warrantyTitle: {
    ...typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
  },
  warrantyDescription: {
    ...typography.sizes.base,
    color: colors.neutral[700],
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  warrantyDetails: {
    gap: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  detailText: {
    ...typography.sizes.sm,
    color: colors.neutral[700],
    flex: 1,
    lineHeight: 20,
  },
  detailBold: {
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
  },
  section: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.base,
  },
  sectionTitle: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
  warrantyList: {
    gap: spacing.md,
  },
  warrantyCard: {
    marginBottom: 0,
  },
  warrantyCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  warrantyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.success.lightest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  warrantyCardInfo: {
    flex: 1,
  },
  warrantyCardTitle: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  warrantyCardSubtitle: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
  },
  warrantyCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  coverageInfo: {
    flex: 1,
  },
  coverageLabel: {
    ...typography.sizes.xs,
    color: colors.neutral[600],
    marginBottom: spacing.xs,
  },
  coverageValue: {
    ...typography.sizes.base,
    color: colors.neutral[900],
    fontWeight: typography.weights.semibold,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.success.lightest,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success.main,
  },
  statusText: {
    ...typography.sizes.xs,
    color: colors.success.main,
    fontWeight: typography.weights.semibold,
  },
  claimInfoCard: {
    marginHorizontal: spacing.base,
    marginTop: spacing.xl,
    padding: spacing.lg,
  },
  claimTitle: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    marginBottom: spacing.sm,
  },
  claimDescription: {
    ...typography.sizes.base,
    color: colors.neutral[700],
    marginBottom: spacing.lg,
  },
  claimSteps: {
    gap: spacing.md,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    ...typography.sizes.sm,
    color: colors.background.primary,
    fontWeight: typography.weights.bold,
  },
  stepText: {
    ...typography.sizes.sm,
    color: colors.neutral[700],
    flex: 1,
    paddingTop: 4,
  },
});
