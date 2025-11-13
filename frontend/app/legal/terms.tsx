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

export default function TermsOfService() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.lastUpdated}>Last Updated: November 13, 2025</Text>

        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.paragraph}>
          By accessing and using The Real Johnson Handyman Services ("Service"), you accept and agree to be bound by the terms and provision of this agreement.
        </Text>

        <Text style={styles.sectionTitle}>2. Description of Service</Text>
        <Text style={styles.paragraph}>
          The Real Johnson provides a platform connecting customers with licensed, insured handyman contractors for home repair and improvement services.
        </Text>

        <Text style={styles.sectionTitle}>3. User Accounts</Text>
        <Text style={styles.paragraph}>
          You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
        </Text>

        <Text style={styles.sectionTitle}>4. Customer Responsibilities</Text>
        <Text style={styles.bulletPoint}>• Provide accurate information about service requests</Text>
        <Text style={styles.bulletPoint}>• Allow contractors access to work areas</Text>
        <Text style={styles.bulletPoint}>• Make timely payments for completed work</Text>
        <Text style={styles.bulletPoint}>• Provide honest reviews of contractor services</Text>

        <Text style={styles.sectionTitle}>5. Contractor Responsibilities</Text>
        <Text style={styles.bulletPoint}>• Maintain valid licenses and insurance</Text>
        <Text style={styles.bulletPoint}>• Complete work professionally and safely</Text>
        <Text style={styles.bulletPoint}>• Provide accurate quotes and timelines</Text>
        <Text style={styles.bulletPoint}>• Comply with all local building codes</Text>

        <Text style={styles.sectionTitle}>6. Payments and Fees</Text>
        <Text style={styles.paragraph}>
          All payments are processed securely through our platform. Service fees and payment terms are disclosed prior to accepting any job.
        </Text>

        <Text style={styles.sectionTitle}>7. Cancellation Policy</Text>
        <Text style={styles.paragraph}>
          Cancellations must be made at least 24 hours before scheduled service. Late cancellations may incur fees as outlined in individual service agreements.
        </Text>

        <Text style={styles.sectionTitle}>8. Limitation of Liability</Text>
        <Text style={styles.paragraph}>
          The Real Johnson acts as a platform connecting customers and contractors. We are not liable for the quality of work performed by independent contractors. All contractors are required to carry appropriate insurance.
        </Text>

        <Text style={styles.sectionTitle}>9. Dispute Resolution</Text>
        <Text style={styles.paragraph}>
          Any disputes arising from services should first be addressed directly between customer and contractor. The Real Johnson will assist in mediation when necessary.
        </Text>

        <Text style={styles.sectionTitle}>10. Privacy</Text>
        <Text style={styles.paragraph}>
          Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your personal information.
        </Text>

        <Text style={styles.sectionTitle}>11. Changes to Terms</Text>
        <Text style={styles.paragraph}>
          We reserve the right to modify these terms at any time. Continued use of the Service after changes constitutes acceptance of the modified terms.
        </Text>

        <Text style={styles.sectionTitle}>12. Contact Information</Text>
        <Text style={styles.paragraph}>
          For questions about these Terms of Service, please contact us at:
        </Text>
        <Text style={styles.contactInfo}>Email: info@therealjohnson.com</Text>
        <Text style={styles.contactInfo}>Phone: (443) 307-3434</Text>

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
    marginBottom: spacing.xl,
    fontStyle: 'italic',
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
  contactInfo: {
    ...typography.sizes.base,
    color: colors.primary.main,
    marginBottom: spacing.xs,
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
