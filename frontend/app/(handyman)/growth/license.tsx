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

export default function LicenseGrowth() {
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
        <Text style={styles.headerTitle}>Get Licensed</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Hero Section */}
        <View style={styles.heroCard}>
          <Ionicons name="ribbon" size={48} color="#FFA500" />
          <Text style={styles.heroTitle}>Become a Licensed Contractor</Text>
          <Text style={styles.heroSubtitle}>
            Licensing lets you charge 30-50% more, bid bigger jobs, and work with
            commercial clients.
          </Text>
        </View>

        {/* Benefits Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Get Licensed?</Text>
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Ionicons name="cash" size={24} color="#10B981" />
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Higher Rates</Text>
                <Text style={styles.benefitText}>
                  Charge 30-50% more than unlicensed handymen. Customers pay for credentials.
                </Text>
              </View>
            </View>

            <View style={styles.benefitItem}>
              <Ionicons name="construct" size={24} color="#10B981" />
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Bigger Jobs</Text>
                <Text style={styles.benefitText}>
                  Take on full remodels, additions, and commercial work. No job size limits.
                </Text>
              </View>
            </View>

            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Legal Authority</Text>
                <Text style={styles.benefitText}>
                  Pull permits, sign off on inspections, work legally in all areas.
                </Text>
              </View>
            </View>

            <View style={styles.benefitItem}>
              <Ionicons name="business" size={24} color="#10B981" />
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Commercial Clients</Text>
                <Text style={styles.benefitText}>
                  Property managers and businesses require licenses. Unlock B2B market.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Requirements Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Typical Requirements</Text>
          <Text style={styles.sectionNote}>
            Requirements vary by state. Check your local licensing board.
          </Text>
          <View style={styles.requirementsList}>
            <View style={styles.requirementItem}>
              <Ionicons name="school" size={20} color="#FFA500" />
              <Text style={styles.requirementText}>
                4-10 years documented work experience
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <Ionicons name="document-text" size={20} color="#FFA500" />
              <Text style={styles.requirementText}>
                Pass state licensing exam (business + trade knowledge)
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <Ionicons name="shield-checkmark" size={20} color="#FFA500" />
              <Text style={styles.requirementText}>
                Proof of insurance (general liability)
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <Ionicons name="card" size={20} color="#FFA500" />
              <Text style={styles.requirementText}>
                Background check and application fee ($200-500)
              </Text>
            </View>
          </View>
        </View>

        {/* Study Plan */}
        <View style={styles.studyCard}>
          <Text style={styles.studyTitle}>How to Prepare</Text>
          <View style={styles.studySteps}>
            <View style={styles.studyStep}>
              <View style={styles.studyNumber}>
                <Text style={styles.studyNumberText}>1</Text>
              </View>
              <Text style={styles.studyText}>
                Get exam prep book for your state (Amazon, $30-50)
              </Text>
            </View>
            <View style={styles.studyStep}>
              <View style={styles.studyNumber}>
                <Text style={styles.studyNumberText}>2</Text>
              </View>
              <Text style={styles.studyText}>
                Study 1-2 hours/day for 2-3 months (codes, business law, safety)
              </Text>
            </View>
            <View style={styles.studyStep}>
              <View style={styles.studyNumber}>
                <Text style={styles.studyNumberText}>3</Text>
              </View>
              <Text style={styles.studyText}>
                Take practice exams online until you score 80%+
              </Text>
            </View>
            <View style={styles.studyStep}>
              <View style={styles.studyNumber}>
                <Text style={styles.studyNumberText}>4</Text>
              </View>
              <Text style={styles.studyText}>
                Schedule exam ($150-300). Most states allow retakes.
              </Text>
            </View>
          </View>
        </View>

        {/* State Resources */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>State Licensing Boards</Text>
          <TouchableOpacity
            style={styles.resourceCard}
            onPress={() => openURL('https://www.contractors-license.org/')}
          >
            <Ionicons name="globe" size={20} color="#FFA500" />
            <Text style={styles.resourceText}>Find Your State Requirements</Text>
            <Ionicons name="open-outline" size={16} color={colors.neutral[600]} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resourceCard}
            onPress={() => openURL('https://www.amazon.com/s?k=contractor+license+exam')}
          >
            <Ionicons name="book" size={20} color="#FFA500" />
            <Text style={styles.resourceText}>Exam Prep Books (Amazon)</Text>
            <Ionicons name="open-outline" size={16} color={colors.neutral[600]} />
          </TouchableOpacity>
        </View>

        {/* Cost Estimate */}
        <View style={styles.costCard}>
          <Text style={styles.costTitle}>Total Investment</Text>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Exam prep materials</Text>
            <Text style={styles.costValue}>$30-100</Text>
          </View>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Exam fee</Text>
            <Text style={styles.costValue}>$150-300</Text>
          </View>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Application/background check</Text>
            <Text style={styles.costValue}>$200-500</Text>
          </View>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Initial insurance</Text>
            <Text style={styles.costValue}>$500-1200</Text>
          </View>
          <View style={[styles.costRow, styles.costTotal]}>
            <Text style={styles.costTotalLabel}>Total</Text>
            <Text style={styles.costTotalValue}>~$880-2100</Text>
          </View>
          <Text style={styles.costNote}>
            ROI: Recoup in first 2-3 licensed jobs at higher rates
          </Text>
        </View>

        {/* CTA */}
        <TouchableOpacity style={styles.ctaButton}>
          <Text style={styles.ctaText}>I got my license</Text>
          <Ionicons name="checkmark-circle" size={20} color="#FFF" />
        </TouchableOpacity>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            Requirements vary significantly by state and trade. Always verify with your
            state's licensing board before proceeding.
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
  sectionNote: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    fontStyle: 'italic',
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
  requirementsList: {
    gap: spacing.sm,
  },
  requirementItem: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
  },
  requirementText: {
    ...typography.sizes.sm,
    color: colors.neutral[700],
    flex: 1,
  },
  studyCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  studyTitle: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.base,
  },
  studySteps: {
    gap: spacing.sm,
  },
  studyStep: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  studyNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFA500',
    alignItems: 'center',
    justifyContent: 'center',
  },
  studyNumberText: {
    ...typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: '#FFF',
  },
  studyText: {
    ...typography.sizes.sm,
    color: colors.neutral[700],
    flex: 1,
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
