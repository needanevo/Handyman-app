/**
 * Quote Detail Screen
 *
 * Displays detailed information about a specific quote/job request
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { colors, spacing, typography, borderRadius } from '../../src/constants/theme';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { LoadingSpinner } from '../../src/components/LoadingSpinner';
import { quotesAPI } from '../../src/services/api';

const { width } = Dimensions.get('window');

export default function QuoteDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: quote, isLoading, error } = useQuery({
    queryKey: ['quote', id],
    queryFn: () => quotesAPI.getQuote(id!),
    enabled: !!id,
  });

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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
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

        {/* Quote ID & Status */}
        <View style={styles.section}>
          <Card style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <View>
                <Text style={styles.quoteId}>Quote #{quote.id?.slice(-8).toUpperCase()}</Text>
                <Text style={styles.quoteDate}>
                  {new Date(quote.created_at || quote.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(quote.status)}20` }]}>
                <Text style={[styles.statusText, { color: getStatusColor(quote.status) }]}>
                  {formatStatus(quote.status)}
                </Text>
              </View>
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

        {/* Photos */}
        {quote.photos && quote.photos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Photos ({quote.photos.length})</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.photosScroll}
            >
              {quote.photos.map((photo: string, index: number) => (
                <TouchableOpacity key={index} style={styles.photoContainer}>
                  <Image
                    source={{ uri: photo }}
                    style={styles.photo}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Pricing */}
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

        {/* Address */}
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

        {/* Actions */}
        {quote.status === 'sent' && (
          <View style={styles.actionsSection}>
            <Button
              title="Accept Quote"
              onPress={() => {
                // TODO: Implement accept quote functionality
                console.log('Accept quote:', id);
              }}
              size="large"
              fullWidth
              style={styles.actionButton}
            />
            <Button
              title="Decline Quote"
              onPress={() => {
                // TODO: Implement decline quote functionality
                console.log('Decline quote:', id);
              }}
              variant="outline"
              size="large"
              fullWidth
            />
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
  statusCard: {
    padding: spacing.lg,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  quoteId: {
    ...typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  quoteDate: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  statusText: {
    ...typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
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
  descriptionCard: {
    padding: spacing.lg,
  },
  descriptionText: {
    ...typography.sizes.base,
    color: colors.neutral[700],
    lineHeight: 24,
  },
  photosScroll: {
    paddingRight: spacing.base,
  },
  photoContainer: {
    marginRight: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  photo: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: borderRadius.lg,
  },
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
  actionsSection: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.base,
    gap: spacing.md,
  },
  actionButton: {
    marginBottom: spacing.sm,
  },
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
    marginBottom: spacing.xl,
  },
});
