/**
 * Job Detail Screen — Handyman
 *
 * Displays job details from the available jobs feed.
 * Allows handymen to view full job information before accepting/bidding.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../../src/constants/theme';
import { handymanAPI } from '../../../src/services/api';
import { LoadingSpinner } from '../../../src/components/LoadingSpinner';

// Feature flag — flip to true when backend accept/bid endpoints are ready
const ENABLE_JOB_ACTIONS = false;

const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'posted':
      return '#4CAF50';  // Green
    case 'accepted':
      return '#2196F3';  // Blue
    case 'in_progress':
      return '#FF9800';  // Orange
    case 'completed':
      return '#9C27B0';  // Purple
    case 'in_review':
      return '#FF5722';  // Deep Orange
    case 'paid':
      return '#607D8B';  // Blue Grey
    case 'cancelled':
    case 'cancelled_before_accept':
    case 'cancelled_after_accept':
    case 'cancelled_in_progress':
      return '#757575';  // Grey
    default:
      return '#9E9E9E';  // Light Grey
  }
};

const getStatusLabel = (status: string): string => {
  return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

export default function HandymanJobDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: job, isLoading, error } = useQuery({
    queryKey: ['job-detail', id],
    queryFn: async () => {
      const res = await handymanAPI.getJob(id!);
      return res as any;
    },
    enabled: !!id,
  });

  const handleAccept = () => {
    if (!ENABLE_JOB_ACTIONS) return;
    Alert.alert('Not implemented yet', 'Accept job will be available in the next phase.');
  };

  const handleBid = () => {
    if (!ENABLE_JOB_ACTIONS) return;
    Alert.alert('Not implemented yet', 'Submit bid will be available in the next phase.');
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Loading job details..." />;
  }

  if (error || !job) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.neutral[900]} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Job Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.neutral[400]} />
          <Text style={styles.errorText}>Unable to load job details</Text>
          <Text style={styles.errorSubtext}>
            {(error as any)?.message || 'The job may no longer be available.'}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
            <Text style={styles.retryText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const address = job.address || {};
  const title = job.title || job.description || 'Untitled Job';
  const category = job.service_category || job.category || 'General';
  const status = job.status || 'unknown';
  const statusColor = getStatusColor(status);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Job Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Status + Category */}
        <View style={styles.badgeRow}>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {getStatusLabel(status)}
            </Text>
          </View>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{category}</Text>
          </View>
        </View>

        {/* Distance (if available) */}
        {job.distance_miles != null && (
          <View style={styles.distanceRow}>
            <Ionicons name="location-sharp" size={16} color={colors.primary.main} />
            <Text style={styles.distanceText}>
              {job.distance_miles.toFixed(1)} miles away
            </Text>
          </View>
        )}

        {/* Title & Description */}
        <View style={styles.card}>
          <Text style={styles.jobTitle}>{title}</Text>
          {job.description && job.description !== title && (
            <Text style={styles.jobDescription}>{job.description}</Text>
          )}
          {job.urgency && job.urgency !== 'low' && (
            <View style={styles.urgencyRow}>
              <Ionicons name="flame" size={16} color="#FFA500" />
              <Text style={styles.urgencyText}>
                {job.urgency.charAt(0).toUpperCase() + job.urgency.slice(1)} priority
              </Text>
            </View>
          )}
        </View>

        {/* Photos Gallery */}
        {job.photos && job.photos.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="images" size={20} color={colors.primary.main} />
              <Text style={styles.cardTitle}>Photos ({job.photos.length})</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
              {job.photos.map((photo: any, index: number) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    // TODO: Open full screen photo viewer
                    Alert.alert('Photo', `View photo ${index + 1}`);
                  }}
                >
                  <Image
                    source={{ uri: photo.url || photo }}
                    style={styles.thumbnail}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Customer Info */}
        {(job.customer_name || job.customer_phone || job.customer_email) && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="person" size={20} color={colors.primary.main} />
              <Text style={styles.cardTitle}>Customer</Text>
            </View>
            {job.customer_name && (
              <Text style={styles.customerName}>{job.customer_name}</Text>
            )}
            <View style={styles.customerContactRow}>
              {job.customer_phone && (
                <TouchableOpacity
                  onPress={() => {
                    // TODO: Launch phone dialer
                    Alert.alert('Phone', job.customer_phone);
                  }}
                  style={styles.contactItem}
                >
                  <Ionicons name="call-outline" size={16} color={colors.primary.main} />
                  <Text style={styles.contactText}>{job.customer_phone}</Text>
                </TouchableOpacity>
              )}
              {job.customer_email && (
                <TouchableOpacity
                  onPress={() => {
                    // TODO: Launch email
                    Alert.alert('Email', job.customer_email);
                  }}
                  style={styles.contactItem}
                >
                  <Ionicons name="mail-outline" size={16} color={colors.primary.main} />
                  <Text style={styles.contactText}>{job.customer_email}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Location */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="location" size={20} color={colors.primary.main} />
            <Text style={styles.cardTitle}>Location</Text>
          </View>
          <Text style={styles.addressText}>
            {address.street || 'Address not available'}
          </Text>
          {(address.city || address.state) && (
            <Text style={styles.addressText}>
              {[address.city, address.state].filter(Boolean).join(', ')} {address.zip || ''}
            </Text>
          )}
          {address.access_notes && (
            <View style={styles.accessNotes}>
              <Ionicons name="key-outline" size={16} color={colors.neutral[500]} />
              <Text style={styles.accessNotesText}>{address.access_notes}</Text>
            </View>
          )}
          {address.parking_notes && (
            <View style={styles.accessNotes}>
              <Ionicons name="car-outline" size={16} color={colors.neutral[500]} />
              <Text style={styles.accessNotesText}>{address.parking_notes}</Text>
            </View>
          )}
        </View>

        {/* Budget */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="cash" size={20} color={colors.primary.main} />
            <Text style={styles.cardTitle}>Budget</Text>
          </View>
          <Text style={styles.budgetAmount}>
            {job.budget_max != null
              ? `$${Number(job.budget_max).toFixed(2)}`
              : 'Not specified'}
          </Text>
          {job.budget_min != null && (
            <Text style={styles.budgetRange}>
              Range: ${Number(job.budget_min).toFixed(2)} - ${Number(job.budget_max).toFixed(2)}
            </Text>
          )}
        </View>

        {/* Scheduling */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="calendar" size={20} color={colors.primary.main} />
            <Text style={styles.cardTitle}>Schedule</Text>
          </View>
          <Text style={styles.dateLabel}>Posted</Text>
          <Text style={styles.dateText}>{formatDate(job.created_at)}</Text>
          {job.preferred_dates && job.preferred_dates.length > 0 && (
            <>
              <Text style={styles.dateLabel}>Preferred Dates</Text>
              <Text style={styles.dateText}>
                {Array.isArray(job.preferred_dates) 
                  ? job.preferred_dates.join(', ')
                  : job.preferred_dates}
              </Text>
            </>
          )}
        </View>

        {/* Timestamps */}
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>
            Job ID: {job.id?.slice(0, 8) || 'N/A'}
          </Text>
          {job.created_at && (
            <Text style={styles.metaText}>
              Posted: {formatDate(job.created_at)}
            </Text>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton, !ENABLE_JOB_ACTIONS && styles.disabledButton]}
            onPress={handleAccept}
            disabled={!ENABLE_JOB_ACTIONS}
          >
            <Ionicons name="checkmark-circle" size={22} color={ENABLE_JOB_ACTIONS ? '#FFF' : colors.neutral[500]} />
            <Text style={[styles.actionButtonText, !ENABLE_JOB_ACTIONS && styles.disabledButtonText]}>
              Accept Job
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.bidButton, !ENABLE_JOB_ACTIONS && styles.disabledButton]}
            onPress={handleBid}
            disabled={!ENABLE_JOB_ACTIONS}
          >
            <Ionicons name="document-text-outline" size={22} color={ENABLE_JOB_ACTIONS ? '#FFA500' : colors.neutral[500]} />
            <Text style={[styles.actionButtonTextOutline, !ENABLE_JOB_ACTIONS && styles.disabledButtonText]}>
              Submit Bid
            </Text>
          </TouchableOpacity>

          {!ENABLE_JOB_ACTIONS && (
            <Text style={styles.helperText}>Actions coming in next phase.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');
const THUMBNAIL_SIZE = 100;

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
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.headings.h4,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    flex: 1,
    textAlign: 'center',
  },
  content: {
    padding: spacing.base,
    paddingBottom: spacing['3xl'],
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  statusText: {
    ...typography.caption.small,
    fontWeight: typography.weights.semibold,
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
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.base,
  },
  distanceText: {
    ...typography.body.regular,
    color: colors.primary.main,
    fontWeight: typography.weights.medium,
  },
  card: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  cardTitle: {
    ...typography.caption.regular,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[700],
  },
  jobTitle: {
    ...typography.headings.h4,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    marginBottom: spacing.sm,
  },
  jobDescription: {
    ...typography.body.regular,
    color: colors.neutral[700],
    lineHeight: 22,
  },
  urgencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  urgencyText: {
    ...typography.caption.regular,
    color: '#FFA500',
    fontWeight: typography.weights.medium,
  },
  photoScroll: {
    marginTop: spacing.xs,
  },
  thumbnail: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
    backgroundColor: colors.neutral[100],
  },
  customerName: {
    ...typography.headings.h5,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  customerContactRow: {
    flexDirection: 'column',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  contactText: {
    ...typography.body.regular,
    color: colors.primary.main,
  },
  addressText: {
    ...typography.body.regular,
    color: colors.neutral[700],
  },
  accessNotes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
  accessNotesText: {
    ...typography.caption.regular,
    color: colors.neutral[600],
    fontStyle: 'italic',
  },
  budgetAmount: {
    ...typography.headings.h3,
    fontWeight: typography.weights.bold,
    color: '#FFA500',
  },
  budgetRange: {
    ...typography.caption.regular,
    color: colors.neutral[600],
    marginTop: spacing.xs,
  },
  dateLabel: {
    ...typography.caption.small,
    fontWeight: typography.weights.medium,
    color: colors.neutral[500],
    marginTop: spacing.xs,
  },
  dateText: {
    ...typography.body.regular,
    color: colors.neutral[700],
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.base,
  },
  metaText: {
    ...typography.caption.small,
    color: colors.neutral[500],
  },
  actionsSection: {
    marginTop: spacing.base,
    gap: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  acceptButton: {
    backgroundColor: '#FFA500',
  },
  bidButton: {
    backgroundColor: colors.background.primary,
    borderWidth: 2,
    borderColor: '#FFA500',
  },
  disabledButton: {
    backgroundColor: colors.neutral[100],
    borderColor: colors.neutral[300],
  },
  actionButtonText: {
    ...typography.body.regular,
    fontWeight: typography.weights.semibold,
    color: '#FFF',
  },
  actionButtonTextOutline: {
    ...typography.body.regular,
    fontWeight: typography.weights.semibold,
    color: '#FFA500',
  },
  disabledButtonText: {
    color: colors.neutral[500],
  },
  helperText: {
    ...typography.caption.regular,
    color: colors.neutral[500],
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorText: {
    ...typography.headings.h5,
    color: colors.neutral[700],
    marginTop: spacing.base,
  },
  errorSubtext: {
    ...typography.body.regular,
    color: colors.neutral[500],
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  retryButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.md,
  },
  retryText: {
    ...typography.body.regular,
    fontWeight: typography.weights.semibold,
    color: '#FFF',
  },
});
