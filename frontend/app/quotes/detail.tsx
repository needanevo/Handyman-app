/**
 * Quote Detail Screen - Redesigned
 *
 * A comprehensive, user-friendly quote detail view with:
 * - Hero section with first photo and quote number
 * - Horizontal scrollable photo gallery
 * - Action buttons (delete, contact, additional services, report issue)
 * - Clear visual hierarchy and emotional design
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { colors, spacing, typography, borderRadius, shadows } from '../../src/constants/theme';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { LoadingSpinner } from '../../src/components/LoadingSpinner';
import { quotesAPI } from '../../src/services/api';

const { width, height } = Dimensions.get('window');

export default function QuoteDetailScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  const { data: quote, isLoading, error } = useQuery({
    queryKey: ['quote', id],
    queryFn: () => quotesAPI.getQuote(id!),
    enabled: !!id,
  });

  // Delete quote mutation
  const deleteQuoteMutation = useMutation({
    mutationFn: () => quotesAPI.deleteQuote(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      Alert.alert(
        'Success',
        'Your quote request has been deleted.',
        [{ text: 'OK', onPress: () => router.replace('/home') }]
      );
    },
    onError: (error: any) => {
      Alert.alert(
        'Error',
        error.response?.data?.detail || 'Failed to delete quote. Please try again.'
      );
    },
  });

  // Contact about quote mutation
  const contactMutation = useMutation({
    mutationFn: (message?: string) => quotesAPI.contactAboutQuote(id!, message),
    onSuccess: () => {
      Alert.alert(
        'Message Sent',
        'Your message has been sent to The Real Johnson team. We\'ll follow up within 24 hours.'
      );
    },
    onError: (error: any) => {
      Alert.alert(
        'Error',
        error.response?.data?.detail || 'Failed to send message. Please try again.'
      );
    },
  });

  // Report issue mutation
  const reportIssueMutation = useMutation({
    mutationFn: ({ issueType, details }: { issueType: string; details?: string }) =>
      quotesAPI.reportIssue(id!, issueType, details),
    onSuccess: () => {
      Alert.alert(
        'Issue Reported',
        'Thank you for reporting this issue. We\'ll review it and get back to you soon.'
      );
    },
    onError: (error: any) => {
      Alert.alert(
        'Error',
        error.response?.data?.detail || 'Failed to report issue. Please try again.'
      );
    },
  });

  const handleDeleteQuote = () => {
    Alert.alert(
      'Delete Quote Request',
      'Are you sure you want to delete this quote? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteQuoteMutation.mutate(),
        },
      ]
    );
  };

  const handleContactAboutQuote = () => {
    contactMutation.mutate();
  };

  const handleRequestAdditionalWork = () => {
    // Navigate to quote request with pre-filled address
    router.push({
      pathname: '/quote/request',
      params: {
        originalQuoteId: id,
        addressId: quote?.address_id || '',
      },
    });
  };

  const handleReportIssue = () => {
    Alert.alert(
      'Report an Issue',
      'What type of issue are you experiencing?',
      [
        {
          text: 'Contractor hasn\'t arrived',
          onPress: () => reportIssueMutation.mutate({ issueType: 'contractor_no_show' }),
        },
        {
          text: 'Work quality concerns',
          onPress: () => reportIssueMutation.mutate({ issueType: 'work_quality' }),
        },
        {
          text: 'Pricing dispute',
          onPress: () => reportIssueMutation.mutate({ issueType: 'pricing_dispute' }),
        },
        {
          text: 'Other issue',
          onPress: () => reportIssueMutation.mutate({ issueType: 'other' }),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner text="Loading quote details..." />
      </SafeAreaView>
    );
  }

  if (error || !quote) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error.main} />
          <Text style={styles.errorText}>Quote not found</Text>
          <Text style={styles.errorSubtext}>
            This quote may have been deleted or you don't have permission to view it.
          </Text>
          <Button title="Go Back" onPress={() => router.back()} variant="outline" />
        </View>
      </SafeAreaView>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return colors.primary.main;
      case 'accepted':
        return colors.success.main;
      case 'rejected':
        return colors.error.main;
      default:
        return colors.warning.main;
    }
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const photos = quote.photos || [];
  const hasPhotos = photos.length > 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header - Always visible */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.primary.main} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quote Details</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Hero Section - First Photo with Quote Number Overlay */}
        {hasPhotos ? (
          <TouchableOpacity
            style={styles.heroSection}
            onPress={() => setSelectedPhotoIndex(0)}
            activeOpacity={0.9}
          >
            <Image
              source={{ uri: photos[0] }}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <View style={styles.heroOverlay}>
              <View style={styles.heroQuoteNumberBadge}>
                <Text style={styles.heroQuoteNumber}>
                  Quote #{quote.id?.slice(-8).toUpperCase() || 'N/A'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.heroPlaceholder}>
            <Ionicons name="image-outline" size={64} color={colors.neutral[400]} />
            <Text style={styles.heroQuoteNumberLarge}>
              Quote #{quote.id?.slice(-8).toUpperCase() || 'N/A'}
            </Text>
          </View>
        )}

        {/* Status & Date */}
        <View style={styles.section}>
          <Card style={styles.statusCard}>
            <View style={styles.statusRow}>
              <View style={styles.statusBadgeContainer}>
                <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(quote.status)}20` }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(quote.status) }]}>
                    {formatStatus(quote.status)}
                  </Text>
                </View>
              </View>
              <Text style={styles.quoteDate}>
                {new Date(quote.created_at || quote.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </View>
          </Card>
        </View>

        {/* Service Category */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service</Text>
          <Card style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="construct-outline" size={24} color={colors.primary.main} />
              <Text style={styles.infoText}>{quote.service_category || quote.serviceCategory || 'General Service'}</Text>
            </View>
          </Card>
        </View>

        {/* Description */}
        {quote.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Card style={styles.descriptionCard}>
              <Text style={styles.descriptionText}>{quote.description}</Text>
            </Card>
          </View>
        )}

        {/* Photos Gallery - Horizontal Scroll */}
        {hasPhotos && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Photos ({photos.length})</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.photosScroll}
            >
              {photos.map((photo: string, index: number) => (
                <TouchableOpacity
                  key={index}
                  style={styles.photoThumbnailContainer}
                  onPress={() => setSelectedPhotoIndex(index)}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{ uri: photo }}
                    style={styles.photoThumbnail}
                    resizeMode="cover"
                  />
                  <View style={styles.photoNumberBadge}>
                    <Text style={styles.photoNumberText}>{index + 1}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Pricing Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing</Text>
          <Card style={styles.pricingCard}>
            {quote.items && quote.items.length > 0 ? (
              <>
                {quote.items.map((item: any, index: number) => (
                  <View key={index} style={styles.pricingRow}>
                    <Text style={styles.pricingLabel}>{item.service_name || item.serviceName}</Text>
                    <Text style={styles.pricingValue}>${item.total_price || item.totalPrice || '0.00'}</Text>
                  </View>
                ))}
                <View style={styles.divider} />
              </>
            ) : null}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${quote.total_amount || quote.totalAmount || '0.00'}</Text>
            </View>
          </Card>
        </View>

        {/* Location */}
        {quote.address && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <Card style={styles.addressCard}>
              <Ionicons name="location-outline" size={20} color={colors.neutral[600]} />
              <View style={styles.addressContent}>
                <Text style={styles.addressText}>
                  {quote.address.street}
                </Text>
                <Text style={styles.addressText}>
                  {quote.address.city}, {quote.address.state} {quote.address.zipCode || quote.address.zip_code}
                </Text>
              </View>
            </Card>
          </View>
        )}

        {/* Action Buttons Section */}
        <View style={styles.actionsSection}>
          <Text style={styles.actionsSectionTitle}>Actions</Text>

          {/* Primary Action - Contact */}
          <Button
            title="Contact About This Job"
            onPress={handleContactAboutQuote}
            size="large"
            fullWidth
            icon="mail-outline"
            style={styles.actionButton}
            disabled={contactMutation.isPending}
          />

          {/* Secondary Action - Additional Services */}
          <Button
            title="Request Additional Work"
            onPress={handleRequestAdditionalWork}
            variant="outline"
            size="large"
            fullWidth
            icon="add-circle-outline"
            style={styles.actionButton}
          />

          {/* Destructive Action - Delete */}
          <Button
            title="Delete This Request"
            onPress={handleDeleteQuote}
            variant="outline"
            size="large"
            fullWidth
            style={[styles.actionButton, styles.deleteButton]}
            textStyle={styles.deleteButtonText}
            disabled={deleteQuoteMutation.isPending}
          />

          {/* Warning Action - Report Issue */}
          <TouchableOpacity
            style={styles.reportIssueButton}
            onPress={handleReportIssue}
            disabled={reportIssueMutation.isPending}
          >
            <Ionicons name="warning-outline" size={20} color={colors.warning.dark} />
            <Text style={styles.reportIssueText}>I Have a Problem with My Contractor</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Full-Screen Photo Modal */}
      <Modal
        visible={selectedPhotoIndex !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedPhotoIndex(null)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setSelectedPhotoIndex(null)}
          >
            <Ionicons name="close" size={32} color="#FFFFFF" />
          </TouchableOpacity>

          {selectedPhotoIndex !== null && (
            <View style={styles.modalContent}>
              <Image
                source={{ uri: photos[selectedPhotoIndex] }}
                style={styles.modalImage}
                resizeMode="contain"
              />
              <View style={styles.modalPhotoCounter}>
                <Text style={styles.modalPhotoCounterText}>
                  {selectedPhotoIndex + 1} of {photos.length}
                </Text>
              </View>

              {/* Navigation arrows if multiple photos */}
              {photos.length > 1 && (
                <>
                  {selectedPhotoIndex > 0 && (
                    <TouchableOpacity
                      style={[styles.modalNavButton, styles.modalNavButtonLeft]}
                      onPress={() => setSelectedPhotoIndex(selectedPhotoIndex - 1)}
                    >
                      <Ionicons name="chevron-back" size={32} color="#FFFFFF" />
                    </TouchableOpacity>
                  )}
                  {selectedPhotoIndex < photos.length - 1 && (
                    <TouchableOpacity
                      style={[styles.modalNavButton, styles.modalNavButtonRight]}
                      onPress={() => setSelectedPhotoIndex(selectedPhotoIndex + 1)}
                    >
                      <Ionicons name="chevron-forward" size={32} color="#FFFFFF" />
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          )}
        </View>
      </Modal>
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
  },

  // Hero Section
  heroSection: {
    width: '100%',
    height: 280,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
    padding: spacing.lg,
  },
  heroQuoteNumberBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignSelf: 'flex-start',
    ...shadows.md,
  },
  heroQuoteNumber: {
    ...typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.primary.main,
  },
  heroPlaceholder: {
    width: '100%',
    height: 280,
    backgroundColor: colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  heroQuoteNumberLarge: {
    ...typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.neutral[600],
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

  // Status Card
  statusCard: {
    padding: spacing.lg,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadgeContainer: {
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  statusText: {
    ...typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  quoteDate: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
  },

  // Info Card
  infoCard: {
    padding: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  infoText: {
    ...typography.sizes.base,
    color: colors.neutral[900],
    fontWeight: typography.weights.medium,
    textTransform: 'capitalize',
  },

  // Description
  descriptionCard: {
    padding: spacing.lg,
  },
  descriptionText: {
    ...typography.sizes.base,
    color: colors.neutral[700],
    lineHeight: 24,
  },

  // Photos Gallery
  photosScroll: {
    paddingRight: spacing.base,
    gap: spacing.md,
  },
  photoThumbnailContainer: {
    position: 'relative',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  photoThumbnail: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.lg,
  },
  photoNumberBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: borderRadius.full,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoNumberText: {
    ...typography.sizes.sm,
    color: '#FFFFFF',
    fontWeight: typography.weights.bold,
  },

  // Pricing
  pricingCard: {
    padding: spacing.lg,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  pricingLabel: {
    ...typography.sizes.base,
    color: colors.neutral[700],
  },
  pricingValue: {
    ...typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.neutral[900],
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral[200],
    marginVertical: spacing.md,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
  },
  totalValue: {
    ...typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.primary.main,
  },

  // Address
  addressCard: {
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  addressContent: {
    flex: 1,
  },
  addressText: {
    ...typography.sizes.base,
    color: colors.neutral[700],
    marginBottom: spacing.xs,
  },

  // Actions Section
  actionsSection: {
    marginTop: spacing['2xl'],
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.xl,
  },
  actionsSectionTitle: {
    ...typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    marginBottom: spacing.lg,
  },
  actionButton: {
    marginBottom: spacing.md,
  },
  deleteButton: {
    borderColor: colors.error.main,
  },
  deleteButtonText: {
    color: colors.error.main,
  },
  reportIssueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  reportIssueText: {
    ...typography.sizes.base,
    color: colors.warning.dark,
    fontWeight: typography.weights.medium,
  },

  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['2xl'],
  },
  errorText: {
    ...typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  errorSubtext: {
    ...typography.sizes.base,
    color: colors.neutral[600],
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },

  // Photo Modal
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: width,
    height: height * 0.8,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 50,
    right: spacing.lg,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: borderRadius.full,
    padding: spacing.sm,
  },
  modalPhotoCounter: {
    position: 'absolute',
    bottom: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
  },
  modalPhotoCounterText: {
    ...typography.sizes.base,
    color: '#FFFFFF',
    fontWeight: typography.weights.semibold,
  },
  modalNavButton: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: borderRadius.full,
    padding: spacing.md,
  },
  modalNavButtonLeft: {
    left: spacing.lg,
  },
  modalNavButtonRight: {
    right: spacing.lg,
  },
});
