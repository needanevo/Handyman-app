import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../src/constants/theme';
import { Button } from '../../src/components/Button';
import { api } from '../../src/services/api';

interface PlatformStats {
  total_users: number;
  total_customers: number;
  total_contractors: number;
  total_jobs: number;
  active_jobs: number;
  completed_jobs: number;
  total_revenue: number;
  pending_warranties: number;
  pending_change_orders: number;
}

export default function AdminStatsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PlatformStats | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      // Mock data for UI demonstration
      setStats({
        total_users: 0,
        total_customers: 0,
        total_contractors: 0,
        total_jobs: 0,
        active_jobs: 0,
        completed_jobs: 0,
        total_revenue: 0,
        pending_warranties: 0,
        pending_change_orders: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Button
            title=""
            onPress={() => router.back()}
            variant="ghost"
            size="small"
            icon={<Ionicons name="arrow-back" size={24} color={colors.primary.main} />}
          />
          <Text style={styles.title}>Platform Statistics</Text>
          <Text style={styles.subtitle}>Overview of key metrics and performance</Text>
        </View>

        {/* User Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="people" size={20} color={colors.neutral[700]} /> Users
          </Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { borderLeftColor: colors.primary.main }]}>
              <Text style={[styles.statValue, { color: colors.primary.main }]}>
                {stats?.total_users || 0}
              </Text>
              <Text style={styles.statLabel}>Total Users</Text>
            </View>
            <View style={[styles.statCard, { borderLeftColor: colors.success.main }]}>
              <Text style={[styles.statValue, { color: colors.success.main }]}>
                {stats?.total_customers || 0}
              </Text>
              <Text style={styles.statLabel}>Customers</Text>
            </View>
            <View style={[styles.statCard, { borderLeftColor: colors.info.main }]}>
              <Text style={[styles.statValue, { color: colors.info.main }]}>
                {stats?.total_contractors || 0}
              </Text>
              <Text style={styles.statLabel}>Contractors</Text>
            </View>
          </View>
        </View>

        {/* Job Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="construct" size={20} color={colors.neutral[700]} /> Jobs
          </Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { borderLeftColor: colors.neutral[600] }]}>
              <Text style={[styles.statValue, { color: colors.neutral[900] }]}>
                {stats?.total_jobs || 0}
              </Text>
              <Text style={styles.statLabel}>Total Jobs</Text>
            </View>
            <View style={[styles.statCard, { borderLeftColor: colors.warning.main }]}>
              <Text style={[styles.statValue, { color: colors.warning.main }]}>
                {stats?.active_jobs || 0}
              </Text>
              <Text style={styles.statLabel}>Active Jobs</Text>
            </View>
            <View style={[styles.statCard, { borderLeftColor: colors.success.main }]}>
              <Text style={[styles.statValue, { color: colors.success.main }]}>
                {stats?.completed_jobs || 0}
              </Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </View>
        </View>

        {/* Revenue Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="cash" size={20} color={colors.neutral[700]} /> Revenue
          </Text>
          <View style={styles.revenueCard}>
            <Text style={styles.revenueValue}>
              ${(stats?.total_revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            <Text style={styles.revenueLabel}>Total Platform Revenue</Text>
          </View>
        </View>

        {/* Pending Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="alert-circle" size={20} color={colors.neutral[700]} /> Pending Actions
          </Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { borderLeftColor: colors.warning.main }]}>
              <Text style={[styles.statValue, { color: colors.warning.main }]}>
                {stats?.pending_warranties || 0}
              </Text>
              <Text style={styles.statLabel}>Warranties</Text>
            </View>
            <View style={[styles.statCard, { borderLeftColor: colors.warning.main }]}>
              <Text style={[styles.statValue, { color: colors.warning.main }]}>
                {stats?.pending_change_orders || 0}
              </Text>
              <Text style={styles.statLabel}>Change Orders</Text>
            </View>
          </View>
        </View>

        {/* Refresh Button */}
        <Button
          title="Refresh Statistics"
          onPress={fetchStats}
          variant="outline"
          fullWidth
          icon={<Ionicons name="refresh" size={20} color={colors.primary.main} />}
          style={{ marginTop: spacing.xl }}
        />
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
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingVertical: spacing.md,
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.headings.h2,
    color: colors.neutral[900],
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body.regular,
    color: colors.neutral[600],
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.headings.h5,
    color: colors.neutral[700],
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsGrid: {
    gap: spacing.md,
  },
  statCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderLeftWidth: 4,
  },
  statValue: {
    ...typography.headings.h1,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.body.regular,
    color: colors.neutral[600],
  },
  revenueCard: {
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
  },
  revenueValue: {
    ...typography.headings.h1,
    color: '#fff',
    marginBottom: spacing.xs,
  },
  revenueLabel: {
    ...typography.body.regular,
    color: 'rgba(255, 255, 255, 0.9)',
  },
});
