/**
 * Job Detail Screen with Photo Gallery
 *
 * The centerpiece of the contractor experience - comprehensive job management
 * with photo documentation at the forefront. Designed for contractors to:
 * - Document work with photos (before/during/after)
 * - Track expenses and materials
 * - Log time and mileage
 * - Communicate with customers
 * - Manage job status and completion
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { colors, spacing, typography, borderRadius, shadows } from '../../../src/constants/theme';
import { Card } from '../../../src/components/Card';
import { Badge } from '../../../src/components/Badge';
import { Button } from '../../../src/components/Button';
import { LoadingSpinner } from '../../../src/components';
import { PhotoGallery } from '../../../src/components/contractor/PhotoGallery';
import { PhotoCapture } from '../../../src/components/contractor/PhotoCapture';
import { PhotoViewer } from '../../../src/components/contractor/PhotoViewer';
import { FloatingCameraButton } from '../../../src/components/contractor/FloatingCameraButton';
import { Job, JobPhoto, PhotoCategory } from '../../../src/types/contractor';

export default function JobDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [showPhotoCapture, setShowPhotoCapture] = useState(false);
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');

  // Mock data - in production, fetch from API
  const { data: job } = useQuery<Job>({
    queryKey: ['contractor', 'jobs', id],
    queryFn: async () => {
      // Mock job data
      return {
        id: id || '1',
        customerId: 'cust123',
        customer: {
          id: 'cust123',
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah@example.com',
          phone: '(555) 123-4567',
          preferredContact: 'phone' as const,
        },
        contractorId: 'cont456',
        status: 'in_progress' as const,
        title: 'Kitchen Faucet Replacement',
        description:
          'Replace leaking kitchen faucet with new Delta model. Customer has already purchased the faucet. Need to remove old faucet, clean area, and install new one.',
        category: 'Plumbing',
        location: {
          street: '123 Oak Street',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102',
          latitude: 37.7749,
          longitude: -122.4194,
          accessNotes: 'Gate code: #1234. Park in driveway.',
        },
        scheduledDate: '2025-11-15',
        scheduledStartTime: '09:00',
        scheduledEndTime: '11:00',
        estimatedDuration: 2,
        quotedAmount: 250,
        depositAmount: 100,
        depositPaid: true,
        photos: [
          {
            id: 'p1',
            jobId: id || '1',
            url: 'https://placeholder.com/300',
            category: 'BEFORE' as const,
            caption: 'Old leaking faucet',
            timestamp: '2025-11-15T09:15:00',
            uploadedBy: 'cont456',
          },
          {
            id: 'p2',
            jobId: id || '1',
            url: 'https://placeholder.com/300',
            category: 'BEFORE' as const,
            caption: 'Water damage under sink',
            timestamp: '2025-11-15T09:17:00',
            uploadedBy: 'cont456',
          },
          {
            id: 'p3',
            jobId: id || '1',
            url: 'https://placeholder.com/300',
            category: 'PROGRESS' as const,
            caption: 'Old faucet removed',
            timestamp: '2025-11-15T09:45:00',
            uploadedBy: 'cont456',
          },
        ],
        customerPhotos: [],
        expenses: [],
        timeLogs: [],
        totalExpenses: 0,
        totalLaborHours: 1.5,
        contractorNotes: 'Customer very friendly. Easy access to work area.',
        customerRequirements: 'Please clean up thoroughly after completion.',
        createdAt: '2025-11-10T10:00:00',
        updatedAt: '2025-11-15T09:45:00',
        acceptedAt: '2025-11-12T14:30:00',
      };
    },
  });

  const handlePhotoPress = (photo: JobPhoto, index: number) => {
    setSelectedPhotoIndex(index);
    setShowPhotoViewer(true);
  };

  const handlePhotoCapture = async (photoData: {
    uri: string;
    type: string;
    name: string;
    category: PhotoCategory;
    caption?: string;
  }) => {
    // In production, upload to backend
    console.log('Photo captured:', photoData);
    setShowPhotoCapture(false);

    // Optimistically update UI
    // queryClient.setQueryData(['contractor', 'jobs', id], ...)
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'neutral';
      case 'accepted':
        return 'warning';
      case 'scheduled':
        return 'primary';
      case 'in_progress':
        return 'primary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'neutral';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  if (!job) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner fullScreen text="Loading job details..." color={colors.primary.main} />
      </SafeAreaView>
    );
  }

  const photosToday = job.photos.filter((p) => {
    const photoDate = new Date(p.timestamp).toDateString();
    const today = new Date().toDateString();
    return photoDate === today;
  }).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {job.title}
        </Text>
        <View style={styles.headerRight}>
          <Badge label={job.status} variant={getStatusBadgeVariant(job.status)} />
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Job Info Card */}
        <Card style={styles.card}>
          <View style={styles.jobHeader}>
            <Text style={styles.jobTitle}>{job.title}</Text>
            <Text style={styles.jobCategory}>{job.category}</Text>
          </View>

          <Text style={styles.jobDescription}>{job.description}</Text>

          {/* Schedule Info */}
          {job.scheduledDate && (
            <View style={styles.scheduleInfo}>
              <View style={styles.scheduleItem}>
                <Text style={styles.scheduleIcon}>📅</Text>
                <View>
                  <Text style={styles.scheduleLabel}>Scheduled</Text>
                  <Text style={styles.scheduleValue}>
                    {formatDate(job.scheduledDate)}
                  </Text>
                </View>
              </View>
              <View style={styles.scheduleItem}>
                <Text style={styles.scheduleIcon}>🕐</Text>
                <View>
                  <Text style={styles.scheduleLabel}>Time</Text>
                  <Text style={styles.scheduleValue}>
                    {formatTime(job.scheduledStartTime || '09:00')} -{' '}
                    {formatTime(job.scheduledEndTime || '17:00')}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </Card>

        {/* Customer Info Card */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Customer</Text>
            <TouchableOpacity>
              <Text style={styles.contactLink}>Contact</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>
              {job.customer.firstName} {job.customer.lastName}
            </Text>
            <Text style={styles.customerDetail}>📞 {job.customer.phone}</Text>
            <Text style={styles.customerDetail}>📧 {job.customer.email}</Text>
          </View>

          {/* Location */}
          <View style={styles.divider} />
          <View style={styles.locationSection}>
            <Text style={styles.sectionLabel}>Location</Text>
            <Text style={styles.locationAddress}>
              {job.location.street}
            </Text>
            <Text style={styles.locationAddress}>
              {job.location.city}, {job.location.state} {job.location.zipCode}
            </Text>
            {job.location.accessNotes && (
              <View style={styles.accessNotes}>
                <Text style={styles.accessNotesLabel}>Access Notes:</Text>
                <Text style={styles.accessNotesText}>{job.location.accessNotes}</Text>
              </View>
            )}
            <Button
              title="Get Directions"
              onPress={() => {
                // Open maps
              }}
              variant="outline"
              size="small"
              style={styles.directionsButton}
            />
          </View>
        </Card>

        {/* Photo Gallery - THE CENTERPIECE */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Photos ({job.photos.length})</Text>
            <TouchableOpacity onPress={() => setShowPhotoCapture(true)}>
              <Text style={styles.addPhotoLink}>+ Add Photo</Text>
            </TouchableOpacity>
          </View>

          {job.photos.length > 0 ? (
            <PhotoGallery
              photos={job.photos}
              onPhotoPress={handlePhotoPress}
              showCategoryFilter={true}
            />
          ) : (
            <View style={styles.emptyPhotos}>
              <Text style={styles.emptyPhotosIcon}>📷</Text>
              <Text style={styles.emptyPhotosText}>
                No photos yet. Start documenting this job!
              </Text>
              <Button
                title="Take First Photo"
                onPress={() => setShowPhotoCapture(true)}
                variant="primary"
                size="medium"
                style={styles.takePhotoButton}
              />
            </View>
          )}
        </Card>

        {/* Financial Info */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Financial Summary</Text>

          <View style={styles.financialRow}>
            <Text style={styles.financialLabel}>Quoted Amount</Text>
            <Text style={styles.financialValue}>
              {formatCurrency(job.quotedAmount || 0)}
            </Text>
          </View>

          <View style={styles.financialRow}>
            <Text style={styles.financialLabel}>Deposit Paid</Text>
            <Text style={styles.financialValue}>
              {formatCurrency(job.depositAmount || 0)}
            </Text>
          </View>

          <View style={styles.financialRow}>
            <Text style={styles.financialLabel}>Total Expenses</Text>
            <Text style={[styles.financialValue, styles.expenseText]}>
              {formatCurrency(job.totalExpenses || 0)}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.financialRow}>
            <Text style={styles.financialLabelBold}>Estimated Profit</Text>
            <Text style={[styles.financialValueBold, styles.profitText]}>
              {formatCurrency(
                (job.quotedAmount || 0) - (job.totalExpenses || 0)
              )}
            </Text>
          </View>

          <Button
            title="Add Expense"
            onPress={() => router.push(`/(contractor)/expenses/add?jobId=${job.id}`)}
            variant="outline"
            size="small"
            style={styles.addExpenseButton}
          />
        </Card>

        {/* Change Orders */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Change Orders</Text>
            <TouchableOpacity
              onPress={() => router.push(`/(contractor)/change-order/list/${job.id}`)}
            >
              <Text style={styles.viewAllLink}>View All</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.cardSubtitle}>
            Document scope changes and additional work for this job
          </Text>
          <Button
            title="Create Change Order"
            onPress={() => router.push(`/(contractor)/change-order/create/${job.id}`)}
            variant="outline"
            size="medium"
            fullWidth
            style={{ marginTop: spacing.md }}
          />
        </Card>

        {/* Quick Actions */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => setShowNotes(true)}
            >
              <Text style={styles.quickActionIcon}>📝</Text>
              <Text style={styles.quickActionText}>Add Notes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => router.push(`/(contractor)/mileage/add?jobId=${job.id}`)}
            >
              <Text style={styles.quickActionIcon}>🚗</Text>
              <Text style={styles.quickActionText}>Log Mileage</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickAction}>
              <Text style={styles.quickActionIcon}>⏱️</Text>
              <Text style={styles.quickActionText}>Start Timer</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickAction}>
              <Text style={styles.quickActionIcon}>📤</Text>
              <Text style={styles.quickActionText}>Share Photos</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Contractor Notes */}
        {job.contractorNotes && (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Your Notes</Text>
            <Text style={styles.notesText}>{job.contractorNotes}</Text>
          </Card>
        )}
      </ScrollView>

      {/* Floating Camera Button */}
      <FloatingCameraButton
        onPress={() => setShowPhotoCapture(true)}
        badge={photosToday}
      />

      {/* Photo Capture Modal */}
      <Modal
        visible={showPhotoCapture}
        animationType="slide"
        onRequestClose={() => setShowPhotoCapture(false)}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Job Photo</Text>
            <TouchableOpacity onPress={() => setShowPhotoCapture(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <PhotoCapture
              onPhotoCapture={handlePhotoCapture}
              allowCategorySelection={true}
              showPreview={true}
            />
          </View>
        </SafeAreaView>
      </Modal>

      {/* Photo Viewer */}
      {showPhotoViewer && (
        <PhotoViewer
          photos={job.photos}
          initialIndex={selectedPhotoIndex}
          visible={showPhotoViewer}
          onClose={() => setShowPhotoViewer(false)}
        />
      )}
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
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary,
    ...shadows.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 28,
    color: colors.neutral[700],
  },
  headerTitle: {
    flex: 1,
    ...typography.headings.h5,
    color: colors.neutral[900],
    marginLeft: spacing.sm,
  },
  headerRight: {
    marginLeft: spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing['5xl'],
  },
  card: {
    margin: spacing.base,
    padding: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardTitle: {
    ...typography.headings.h5,
    color: colors.neutral[900],
  },
  cardSubtitle: {
    ...typography.body.small,
    color: colors.neutral[600],
    marginBottom: spacing.sm,
  },
  viewAllLink: {
    ...typography.caption.regular,
    color: colors.primary.main,
    fontWeight: typography.weights.semibold,
  },
  contactLink: {
    ...typography.caption.regular,
    color: colors.primary.main,
    fontWeight: typography.weights.semibold,
  },
  addPhotoLink: {
    ...typography.caption.regular,
    color: colors.primary.main,
    fontWeight: typography.weights.semibold,
  },
  jobHeader: {
    marginBottom: spacing.md,
  },
  jobTitle: {
    ...typography.headings.h4,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  jobCategory: {
    ...typography.caption.regular,
    color: colors.neutral[600],
  },
  jobDescription: {
    ...typography.body.regular,
    color: colors.neutral[700],
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  scheduleInfo: {
    flexDirection: 'row',
    gap: spacing.xl,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  scheduleIcon: {
    fontSize: 24,
  },
  scheduleLabel: {
    ...typography.caption.small,
    color: colors.neutral[600],
  },
  scheduleValue: {
    ...typography.caption.regular,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
  },
  customerInfo: {
    gap: spacing.xs,
  },
  customerName: {
    ...typography.headings.h5,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  customerDetail: {
    ...typography.caption.regular,
    color: colors.neutral[700],
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral[200],
    marginVertical: spacing.lg,
  },
  locationSection: {
    gap: spacing.xs,
  },
  sectionLabel: {
    ...typography.caption.regular,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[700],
    marginBottom: spacing.xs,
  },
  locationAddress: {
    ...typography.body.regular,
    color: colors.neutral[700],
  },
  accessNotes: {
    backgroundColor: colors.warning.lightest,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  accessNotesLabel: {
    ...typography.caption.small,
    fontWeight: typography.weights.semibold,
    color: colors.warning.dark,
    marginBottom: spacing.xs,
  },
  accessNotesText: {
    ...typography.caption.regular,
    color: colors.neutral[700],
  },
  directionsButton: {
    marginTop: spacing.md,
  },
  emptyPhotos: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyPhotosIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyPhotosText: {
    ...typography.body.regular,
    color: colors.neutral[600],
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  takePhotoButton: {
    minWidth: 200,
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  financialLabel: {
    ...typography.body.regular,
    color: colors.neutral[700],
  },
  financialValue: {
    ...typography.body.regular,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
  },
  financialLabelBold: {
    ...typography.body.regular,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
  },
  financialValueBold: {
    ...typography.headings.h4,
    fontWeight: typography.weights.bold,
  },
  expenseText: {
    color: colors.error.main,
  },
  profitText: {
    color: colors.success.dark,
  },
  addExpenseButton: {
    marginTop: spacing.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  quickAction: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.neutral[50],
    padding: spacing.base,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  quickActionIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  quickActionText: {
    ...typography.caption.regular,
    fontWeight: typography.weights.medium,
    color: colors.neutral[700],
    textAlign: 'center',
  },
  notesText: {
    ...typography.body.regular,
    color: colors.neutral[700],
    lineHeight: 24,
    marginTop: spacing.sm,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  modalTitle: {
    ...typography.headings.h4,
    color: colors.neutral[900],
  },
  modalClose: {
    fontSize: 28,
    color: colors.neutral[600],
  },
  modalContent: {
    flex: 1,
    padding: spacing.base,
  },
});
