import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../src/constants/theme';

export default function ContractorAgreement() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contractor Agreement</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.lastUpdated}>Last Updated: November 13, 2025</Text>

        <Text style={styles.introText}>
          This Contractor Service Agreement ("Agreement") is entered into between The Real Johnson Handyman Services ("Platform") and the independent contractor ("Contractor").
        </Text>

        <Text style={styles.sectionTitle}>1. Independent Contractor Status</Text>
        <Text style={styles.paragraph}>
          Contractor acknowledges that they are an independent contractor and not an employee of The Real Johnson. Contractor is responsible for all taxes, insurance, and business expenses.
        </Text>

        <Text style={styles.sectionTitle}>2. Registration Requirements</Text>
        <Text style={styles.bulletPoint}>• Must be at least 18 years of age</Text>
        <Text style={styles.bulletPoint}>• Valid government-issued ID</Text>
        <Text style={styles.bulletPoint}>• Proof of liability insurance ($1,000,000 minimum)</Text>
        <Text style={styles.bulletPoint}>• Business license (where required by law)</Text>
        <Text style={styles.bulletPoint}>• Pass background check</Text>

        <Text style={styles.sectionTitle}>3. Annual Renewal</Text>
        <Text style={styles.paragraph}>
          Contractor registration must be renewed annually. All documents (licenses, insurance, certifications) must be re-uploaded during renewal. Registration expires 365 days after completion.
        </Text>
        <Text style={styles.bulletPoint}>• 30-day warning notification before expiration</Text>
        <Text style={styles.bulletPoint}>• 7-day urgent warning notification</Text>
        <Text style={styles.bulletPoint}>• Grace period: 30 days if active jobs exist</Text>
        <Text style={styles.bulletPoint}>• Expired contractors cannot accept new jobs</Text>

        <Text style={styles.sectionTitle}>4. Service Area</Text>
        <Text style={styles.paragraph}>
          Contractor service area is limited to a 50-mile radius from their registered business address. Jobs outside this radius will not be visible to the contractor.
        </Text>

        <Text style={styles.sectionTitle}>5. Payments and Fees</Text>
        <Text style={styles.paragraph}>
          The Platform charges a service fee for connecting contractors with customers. Payment terms:
        </Text>
        <Text style={styles.bulletPoint}>• Platform fee: 15% of job total</Text>
        <Text style={styles.bulletPoint}>• Payments processed within 2-3 business days</Text>
        <Text style={styles.bulletPoint}>• Contractor receives 85% of job payment</Text>
        <Text style={styles.bulletPoint}>• All payments processed through secure platform</Text>

        <Text style={styles.sectionTitle}>6. Quality Standards</Text>
        <Text style={styles.paragraph}>
          Contractors must maintain professional standards:
        </Text>
        <Text style={styles.bulletPoint}>• Complete work as quoted and agreed</Text>
        <Text style={styles.bulletPoint}>• Maintain 4.0+ star average rating</Text>
        <Text style={styles.bulletPoint}>• Respond to job requests within 24 hours</Text>
        <Text style={styles.bulletPoint}>• Arrive on time for scheduled appointments</Text>
        <Text style={styles.bulletPoint}>• Clean up work area upon completion</Text>

        <Text style={styles.sectionTitle}>7. Insurance and Liability</Text>
        <Text style={styles.paragraph}>
          Contractor must maintain valid liability insurance and workers' compensation (if applicable). The Platform is not liable for contractor actions, damages, or injuries.
        </Text>

        <Text style={styles.sectionTitle}>8. Compliance with Laws</Text>
        <Text style={styles.paragraph}>
          Contractor agrees to comply with all federal, state, and local laws, including but not limited to:
        </Text>
        <Text style={styles.bulletPoint}>• Building codes and permits</Text>
        <Text style={styles.bulletPoint}>• Safety regulations (OSHA)</Text>
        <Text style={styles.bulletPoint}>• Tax reporting requirements</Text>
        <Text style={styles.bulletPoint}>• Fair business practices</Text>

        <Text style={styles.sectionTitle}>9. Customer Relationships</Text>
        <Text style={styles.paragraph}>
          Contractors may not circumvent the platform to conduct business directly with customers met through the service for 12 months after initial contact.
        </Text>

        <Text style={styles.sectionTitle}>10. Termination</Text>
        <Text style={styles.paragraph}>
          Either party may terminate this agreement with 30 days written notice. The Platform may immediately terminate for:
        </Text>
        <Text style={styles.bulletPoint}>• Violation of terms</Text>
        <Text style={styles.bulletPoint}>• Customer complaints or poor ratings</Text>
        <Text style={styles.bulletPoint}>• Fraudulent activity</Text>
        <Text style={styles.bulletPoint}>• Failure to maintain insurance/licenses</Text>

        <Text style={styles.sectionTitle}>11. Dispute Resolution</Text>
        <Text style={styles.paragraph}>
          Any disputes shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.
        </Text>

        <Text style={styles.sectionTitle}>12. Mileage and Expense Tracking</Text>
        <Text style={styles.paragraph}>
          Contractors are responsible for tracking mileage and expenses for tax purposes. The Platform provides tools but is not responsible for contractor tax obligations.
        </Text>

        <Text style={styles.warningBox}>
          <Ionicons name="warning" size={20} color={colors.warning.main} />
          <Text style={styles.warningText}>
            By completing registration, you acknowledge that you have read, understood, and agree to be bound by this Contractor Service Agreement.
          </Text>
        </Text>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2025 The Real Johnson Handyman Services. All rights reserved.
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
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.lg,
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
    ...typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  lastUpdated: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    marginBottom: spacing.lg,
    fontStyle: 'italic',
  },
  introText: {
    ...typography.sizes.base,
    color: colors.neutral[700],
    lineHeight: 24,
    marginBottom: spacing.xl,
    fontWeight: typography.weights.medium,
  },
  sectionTitle: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  paragraph: {
    ...typography.sizes.base,
    color: colors.neutral[700],
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  bulletPoint: {
    ...typography.sizes.base,
    color: colors.neutral[700],
    lineHeight: 24,
    marginBottom: spacing.sm,
    paddingLeft: spacing.md,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: colors.warning.lightest,
    padding: spacing.base,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning.main,
    marginVertical: spacing.xl,
    gap: spacing.sm,
  },
  warningText: {
    flex: 1,
    ...typography.sizes.base,
    color: colors.warning.dark,
    lineHeight: 24,
    fontWeight: typography.weights.semibold,
  },
  footer: {
    marginTop: spacing['2xl'],
    paddingTop: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
    alignItems: 'center',
  },
  footerText: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    textAlign: 'center',
  },
});
