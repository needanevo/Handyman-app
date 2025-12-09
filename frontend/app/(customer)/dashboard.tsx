/**
 * Customer Dashboard
 *
 * Main hub for customers to create job requests, view jobs, and manage warranties.
 * CUSTOMER-ONLY UI - no contractor/business elements.
 */

import React, { useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { colors, spacing, typography, borderRadius, shadows } from '../../src/constants/theme';
import { useAuth } from '../../src/contexts/AuthContext';
import { Card } from '../../src/components/Card';
import { jobsAPI, verificationAPI } from '../../src/services/api';

export default function CustomerDashboard() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const autoVerifyAttempted = useRef(false);

  // Auto-verification on focus (PHASE 3)
  useFocusEffect(
    useCallback(() => {
      const autoVerifyLocation = async () => {
        // Only for customers
        if (user?.role !== 'customer') return;

        // Only if auto-verify is enabled
        if (!user?.verification?.autoVerifyEnabled) return;

        // Only if not already verified
        if (user?.verification?.status === 'verified') return;

        // Prevent multiple attempts per session
        if (autoVerifyAttempted.current) return;
        autoVerifyAttempted.current = true;

        try {
          // Request permission
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') return;

          // Get location
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });

          // Verify
          await verificationAPI.verifyLocation(
            location.coords.latitude,
            location.coords.longitude
          );

          // Refresh user
          await refreshUser();
        } catch (error) {
          console.log('Auto-verification failed (silent):', error);
          // Silent fail - don't bother user
        }
      };

      autoVerifyLocation();

      // Reset flag on unmount
      return () => {
        autoVerifyAttempted.current = false;
      };
    }, [user?.role, user?.verification?.autoVerifyEnabled, user?.verification?.status])
  );

  // Fetch real jobs using the SAME query key as jobs list screen
  // This ensures unified cache across dashboard and job list
  const { data: allJobs } = useQuery({
    queryKey: ['customer-jobs'],
    queryFn: async () => {
      const response = await jobsAPI.getJobs();
      return response || [];
    },
    staleTime: 2 * 60 * 1000,
  });

  // Derive counts from real job data
  const jobs = allJobs || [];
  const activeJobsCount = jobs.filter((job: any) =>
    job.status !== 'completed' && job.status !== 'cancelled'
  ).length;
  const completedJobsCount = jobs.filter((job: any) => job.status === 'completed').length;
  const warrantiesCount = 0; // TODO: Implement warranty API
  const hasAddresses = user?.addresses && user.addresses.length > 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.name}>{user?.firstName || 'Customer'}</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push('/(customer)/profile')}
          >
            <Ionicons name="person-circle" size={40} color={colors.primary.main} />
          </TouchableOpacity>
        </View>

        {/* Address Setup Reminder */}
        {!hasAddresses && (
          <View style={styles.reminderCard}>
            <Ionicons name="location-outline" size={24} color={colors.warning.main} />
            <View style={styles.reminderContent}>
              <Text style={styles.reminderTitle}>Add Your Address</Text>
              <Text style={styles.reminderText}>
                You'll need an address to request services
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(customer)/profile')}>
              <Ionicons name="chevron-forward" size={24} color={colors.primary.main} />
            </TouchableOpacity>
          </View>
        )}

        {/* Primary Action */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.primaryActionCard}
            onPress={() => router.push('/(customer)/job-request/step0-address')}
            activeOpacity={0.7}
          >
            <View style={styles.primaryActionIcon}>
              <Ionicons name="add-circle" size={48} color={colors.primary.main} />
            </View>
            <Text style={styles.primaryActionTitle}>Create Job Request</Text>
            <Text style={styles.primaryActionSubtitle}>
              Get matched with qualified contractors
            </Text>
          </TouchableOpacity>
        </View>

        {/* Job Status Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Jobs</Text>
          <View style={styles.jobCardsGrid}>
            {/* Active Jobs */}
            <TouchableOpacity
              style={[styles.jobCard, styles.jobCardPrimary]}
              onPress={() => router.push('/(customer)/jobs')}
              activeOpacity={0.7}
            >
              <View style={styles.jobCardHeader}>
                <Text style={styles.jobCardIcon}>🔨</Text>
                {activeJobsCount > 0 && (
                  <View style={styles.jobCardBadge}>
                    <Text style={styles.jobCardBadgeText}>{activeJobsCount}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.jobCardTitle}>Active</Text>
              <Text style={styles.jobCardSubtitle}>
                {activeJobsCount > 0 ? `${activeJobsCount} in progress` : 'No active jobs'}
              </Text>
            </TouchableOpacity>

            {/* Completed Jobs */}
            <TouchableOpacity
              style={[styles.jobCard, styles.jobCardSuccess]}
              onPress={() => router.push('/(customer)/jobs')}
              activeOpacity={0.7}
            >
              <View style={styles.jobCardHeader}>
                <Text style={styles.jobCardIcon}>✅</Text>
              </View>
              <Text style={styles.jobCardTitle}>Completed</Text>
              <Text style={styles.jobCardSubtitle}>
                {completedJobsCount > 0 ? `${completedJobsCount} jobs done` : 'None yet'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Warranties Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Warranties</Text>
            <TouchableOpacity onPress={() => router.push('/(customer)/warranties')}>
              <Text style={styles.sectionLink}>View All</Text>
            </TouchableOpacity>
          </View>

          {warrantiesCount > 0 ? (
            <Card style={styles.warrantyCard}>
              <View style={styles.warrantyHeader}>
                <Ionicons name="shield-checkmark" size={24} color={colors.success.main} />
                <Text style={styles.warrantyCount}>{warrantiesCount} Active</Text>
              </View>
              <Text style={styles.warrantyText}>
                Your completed jobs are protected
              </Text>
            </Card>
          ) : (
            <Card style={styles.emptyCard}>
              <Ionicons name="shield-outline" size={48} color={colors.neutral[400]} />
              <Text style={styles.emptyText}>No warranties yet</Text>
              <Text style={styles.emptySubtext}>
                Complete jobs to earn warranty protection
              </Text>
            </Card>
          )}
        </View>

        {/* Quick Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Links</Text>
          <View style={styles.quickLinksGrid}>
            <TouchableOpacity
              style={styles.quickLinkCard}
              onPress={() => router.push('/(customer)/profile')}
            >
              <Ionicons name="person-outline" size={32} color={colors.primary.main} />
              <Text style={styles.quickLinkText}>Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickLinkCard}
              onPress={() => router.push('/(customer)/jobs')}
            >
              <Ionicons name="list-outline" size={32} color={colors.primary.main} />
              <Text style={styles.quickLinkText}>All Jobs</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickLinkCard}
              onPress={() => router.push('/(customer)/warranties')}
            >
              <Ionicons name="shield-checkmark-outline" size={32} color={colors.primary.main} />
              <Text style={styles.quickLinkText}>Warranties</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickLinkCard}
              onPress={() => router.push('/(customer)/settings')}
            >
              <Ionicons name="settings-outline" size={32} color={colors.primary.main} />
              <Text style={styles.quickLinkText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Empty State Message */}
        {activeJobsCount === 0 && completedJobsCount === 0 && (
          <View style={styles.section}>
            <Card style={styles.emptyStateCard}>
              <Ionicons name="construct-outline" size={64} color={colors.neutral[400]} />
              <Text style={styles.emptyStateTitle}>No jobs yet</Text>
              <Text style={styles.emptyStateText}>
                Create your first job request to get started with finding qualified contractors for your project
              </Text>
            </Card>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing['4xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.lg,
    backgroundColor: colors.background.primary,
  },
  greeting: {
    ...typography.sizes.base,
    color: colors.neutral[600],
  },
  name: {
    ...typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
  },
  profileButton: {
    padding: spacing.xs,
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning.lightest,
    marginHorizontal: spacing.base,
    marginTop: spacing.base,
    padding: spacing.base,
    borderRadius: borderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning.main,
  },
  reminderContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  reminderTitle: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  reminderText: {
    ...typography.sizes.sm,
    color: colors.neutral[700],
  },
  section: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.base,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
  sectionLink: {
    ...typography.sizes.sm,
    color: colors.primary.main,
    fontWeight: typography.weights.semibold,
  },
  primaryActionCard: {
    backgroundColor: colors.background.primary,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    ...shadows.md,
    borderWidth: 2,
    borderColor: colors.primary.main,
  },
  primaryActionIcon: {
    marginBottom: spacing.base,
  },
  primaryActionTitle: {
    ...typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  primaryActionSubtitle: {
    ...typography.sizes.base,
    color: colors.neutral[600],
    textAlign: 'center',
  },
  jobCardsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  jobCard: {
    flex: 1,
    backgroundColor: colors.background.primary,
    padding: spacing.base,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  jobCardPrimary: {
    backgroundColor: colors.primary.lightest,
  },
  jobCardSuccess: {
    backgroundColor: colors.success.lightest,
  },
  jobCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  jobCardIcon: {
    fontSize: 32,
  },
  jobCardBadge: {
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.full,
    minWidth: 24,
    height: 24,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  jobCardBadgeText: {
    ...typography.sizes.xs,
    color: colors.background.primary,
    fontWeight: typography.weights.bold,
  },
  jobCardTitle: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  jobCardSubtitle: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
  },
  warrantyCard: {
    padding: spacing.lg,
  },
  warrantyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  warrantyCount: {
    ...typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
  },
  warrantyText: {
    ...typography.sizes.base,
    color: colors.neutral[600],
  },
  emptyCard: {
    padding: spacing['2xl'],
    alignItems: 'center',
  },
  emptyText: {
    ...typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.neutral[700],
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    textAlign: 'center',
  },
  quickLinksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  quickLinkCard: {
    width: '48%',
    backgroundColor: colors.background.primary,
    padding: spacing.base,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    ...shadows.sm,
  },
  quickLinkText: {
    ...typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[700],
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  emptyStateCard: {
    padding: spacing['2xl'],
    alignItems: 'center',
  },
  emptyStateTitle: {
    ...typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    marginTop: spacing.base,
    marginBottom: spacing.sm,
  },
  emptyStateText: {
    ...typography.sizes.base,
    color: colors.neutral[600],
    textAlign: 'center',
    lineHeight: 22,
  },
});