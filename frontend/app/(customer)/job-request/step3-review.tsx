import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../../src/constants/theme';
import { Button } from '../../../src/components/Button';
import { Card } from '../../../src/components/Card';
import { Badge } from '../../../src/components/Badge';
import { StepIndicator } from '../../../src/components/StepIndicator';
import { LoadingSpinner } from '../../../src/components/LoadingSpinner';
import { quotesAPI } from '../../../src/services/api';
import { useAuth } from '../../../src/contexts/AuthContext';

export default function JobRequestStep3() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isGeneratingQuote, setIsGeneratingQuote] = useState(true);
  const [quote, setQuote] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const photos = params.photos ? JSON.parse(params.photos as string) : [];

  useEffect(() => {
    // Simulate AI quote generation
    setTimeout(() => {
      setQuote({
        laborCost: 180,
        materialsCost: 120,
        totalCost: 300,
        estimatedHours: 3,
        breakdown: [
          { item: 'Drywall patch (2x2 ft)', cost: 45 },
          { item: 'Joint compound & tape', cost: 25 },
          { item: 'Primer & paint (matching)', cost: 50 },
          { item: 'Labor (3 hours)', cost: 180 },
        ],
        confidence: 'high',
        notes: 'Based on the photos, this appears to be a standard drywall repair. Price includes materials and labor to match existing texture and paint.',
      });
      setIsGeneratingQuote(false);
    }, 2000);
  }, []);

  const { user } = useAuth();

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Format data according to backend QuoteRequest model
      const quoteRequest = {
        service_category: params.category, // Backend expects service_category, not category
        address_id: params.addressId, // Critical: use the address_id from step0
        description: params.description || '',
        photos: photos, // Already uploaded URLs
        preferred_dates: [], // Optional
        budget_range: params.budgetMax ? {
          max: parseFloat(params.budgetMax as string),
        } : undefined,
        urgency: params.urgency || 'normal',
      };

      console.log('Submitting quote request:', quoteRequest);

      await quotesAPI.requestQuote(quoteRequest);

      Alert.alert(
        'Job Posted!',
        'Your job has been posted. We are notifying verified contractors in your area.',
        [
          {
            text: 'View Job',
            onPress: () => router.replace('/(customer)/jobs'),
          },
        ]
      );
    } catch (error: any) {
      console.error('Job submission error:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to post job. Please try again.';
      Alert.alert('Error', errorMessage);
      setIsSubmitting(false);
    }
  };

  const steps = [
    { label: 'Photos', completed: true },
    { label: 'Describe', completed: true },
    { label: 'Review', completed: false },
  ];

  const urgencyLabels: Record<string, string> = {
    low: 'Flexible Timeline',
    medium: 'This Week',
    high: 'Urgent',
  };

  if (isGeneratingQuote) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <View style={[styles.iconCircle, { backgroundColor: colors.primary.lightest }]}>
            <Ionicons name="sparkles" size={40} color={colors.primary.main} />
          </View>
          <Text style={styles.loadingTitle}>Creating your estimate...</Text>
          <Text style={styles.loadingSubtitle}>
            Our AI is analyzing your photos and generating an accurate quote
          </Text>
          <LoadingSpinner text="" />
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
            style={styles.backButton}
          />
        </View>

        {/* Progress */}
        <StepIndicator steps={steps} currentStep={2} />

        {/* Title */}
        <View style={styles.titleSection}>
          <View style={[styles.iconCircle, { backgroundColor: colors.success.lightest }]}>
            <Ionicons name="checkmark-circle" size={32} color={colors.success.main} />
          </View>
          <Text style={styles.title}>Review Your Quote</Text>
          <Text style={styles.subtitle}>
            We&apos;ve generated an estimate based on your photos and description
          </Text>
        </View>

        {/* Quote Card */}
        <Card variant="elevated" padding="lg" style={styles.quoteCard}>
          <View style={styles.quoteHeader}>
            <Text style={styles.quoteTitle}>Estimated Cost</Text>
            <Badge
              label={`${quote.confidence} confidence`}
              variant="success"
              size="sm"
            />
          </View>
          <Text style={styles.quoteAmount}>${quote.totalCost.toFixed(2)}</Text>
          <Text style={styles.quoteSubtitle}>
            {quote.estimatedHours} hours estimated
          </Text>

          <View style={styles.quoteDivider} />

          {/* Cost Breakdown */}
          <Text style={styles.breakdownTitle}>Cost Breakdown</Text>
          <View style={styles.breakdownList}>
            {quote.breakdown.map((item: any, index: number) => (
              <View key={index} style={styles.breakdownItem}>
                <Text style={styles.breakdownLabel}>{item.item}</Text>
                <Text style={styles.breakdownCost}>${item.cost.toFixed(2)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.quoteDivider} />

          {/* Payment Schedule */}
          <Text style={styles.breakdownTitle}>Payment Schedule</Text>
          <View style={styles.paymentSchedule}>
            <View style={styles.paymentItem}>
              <View style={styles.paymentLabel}>
                <Ionicons name="cash-outline" size={20} color={colors.primary.main} />
                <Text style={styles.paymentText}>Upfront (2/3)</Text>
              </View>
              <Text style={styles.paymentAmount}>${((quote.totalCost * 2) / 3).toFixed(2)}</Text>
            </View>
            <View style={styles.paymentItem}>
              <View style={styles.paymentLabel}>
                <Ionicons name="shield-checkmark-outline" size={20} color={colors.success.main} />
                <Text style={styles.paymentText}>Held in escrow (1/3)</Text>
              </View>
              <Text style={styles.paymentAmount}>${(quote.totalCost / 3).toFixed(2)}</Text>
            </View>
          </View>

          {/* AI Notes */}
          {quote.notes && (
            <>
              <View style={styles.quoteDivider} />
              <View style={styles.notesSection}>
                <Ionicons name="information-circle" size={20} color={colors.primary.main} />
                <Text style={styles.notesText}>{quote.notes}</Text>
              </View>
            </>
          )}
        </Card>

        {/* Job Details */}
        <Card variant="outlined" padding="base" style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Job Details</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Title</Text>
            <Text style={styles.detailValue}>{params.title}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Category</Text>
            <Badge label={params.category as string} variant="neutral" size="sm" />
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Urgency</Text>
            <Badge
              label={urgencyLabels[params.urgency as string] || params.urgency as string}
              variant={params.urgency === 'high' ? 'warning' : 'neutral'}
              size="sm"
            />
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Description</Text>
            <Text style={styles.detailValueMultiline}>{params.description}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Photos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
              <View style={styles.photoList}>
                {photos.map((photo: string, index: number) => (
                  <Image key={index} source={{ uri: photo }} style={styles.photoThumb} />
                ))}
              </View>
            </ScrollView>
          </View>
        </Card>

        {/* Trust Signal */}
        <Card variant="flat" padding="base" style={styles.trustCard}>
          <View style={styles.trustContent}>
            <Ionicons name="shield-checkmark" size={24} color={colors.success.main} />
            <View style={styles.trustText}>
              <Text style={styles.trustTitle}>Escrow Protection</Text>
              <Text style={styles.trustDescription}>
                Your payment is protected. Funds are only released as milestones are completed.
              </Text>
            </View>
          </View>
        </Card>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Post Job"
            onPress={handleSubmit}
            loading={isSubmitting}
            size="large"
            fullWidth
          />
          <Button
            title="Edit Details"
            onPress={() => router.back()}
            variant="outline"
            size="medium"
            fullWidth
          />
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
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['2xl'],
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  loadingTitle: {
    ...typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    textAlign: 'center',
    marginBottom: spacing.sm,
    marginTop: spacing.xl,
  },
  loadingSubtitle: {
    ...typography.sizes.base,
    color: colors.neutral[600],
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  header: {
    paddingTop: spacing.sm,
    marginBottom: spacing.md,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.sizes.base,
    color: colors.neutral[600],
    textAlign: 'center',
    lineHeight: 24,
  },
  quoteCard: {
    marginBottom: spacing.lg,
  },
  quoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  quoteTitle: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[700],
  },
  quoteAmount: {
    ...typography.sizes['4xl'],
    fontWeight: typography.weights.bold,
    color: colors.primary.main,
    marginBottom: spacing.xs,
  },
  quoteSubtitle: {
    ...typography.sizes.base,
    color: colors.neutral[600],
  },
  quoteDivider: {
    height: 1,
    backgroundColor: colors.neutral[200],
    marginVertical: spacing.lg,
  },
  breakdownTitle: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
  breakdownList: {
    gap: spacing.md,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLabel: {
    ...typography.sizes.base,
    color: colors.neutral[700],
    flex: 1,
  },
  breakdownCost: {
    ...typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.neutral[900],
  },
  paymentSchedule: {
    gap: spacing.md,
  },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  paymentLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  paymentText: {
    ...typography.sizes.base,
    color: colors.neutral[700],
  },
  paymentAmount: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
  },
  notesSection: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.primary.lightest,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  notesText: {
    ...typography.sizes.sm,
    color: colors.neutral[700],
    flex: 1,
    lineHeight: 20,
  },
  detailsCard: {
    marginBottom: spacing.lg,
  },
  detailsTitle: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.lg,
  },
  detailRow: {
    marginBottom: spacing.lg,
  },
  detailLabel: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    marginBottom: spacing.xs,
  },
  detailValue: {
    ...typography.sizes.base,
    color: colors.neutral[900],
    fontWeight: typography.weights.medium,
  },
  detailValueMultiline: {
    ...typography.sizes.base,
    color: colors.neutral[900],
    lineHeight: 24,
  },
  photoScroll: {
    marginTop: spacing.sm,
  },
  photoList: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  photoThumb: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
  },
  trustCard: {
    marginBottom: spacing.xl,
  },
  trustContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  trustText: {
    flex: 1,
  },
  trustTitle: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  trustDescription: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    lineHeight: 20,
  },
  actions: {
    gap: spacing.md,
  },
});
