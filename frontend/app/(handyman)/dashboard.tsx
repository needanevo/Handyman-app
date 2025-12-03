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
import { useAuth } from '../../src/contexts/AuthContext';
import { contractorAPI } from '../../src/services/api';

export default function HandymanDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();

  // Fetch real jobs using the SAME query keys as list screens
  // This ensures unified cache across dashboard and job lists
  const { data: availableJobs } = useQuery({
    queryKey: ['handyman-available-jobs'],
    queryFn: async () => {
      const response = await contractorAPI.getAvailableJobs();
      return response.jobs || [];
    },
    staleTime: 2 * 60 * 1000,
  });

  const { data: acceptedJobs } = useQuery({
    queryKey: ['handyman-accepted-jobs'],
    queryFn: async () => {
      const response = await contractorAPI.getAcceptedJobs();
      return response.jobs || [];
    },
    staleTime: 2 * 60 * 1000,
  });

  const { data: scheduledJobs } = useQuery({
    queryKey: ['handyman-scheduled-jobs'],
    queryFn: async () => {
      const response = await contractorAPI.getScheduledJobs();
      return response.jobs || [];
    },
    staleTime: 2 * 60 * 1000,
  });

  const { data: completedJobs } = useQuery({
    queryKey: ['handyman-completed-jobs'],
    queryFn: async () => {
      const response = await contractorAPI.getCompletedJobs();
      return response.jobs || [];
    },
    staleTime: 2 * 60 * 1000,
  });

  // Derive real-time stats from job data
  const growthLevel = 1;
  const jobsAvailable = availableJobs?.length || 0;
  const jobsActive = (acceptedJobs?.length || 0) + (scheduledJobs?.length || 0);
  const totalEarned = completedJobs?.reduce((sum: number, job: any) => sum + (job.payout || 0), 0) || 0;
  const pendingPayout = 0; // TODO: Calculate from accepted/scheduled jobs
  const rating = completedJobs && completedJobs.length > 0
    ? completedJobs.reduce((sum: number, job: any) => sum + (job.rating || 0), 0) / completedJobs.length
    : 4.7;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.firstName || 'Handyman'}</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push('/(handyman)/profile')}
          >
            <Ionicons name="person-circle" size={40} color="#FFA500" />
          </TouchableOpacity>
        </View>

        {/* Panel 1: GROWTH PATH (Signature Differentiator) */}
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Ionicons name="trending-up" size={24} color="#FFA500" />
            <Text style={styles.panelTitle}>Your Growth Path</Text>
          </View>

          {/* Current Phase */}
          <View style={styles.growthPhase}>
            <View style={styles.progressRing}>
              <Text style={styles.progressLevel}>{growthLevel}</Text>
            </View>
            <View style={styles.growthPhaseText}>
              <Text style={styles.growthPhaseTitle}>Handyman</Text>
              <Text style={styles.growthPhaseSubtitle}>
                You're building your business. Keep going.
              </Text>
            </View>
          </View>

          {/* Next Milestones */}
          <View style={styles.milestonesGrid}>
            <TouchableOpacity
              style={styles.milestoneCard}
              onPress={() => router.push('/(handyman)/growth/llc')}
            >
              <Ionicons name="briefcase" size={32} color="#FFA500" />
              <Text style={styles.milestoneText}>Form an LLC</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.milestoneCard}
              onPress={() => router.push('/(handyman)/growth/license')}
            >
              <Ionicons name="ribbon" size={32} color="#FFA500" />
              <Text style={styles.milestoneText}>Get Licensed</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.milestoneCard}
              onPress={() => router.push('/(handyman)/growth/insurance')}
            >
              <Ionicons name="shield-checkmark" size={32} color="#FFA500" />
              <Text style={styles.milestoneText}>Add Insurance</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.milestoneCard}
              onPress={() => router.push('/(handyman)/growth')}
            >
              <Ionicons name="cash" size={32} color="#FFA500" />
              <Text style={styles.milestoneText}>Raise Prices</Text>
            </TouchableOpacity>
          </View>

          {/* Gamified Checklist */}
          <View style={styles.checklistSection}>
            <Text style={styles.checklistTitle}>Unlock Achievements</Text>
            <View style={styles.checklistItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.checklistText}>Bank connected</Text>
            </View>
            <View style={styles.checklistItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.checklistText}>Phone verified</Text>
            </View>
            <View style={styles.checklistItem}>
              <Ionicons name="ellipse-outline" size={20} color={colors.neutral[400]} />
              <Text style={styles.checklistTextIncomplete}>
                Complete 5 jobs (2/5)
              </Text>
            </View>
            <View style={styles.checklistItem}>
              <Ionicons name="ellipse-outline" size={20} color={colors.neutral[400]} />
              <Text style={styles.checklistTextIncomplete}>
                Maintain 4.5★ rating
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.viewMoreButton}
            onPress={() => router.push('/(handyman)/growth')}
          >
            <Text style={styles.viewMoreText}>View Growth Center</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFA500" />
          </TouchableOpacity>
        </View>

        {/* Panel 2: JOBS */}
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Ionicons name="hammer" size={24} color="#FFA500" />
            <Text style={styles.panelTitle}>Jobs</Text>
          </View>

          <View style={styles.statsRow}>
            <TouchableOpacity
              style={styles.statCard}
              onPress={() => router.push('/(handyman)/jobs/available')}
            >
              <Text style={styles.statNumber}>{jobsAvailable}</Text>
              <Text style={styles.statLabel}>Available</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.statCard, styles.statCardActive]}
              onPress={() => router.push('/(handyman)/jobs/active')}
            >
              <Text style={styles.statNumber}>{jobsActive}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.statCard}
              onPress={() => router.push('/(handyman)/jobs/history')}
            >
              <Text style={styles.statNumber}>★ {rating}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/(handyman)/jobs/available')}
          >
            <Ionicons name="search" size={20} color="#FFF" />
            <Text style={styles.primaryButtonText}>Find Jobs Near You</Text>
          </TouchableOpacity>
        </View>

        {/* Panel 3: WALLET */}
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Ionicons name="wallet" size={24} color="#FFA500" />
            <Text style={styles.panelTitle}>Wallet</Text>
          </View>

          <View style={styles.earningsCard}>
            <Text style={styles.earningsLabel}>Total Earned</Text>
            <Text style={styles.earningsAmount}>${totalEarned.toLocaleString()}</Text>
            <View style={styles.earningsDetails}>
              <View style={styles.earningsDetailItem}>
                <Text style={styles.earningsDetailLabel}>Pending</Text>
                <Text style={styles.earningsDetailValue}>${pendingPayout}</Text>
              </View>
              <View style={styles.earningsDetailItem}>
                <Text style={styles.earningsDetailLabel}>This Week</Text>
                <Text style={styles.earningsDetailValue}>$325</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/(handyman)/wallet')}
          >
            <Text style={styles.secondaryButtonText}>View Payout History</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFA500" />
          </TouchableOpacity>

          <View style={styles.feeNotice}>
            <Ionicons name="information-circle" size={16} color={colors.neutral[600]} />
            <Text style={styles.feeNoticeText}>Platform fee: 15% per job</Text>
          </View>
        </View>

        {/* Panel 4: PROFILE */}
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Ionicons name="person" size={24} color="#FFA500" />
            <Text style={styles.panelTitle}>Profile</Text>
          </View>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/(handyman)/profile')}
          >
            <Ionicons name="create" size={20} color={colors.neutral[700]} />
            <Text style={styles.menuItemText}>Edit Profile & Skills</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/(handyman)/profile/settings')}
          >
            <Ionicons name="settings" size={20} color={colors.neutral[700]} />
            <Text style={styles.menuItemText}>Settings</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={logout}>
            <Ionicons name="log-out" size={20} color={colors.error.main} />
            <Text style={[styles.menuItemText, styles.logoutText]}>Log Out</Text>
          </TouchableOpacity>
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
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  greeting: {
    ...typography.sizes.base,
    color: colors.neutral[600],
  },
  userName: {
    ...typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
  },
  profileButton: {
    padding: spacing.xs,
  },
  panel: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    ...shadows.sm,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  panelTitle: {
    ...typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
  },
  growthPhase: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
    marginBottom: spacing.lg,
    padding: spacing.base,
    backgroundColor: '#FFA50010',
    borderRadius: borderRadius.lg,
  },
  progressRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFA500',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressLevel: {
    ...typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: '#FFF',
  },
  growthPhaseText: {
    flex: 1,
  },
  growthPhaseTitle: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
  },
  growthPhaseSubtitle: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
  },
  milestonesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  milestoneCard: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 2,
    borderColor: '#FFA50030',
  },
  milestoneText: {
    ...typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    textAlign: 'center',
  },
  checklistSection: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.md,
  },
  checklistTitle: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.sm,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  checklistText: {
    ...typography.sizes.sm,
    color: colors.neutral[700],
  },
  checklistTextIncomplete: {
    ...typography.sizes.sm,
    color: colors.neutral[500],
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  viewMoreText: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: '#FFA500',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    alignItems: 'center',
  },
  statCardActive: {
    backgroundColor: '#FFA50020',
    borderWidth: 2,
    borderColor: '#FFA500',
  },
  statNumber: {
    ...typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
  },
  statLabel: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: '#FFA500',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  primaryButtonText: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: '#FFF',
  },
  earningsCard: {
    backgroundColor: '#FFA50010',
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.base,
    alignItems: 'center',
  },
  earningsLabel: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    marginBottom: spacing.xs,
  },
  earningsAmount: {
    ...typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    marginBottom: spacing.base,
  },
  earningsDetails: {
    flexDirection: 'row',
    gap: spacing.xl,
  },
  earningsDetailItem: {
    alignItems: 'center',
  },
  earningsDetailLabel: {
    ...typography.sizes.xs,
    color: colors.neutral[600],
  },
  earningsDetailValue: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  secondaryButtonText: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: '#FFA500',
  },
  feeNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  feeNoticeText: {
    ...typography.sizes.xs,
    color: colors.neutral[600],
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  menuItemText: {
    ...typography.sizes.base,
    color: colors.neutral[700],
    flex: 1,
  },
  logoutText: {
    color: colors.error.main,
  },
});
