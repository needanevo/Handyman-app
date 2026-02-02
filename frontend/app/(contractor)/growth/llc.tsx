import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../../src/constants/theme';

export default function LLCGrowth() {
  const router = useRouter();

  const openURL = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Form an LLC</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Hero Section */}
        <View style={styles.heroCard}>
          <Ionicons name="briefcase" size={48} color="#FFA500" />
          <Text style={styles.heroTitle}>Protect Your Personal Assets</Text>
          <Text style={styles.heroSubtitle}>
            An LLC separates your business from your personal finances.
            If something goes wrong on a job, your house and car are protected.
          </Text>
        </View>

        {/* Why LLC Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Form an LLC?</Text>
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Ionicons name="shield-checkmark" size={24} color="#10B981" />
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Legal Protection</Text>
                <Text style={styles.benefitText}>
                  Your personal assets (house, car, savings) are protected from business lawsuits.
                </Text>
              </View>
            </View>

            <View style={styles.benefitItem}>
              <Ionicons name="trending-up" size={24} color="#10B981" />
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Professional Image</Text>
                <Text style={styles.benefitText}>
                  Customers trust "Johnson Contracting Services LLC" more than just "John."
                </Text>
              </View>
            </View>

            <View style={styles.benefitItem}>
              <Ionicons name="wallet" size={24} color="#10B981" />
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Tax Benefits</Text>
                <Text style={styles.benefitText}>
                  Write off business expenses: tools, truck, phone, supplies.
                </Text>
              </View>
            </View>

            <View style={styles.benefitItem}>
              <Ionicons name="card" size={24} color="#10B981" />
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Business Credit</Text>
                <Text style={styles.benefitText}>
                  Build business credit separate from your personal credit score.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* How to Form Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How to Form an LLC</Text>
          <View style={styles.stepsList}>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Choose a Business Name</Text>
                <Text style={styles.stepText}>
                  "[Your Name] Contracting Services LLC" or "[City] Home Repair LLC"
                </Text>
              </View>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>File Articles of Organization</Text>
                <Text style={styles.stepText}>
                  Submit to your state. Online filing takes 10-30 minutes.
                </Text>
              </View>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Get an EIN (Tax ID)</Text>
                <Text style={styles.stepText}>
                  Free from IRS. Takes 5 minutes online.
                </Text>
              </View>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Open Business Bank Account</Text>
                <Text style={styles.stepText}>
                  Keep business money separate from personal.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Cost Breakdown */}
        <View style={styles.costCard}>
          <Text style={styles.costTitle}>Cost Breakdown</Text>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>State Filing Fee</Text>
            <Text style={styles.costValue}>$50-200</Text>
          </View>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>EIN (Tax ID)</Text>
            <Text style={styles.costValue}>Free</Text>
          </View>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Annual State Fee</Text>
            <Text style={styles.costValue}>$0-800</Text>
          </View>
          <View style={[styles.costRow, styles.costTotal]}>
            <Text style={styles.costTotalLabel}>Total First Year</Text>
            <Text style={styles.costTotalValue}>~$50-200</Text>
          </View>
        </View>

        {/* Resources */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Helpful Resources</Text>
          <TouchableOpacity
            style={styles.resourceCard}
            onPress={() => openURL('https://www.legalzoom.com/business/business-formation/llc-overview.html')}
          >
            <Ionicons name="document-text" size={20} color="#FFA500" />
            <Text style={styles.resourceText}>LegalZoom LLC Guide</Text>
            <Ionicons name="open-outline" size={16} color={colors.neutral[600]} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resourceCard}
            onPress={() => openURL('https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online')}
          >
            <Ionicons name="document-text" size={20} color="#FFA500" />
            <Text style={styles.resourceText}>IRS - Get Your EIN (Free)</Text>
            <Ionicons name="open-outline" size={16} color={colors.neutral[600]} />
          </TouchableOpacity>
        </View>

        {/* CTA */}
        <TouchableOpacity style={styles.ctaButton}>
          <Text style={styles.ctaText}>I formed my LLC</Text>
          <Ionicons name="checkmark-circle" size={20} color="#FFF" />
        </TouchableOpacity>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            This is educational information only, not legal advice. Consult with a lawyer
            or accountant for your specific situation.
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  headerTitle: {
    ...typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
  },
  content: {
    padding: spacing.lg,
    gap: spacing.base,
  },
  heroCard: {
    backgroundColor: '#FFA50020',
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFA50030',
  },
  heroTitle: {
    ...typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    marginTop: spacing.base,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  heroSubtitle: {
    ...typography.sizes.base,
    color: colors.neutral[700],
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    gap: spacing.base,
  },
  sectionTitle: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
  },
  benefitsList: {
    gap: spacing.base,
  },
  benefitItem: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  benefitText: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    lineHeight: 20,
  },
  stepsList: {
    gap: spacing.sm,
  },
  step: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFA500',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    ...typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: '#FFF',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  stepText: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
  },
  costCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  costTitle: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.base,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  costLabel: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
  },
  costValue: {
    ...typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.neutral[900],
  },
  costTotal: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  costTotalLabel: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
  },
  costTotalValue: {
    ...typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: '#FFA500',
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.base,
  },
  resourceText: {
    ...typography.sizes.sm,
    color: colors.neutral[700],
    flex: 1,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: '#FFA500',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  ctaText: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: '#FFF',
  },
  disclaimer: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
  },
  disclaimerText: {
    ...typography.sizes.xs,
    color: colors.neutral[600],
    textAlign: 'center',
    lineHeight: 16,
  },
});
