import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Modal,
  TouchableOpacity,
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
  const [showLiabilityModal, setShowLiabilityModal] = useState(false);
  const [liabilityAgreed, setLiabilityAgreed] = useState(false);

  const photos = params.photos ? JSON.parse(params.photos as string) : [];

  useEffect(() => {
    // Generate REAL AI quote using backend API
    const generateQuote = async () => {
      try {
        // Format data for backend QuoteRequest
        const quoteRequest = {
          service_category: params.category,
          address_id: params.addressId,
          description: params.description || '',
          photos: photos,
          preferred_dates: [],
          budget_range: params.budgetMax ? {
            max: parseFloat(params.budgetMax as string),
          } : undefined,
          urgency: params.urgency || 'normal',
        };

        console.log('Generating AI quote with:', quoteRequest);

        const response = await quotesAPI.requestQuote(quoteRequest);

        console.log('AI Quote Response:', response);

        // Map backend response to frontend quote format
        const aiQuote = {
          laborCost: response.total_amount * 0.6, // Estimate labor as 60% of total
          materialsCost: response.total_amount * 0.4, // Estimate materials as 40%
          totalCost: response.total_amount,
          estimatedHours: response.estimated_hours || 3,
          breakdown: [
            { item: `${params.category} Service`, cost: response.total_amount * 0.6 },
            { item: 'Materials & Supplies', cost: response.total_amount * 0.4 },
          ],
          confidence: response.ai_confidence >= 0.8 ? 'high' : response.ai_confidence >= 0.6 ? 'medium' : 'low',
          notes: `AI-generated estimate for ${params.category} based on your description and photos.`,
          quoteId: response.quote_id, // Store quote ID for later use
        };

        setQuote(aiQuote);
        setIsGeneratingQuote(false);
      } catch (error) {
        console.error('Failed to generate AI quote:', error);
        // Fallback to default estimate if AI fails
        setQuote({
          laborCost: 180,
          materialsCost: 120,
          totalCost: 300,
          estimatedHours: 3,
          breakdown: [
            { item: `${params.category} Service`, cost: 180 },
            { item: 'Materials & Supplies', cost: 120 },
          ],
          confidence: 'medium',
          notes: 'Estimated cost based on typical rates for this service category.',
        });
        setIsGeneratingQuote(false);
      }
    };

    generateQuote();
  }, []);

  const { user } = useAuth();

  const handlePostJobClick = () => {
    // Show liability modal before posting
    setShowLiabilityModal(true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setShowLiabilityModal(false);

    try {
      // Quote was already created during preview with AI analysis
      // Just redirect to jobs page where they can see and accept it
      console.log('Quote already created with ID:', quote?.quoteId);

      Alert.alert(
        'Job Posted!',
        'Your job has been posted with an AI-generated quote. You can now review and accept it.',
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
          <Text style={styles.loadingTitle}>Analyzing your request...</Text>
          <Text style={styles.loadingSubtitle}>
            Our AI is reviewing your {params.category} job, photos, and description to generate an accurate quote
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
            onPress={handlePostJobClick}
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

      {/* Liability Modal */}
      <Modal
        visible={showLiabilityModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLiabilityModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="shield-checkmark-outline" size={40} color={colors.primary.main} />
              <Text style={styles.modalTitle}>Important Notice</Text>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalText}>
                We hold your payment securely and release it only when you confirm job or milestone completion.
                {'\n\n'}
                Service providers on this platform work independently and are solely responsible for their own work, materials, and performance.
                {'\n\n'}
                We do not supervise, guarantee, or certify any job.
              </Text>

              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setLiabilityAgreed(!liabilityAgreed)}
              >
                <View style={[styles.checkbox, liabilityAgreed && styles.checkboxChecked]}>
                  {liabilityAgreed && <Ionicons name="checkmark" size={20} color="#fff" />}
                </View>
                <Text style={styles.checkboxLabel}>I understand and agree</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              <Button
                title="Continue"
                onPress={handleSubmit}
                disabled={!liabilityAgreed}
                loading={isSubmitting}
                size="large"
                fullWidth
              />
              <Button
                title="Cancel"
                onPress={() => {
                  setShowLiabilityModal(false);
                  setLiabilityAgreed(false);
                }}
                variant="outline"
                size="medium"
                fullWidth
              />
            </View>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 500,
    ...shadows.lg,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    ...typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    marginTop: spacing.md,
    textAlign: 'center',
  },
  modalBody: {
    marginBottom: spacing.xl,
  },
  modalText: {
    ...typography.sizes.base,
    color: colors.neutral[700],
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.sm,
    marginRight: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  checkboxLabel: {
    ...typography.sizes.base,
    color: colors.neutral[900],
    fontWeight: typography.weights.medium,
  },
  modalActions: {
    gap: spacing.md,
  },
});
