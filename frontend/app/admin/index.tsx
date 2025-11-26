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
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../src/constants/theme';

interface AdminSection {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  color: string;
}

const adminSections: AdminSection[] = [
  {
    title: 'Statistics',
    description: 'View platform metrics and analytics',
    icon: 'stats-chart',
    route: '/admin/stats',
    color: colors.primary.main,
  },
  {
    title: 'Users',
    description: 'Manage customers and contractors',
    icon: 'people',
    route: '/admin/users',
    color: colors.success.main,
  },
  {
    title: 'Jobs',
    description: 'Monitor and manage all jobs',
    icon: 'construct',
    route: '/admin/jobs',
    color: colors.warning.main,
  },
  {
    title: 'Warranties',
    description: 'Review warranty requests',
    icon: 'shield-checkmark',
    route: '/admin/warranties',
    color: colors.info.main,
  },
  {
    title: 'Provider Gate',
    description: 'Control contractor registration types',
    icon: 'settings',
    route: '/admin/provider-gate',
    color: colors.neutral[600],
  },
];

export default function AdminDashboard() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Admin Dashboard</Text>
          <Text style={styles.subtitle}>
            Manage users, jobs, and platform settings
          </Text>
        </View>

        {/* Admin Sections Grid */}
        <View style={styles.grid}>
          {adminSections.map((section) => (
            <TouchableOpacity
              key={section.route}
              style={styles.card}
              onPress={() => router.push(section.route as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: `${section.color}20` }]}>
                <Ionicons name={section.icon} size={32} color={section.color} />
              </View>
              <Text style={styles.cardTitle}>{section.title}</Text>
              <Text style={styles.cardDescription}>{section.description}</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} style={styles.chevron} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>--</Text>
              <Text style={styles.statLabel}>Total Users</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>--</Text>
              <Text style={styles.statLabel}>Active Jobs</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>--</Text>
              <Text style={styles.statLabel}>Contractors</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>--</Text>
              <Text style={styles.statLabel}>Revenue</Text>
            </View>
          </View>
          <Text style={styles.helperText}>
            Tap Statistics to view detailed analytics
          </Text>
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
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    paddingVertical: spacing.xl,
  },
  title: {
    ...typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.sizes.base,
    color: colors.neutral[600],
  },
  grid: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    position: 'relative',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  cardTitle: {
    ...typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  cardDescription: {
    ...typography.sizes.base,
    color: colors.neutral[600],
    marginBottom: spacing.sm,
  },
  chevron: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
  },
  quickStats: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    ...typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    alignItems: 'center',
  },
  statValue: {
    ...typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.primary.main,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    textAlign: 'center',
  },
  helperText: {
    ...typography.sizes.sm,
    color: colors.neutral[500],
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
