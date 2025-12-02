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

export default function InsuranceGrowth() {
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
        <Text style={styles.headerTitle}>Add Insurance</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Hero Section */}
        <View style={styles.heroCard}>
          <Ionicons name="shield-checkmark" size={48} color="#FFA500" />
          <Text style={styles.heroTitle}>Protect Your Business</Text>
          <Text style={styles.heroSubtitle}>
            General liability insurance gives customers confidence and protects you
            from accidents, property damage, and lawsuits.
          </Text>
        </View>

        {/* Why Insurance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Get Insured?</Text>
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Ionicons name="people" size={24} color="#10B981" />
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Customer Confidence</Text>
                <Text style={styles.benefitText}>
                  Homeowners trust insured contractors. Many won't hire without proof.
                </Text>
              </View>
            </View>

            <View style={styles.benefitItem}>
              <Ionicons name="shield" size={24} color="#10B981" />
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Accident Protection</Text>
                <Text style={styles.benefitText}>
                  If you damage their property (broken pipe, cracked tile), insurance pays.
                </Text>
              </View>
            </View>

            <View style={styles.benefitItem}>
              <Ionicons name="document-text" size={24} color="#10B981" />
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Lawsuit Defense</Text>
                <Text style={styles.benefitText}>
                  Covers legal fees if a customer sues for injury or property damage.
                </Text>
              </View>
            </View>

            <View style={styles.benefitItem}>
              <Ionicons name="briefcase" size={24} color="#10B981" />
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Commercial Requirement</Text>
                <Text style={styles.benefitText}>
                  Property managers and commercial clients require $1M+ coverage.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Coverage Types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What Insurance Do You Need?</Text>
          <View style={styles.coverageCard}>
            <View style={styles.coverageHeader}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.coverageTitle}>General Liability (Required)</Text>
            </View>
            <Text style={styles.coverageText}>
              Covers bodily injury and property damage. Most contractors start with
              $1M coverage. Cost: $500-1200/year.
            </Text>
          </View>

          <View style={styles.coverageCard}>
            <View style={styles.coverageHeader}>
              <Ionicons name="construct" size={20} color="#FFA500" />
              <Text style={styles.coverageTitle}>Tools & Equipment (Optional)</Text>
            </View>
            <Text style={styles.coverageText}>
              Covers theft or damage to your tools. Add-on: $100-300/year.
            </Text>
          </View>

          <View style={styles.coverageCard}>
            <View style={styles.coverageHeader}>
              <Ionicons name="car" size={20} color="#FFA500" />
              <Text style={styles.coverageTitle}>Commercial Auto (If Using Truck)</Text>
            </View>
            <Text style={styles.coverageText}>
              If you haul tools/materials in your vehicle. Add-on: $500-1500/year.
            </Text>
          </View>
        </View>

        {/* How to Get It */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How to Get Insurance</Text>
          <View style={styles.stepsList}>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Get Quotes from 3+ Providers</Text>
                <Text style={styles.stepText}>
                  Compare rates. Prices vary 20-40% between companies.
                </Text>
              </View>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Choose $1M Coverage Minimum</Text>
                <Text style={styles.stepText}>
                  Industry standard. Enough for most residential work.
                </Text>
              </View>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Pay Annually (Save 10-15%)</Text>
                <Text style={styles.stepText}>
                  Annual payment cheaper than monthly. Budget for it.
                </Text>
              </View>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Add Customers as "Additional Insured"</Text>
                <Text style={styles.stepText}>
                  Free to do. Some customers require it in contract.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recommended Providers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended Providers</Text>
          <TouchableOpacity
            style={styles.providerCard}
            onPress={() => openURL('https://www.thehartford.com/small-business-insurance')}
          >
            <View style={styles.providerInfo}>
              <Ionicons name="business" size={20} color="#FFA500" />
              <Text style={styles.providerName}>The Hartford</Text>
            </View>
            <Text style={styles.providerDesc}>Popular with contractors. Good rates.</Text>
            <Ionicons name="open-outline" size={16} color={colors.neutral[600]} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.providerCard}
            onPress={() => openURL('https://www.next-insurance.com/')}
          >
            <View style={styles.providerInfo}>
              <Ionicons name="business" size={20} color="#FFA500" />
              <Text style={styles.providerName}>NEXT Insurance</Text>
            </View>
            <Text style={styles.providerDesc}>100% online. Instant quotes.</Text>
            <Ionicons name="open-outline" size={16} color={colors.neutral[600]} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.providerCard}
            onPress={() => openURL('https://www.statefarm.com/business-insurance/contractors')}
          >
            <View style={styles.providerInfo}>
              <Ionicons name="business" size={20} color="#FFA500" />
              <Text style={styles.providerName}>State Farm</Text>
            </View>
            <Text style={styles.providerDesc}>Local agents. Bundle with auto.</Text>
            <Ionicons name="open-outline" size={16} color={colors.neutral[600]} />
          </TouchableOpacity>
        </View>

        {/* Cost Summary */}
        <View style={styles.costCard}>
          <Text style={styles.costTitle}>Annual Cost Estimate</Text>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>General Liability ($1M)</Text>
            <Text style={styles.costValue}>$500-1200</Text>
          </View>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Tools Coverage (optional)</Text>
            <Text style={styles.costValue}>$100-300</Text>
          </View>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Commercial Auto (optional)</Text>
            <Text style={styles.costValue}>$500-1500</Text>
          </View>
          <View style={[styles.costRow, styles.costTotal]}>
            <Text style={styles.costTotalLabel}>Total (Basic Package)</Text>
            <Text style={styles.costTotalValue}>~$500-1200/yr</Text>
          </View>
          <Text style={styles.costNote}>
            Tax deductible as business expense. ~$40-100/month.
          </Text>
        </View>

        {/* CTA */}
        <TouchableOpacity style={styles.ctaButton}>
          <Text style={styles.ctaText}>I added insurance</Text>
          <Ionicons name="checkmark-circle" size={20} color="#FFF" />
        </TouchableOpacity>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            This is general information only. Consult an insurance agent for coverage
            recommendations specific to your business and state requirements.
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
  coverageCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
  },
  coverageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  coverageTitle: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
  },
  coverageText: {
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
  providerCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  providerName: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
  },
  providerDesc: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    marginBottom: spacing.xs,
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
  costNote: {
    ...typography.sizes.xs,
    color: colors.neutral[600],
    marginTop: spacing.xs,
    fontStyle: 'italic',
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
