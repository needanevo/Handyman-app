/**
 * JobCard Component
 *
 * Reusable card for displaying job information in lists.
 * Shows key details at a glance with visual hierarchy.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, borderRadius, shadows } from '../../constants/theme';
import { Job } from '../../types/contractor';
import { Badge } from '../Badge';

interface JobCardProps {
  job: Job;
  showPhotoBadge?: boolean;
}

export function JobCard({ job, showPhotoBadge = true }: JobCardProps) {
  const router = useRouter();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getStatusColor = () => {
    switch (job.status) {
      case 'AVAILABLE':
        return colors.neutral[100];
      case 'ACCEPTED':
        return colors.warning.lightest;
      case 'SCHEDULED':
      case 'IN_PROGRESS':
        return colors.primary.lightest;
      case 'COMPLETED':
        return colors.success.lightest;
      default:
        return colors.background.primary;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: getStatusColor() }]}
      onPress={() => router.push(`/(contractor)/jobs/${job.id}`)}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title} numberOfLines={1}>
            {job.title}
          </Text>
          <Text style={styles.category}>{job.category}</Text>
        </View>
        {showPhotoBadge && job.photos.length > 0 && (
          <View style={styles.photoBadge}>
            <Text style={styles.photoBadgeIcon}>📷</Text>
            <Text style={styles.photoBadgeText}>{job.photos.length}</Text>
          </View>
        )}
      </View>

      {/* Customer */}
      <View style={styles.row}>
        <Text style={styles.icon}>👤</Text>
        <Text style={styles.text}>
          {job.customer?.firstName} {job.customer?.lastName}
        </Text>
      </View>

      {/* Location */}
      <View style={styles.row}>
        <Text style={styles.icon}>📍</Text>
        <Text style={styles.text} numberOfLines={1}>
          {job.location.city}, {job.location.state}
        </Text>
      </View>

      {/* Schedule */}
      {job.scheduledDate && (
        <View style={styles.row}>
          <Text style={styles.icon}>📅</Text>
          <Text style={styles.text}>
            {formatDate(job.scheduledDate)} at {formatTime(job.scheduledStartTime)}
          </Text>
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          {job.quotedAmount && (
            <Text style={styles.amount}>{formatCurrency(job.quotedAmount)}</Text>
          )}
          {job.estimatedDuration && (
            <Text style={styles.duration}>{job.estimatedDuration}h est.</Text>
          )}
        </View>
        <Text style={styles.arrow}>→</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  category: {
    ...typography.sizes.xs,
    color: colors.neutral[600],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  photoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  photoBadgeIcon: {
    fontSize: 14,
  },
  photoBadgeText: {
    ...typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.background.primary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  icon: {
    fontSize: 14,
    marginRight: spacing.sm,
    width: 20,
  },
  text: {
    ...typography.sizes.sm,
    color: colors.neutral[700],
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  amount: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primary.main,
  },
  duration: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
  },
  arrow: {
    fontSize: 20,
    color: colors.neutral[400],
  },
});
