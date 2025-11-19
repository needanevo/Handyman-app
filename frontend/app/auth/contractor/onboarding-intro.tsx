import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../../src/constants/theme';
import { Button } from '../../../src/components/Button';
import { Card } from '../../../src/components/Card';

export default function ContractorOnboardingIntro() {
  const router = useRouter();

  const requirements = [
    {
      icon: 'card-outline' as const,
      title: "Driver's License",
      description: 'Valid government-issued ID for verification',
    },
    {
      icon: 'document-text-outline' as const,
      title: 'Business Licenses',
      description: 'Professional licenses and certifications',
    },
    {
      icon: 'shield-checkmark-outline' as const,
      title: 'Insurance Information',
      description: 'Liability and workers compensation',
    },
    {
      icon: 'images-outline' as const,
      title: 'Portfolio Photos',
      description: 'Examples of your best work (optional)',
    },
  ];

  const benefits = [
    'Get matched with customers in your area',
    'Secure payment with escrow protection',
    'Build your reputation with ratings and reviews',
    'Showcase your work with a professional portfolio',
    'Set your own schedule and availability',
    'No subscription fees - only pay when you work',
  ];

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

        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={[styles.heroIcon, { backgroundColor: colors.secondary.lightest }]}>
            <Ionicons name="construct" size={48} color={colors.secondary.main} />
          </View>
          <Text style={styles.title}>Become a Contractor</Text>
          <Text style={styles.subtitle}>
            Join our network of trusted professionals and grow your handyman business
          </Text>
        </View>

        {/* What You'll Need */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What You'll Need</Text>
          <Text style={styles.sectionDescription}>
            Have these documents ready to complete your registration:
          </Text>

          <View style={styles.requirementsList}>
            {requirements.map((req, index) => (
              <Card key={index} variant="outlined" padding="base" style={styles.requirementCard}>
                <View style={styles.requirementContent}>
                  <View style={[styles.requirementIcon, { backgroundColor: colors.primary.lightest }]}>
                    <Ionicons name={req.icon} size={24} color={colors.primary.main} />
                  </View>
                  <View style={styles.requirementText}>
                    <Text style={styles.requirementTitle}>{req.title}</Text>
                    <Text style={styles.requirementDescription}>{req.description}</Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        </View>

        {/* Benefits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Join Us?</Text>
          <View style={styles.benefitsList}>
            {benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={24} color={colors.success.main} />
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Trust Signals */}
        <Card variant="flat" padding="lg" style={styles.trustCard}>
          <Ionicons
            name="shield-checkmark"
            size={32}
            color={colors.success.main}
            style={styles.trustIcon}
          />
          <Text style={styles.trustTitle}>Your Information is Secure</Text>
          <Text style={styles.trustDescription}>
            All documents are encrypted and stored securely. We verify all contractors to
            ensure a trusted marketplace for everyone.
          </Text>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            title="Start Registration"
            onPress={() => router.push('/auth/contractor/register-step1')}
            size="large"
            fullWidth
          />
          <Button
            title="Back to Role Selection"
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
  header: {
    paddingTop: spacing.sm,
    marginBottom: spacing.base,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  hero: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  heroIcon: {
    width: 96,
    height: 96,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.sizes.lg,
    color: colors.neutral[600],
    textAlign: 'center',
    lineHeight: 28,
  },
  section: {
    marginBottom: spacing['3xl'],
  },
  sectionTitle: {
    ...typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    marginBottom: spacing.sm,
  },
  sectionDescription: {
    ...typography.sizes.base,
    color: colors.neutral[600],
    marginBottom: spacing.lg,
    lineHeight: 24,
  },
  requirementsList: {
    gap: spacing.md,
  },
  requirementCard: {
    marginBottom: 0,
  },
  requirementContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
  },
  requirementIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  requirementText: {
    flex: 1,
  },
  requirementTitle: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    marginBottom: 2,
  },
  requirementDescription: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    lineHeight: 20,
  },
  benefitsList: {
    gap: spacing.md,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  benefitText: {
    ...typography.sizes.base,
    color: colors.neutral[700],
    flex: 1,
    lineHeight: 24,
  },
  trustCard: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  trustIcon: {
    marginBottom: spacing.md,
  },
  trustTitle: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  trustDescription: {
    ...typography.sizes.base,
    color: colors.neutral[600],
    textAlign: 'center',
    lineHeight: 24,
  },
  actions: {
    gap: spacing.md,
  },
});
