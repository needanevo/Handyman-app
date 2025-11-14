import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../src/constants/theme';
import { Button } from '../src/components/Button';

export default function ContractorBeta() {
  const router = useRouter();

  const benefits = [
    {
      icon: 'cash-outline',
      title: 'Earn More',
      description: 'Keep 85% of every job. No bidding wars or lowball offers.',
    },
    {
      icon: 'people-outline',
      title: 'Quality Leads',
      description: 'Pre-screened customers ready to hire. No tire-kickers.',
    },
    {
      icon: 'calendar-outline',
      title: 'Flexible Schedule',
      description: "Choose your own hours and service area. You're the boss.",
    },
    {
      icon: 'card-outline',
      title: 'Fast Payments',
      description: 'Get paid 2-3 days after job completion. Secure & reliable.',
    },
    {
      icon: 'calculator-outline',
      title: 'Tax Tools',
      description: 'Track mileage, expenses, and income for easy tax filing.',
    },
    {
      icon: 'shield-checkmark-outline',
      title: 'Insurance Verified',
      description: 'Customers trust you because we verify your credentials.',
    },
  ];

  const handleJoinNow = () => {
    router.push('/auth/contractor/onboarding-intro');
  };

  const handleDownloadExpoGo = () => {
    Linking.openURL('https://expo.dev/client');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.logoContainer}>
            <Image
              source={{ uri: 'https://customer-assets.emergentagent.com/job_fixitright-2/artifacts/l18wndlz_handyman.png' }}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.heroTitle}>Join Our Beta Program</Text>
          <Text style={styles.heroSubtitle}>
            Be among the first contractors to experience the future of handyman services
          </Text>
          <View style={styles.betaBadge}>
            <Text style={styles.betaBadgeText}>BETA ACCESS</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>15%</Text>
            <Text style={styles.statLabel}>Platform Fee</Text>
            <Text style={styles.statSubtext}>vs. 20-30% elsewhere</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>2-3</Text>
            <Text style={styles.statLabel}>Day Payout</Text>
            <Text style={styles.statSubtext}>Fast & reliable</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>50mi</Text>
            <Text style={styles.statLabel}>Service Radius</Text>
            <Text style={styles.statSubtext}>Work locally</Text>
          </View>
        </View>

        {/* Benefits */}
        <View style={styles.benefitsSection}>
          <Text style={styles.sectionTitle}>Why Join The Real Johnson?</Text>
          <View style={styles.benefitsGrid}>
            {benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitCard}>
                <View style={styles.benefitIcon}>
                  <Ionicons name={benefit.icon as any} size={32} color={colors.primary.main} />
                </View>
                <Text style={styles.benefitTitle}>{benefit.title}</Text>
                <Text style={styles.benefitDescription}>{benefit.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Requirements */}
        <View style={styles.requirementsSection}>
          <Text style={styles.sectionTitle}>Requirements</Text>
          <View style={styles.requirementsList}>
            <View style={styles.requirement}>
              <Ionicons name="checkmark-circle" size={24} color={colors.success.main} />
              <Text style={styles.requirementText}>18+ years old with valid ID</Text>
            </View>
            <View style={styles.requirement}>
              <Ionicons name="checkmark-circle" size={24} color={colors.success.main} />
              <Text style={styles.requirementText}>Liability insurance ($1M minimum)</Text>
            </View>
            <View style={styles.requirement}>
              <Ionicons name="checkmark-circle" size={24} color={colors.success.main} />
              <Text style={styles.requirementText}>Business license (if required in your area)</Text>
            </View>
            <View style={styles.requirement}>
              <Ionicons name="checkmark-circle" size={24} color={colors.success.main} />
              <Text style={styles.requirementText}>Background check clearance</Text>
            </View>
          </View>
        </View>

        {/* How It Works */}
        <View style={styles.howItWorksSection}>
          <Text style={styles.sectionTitle}>How to Get Started</Text>
          <View style={styles.stepsList}>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Download Expo Go</Text>
                <Text style={styles.stepDescription}>
                  Install the Expo Go app from the App Store or Google Play (for beta testing)
                </Text>
                <TouchableOpacity onPress={handleDownloadExpoGo}>
                  <Text style={styles.link}>Get Expo Go →</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Scan QR Code</Text>
                <Text style={styles.stepDescription}>
                  Open Expo Go and scan the QR code below to launch the app
                </Text>
                {/* QR code would go here - generate with exp://YOUR_IP:PORT */}
                <View style={styles.qrPlaceholder}>
                  <Text style={styles.qrText}>QR Code Coming Soon</Text>
                  <Text style={styles.qrSubtext}>Or use the button below</Text>
                </View>
              </View>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Complete Registration</Text>
                <Text style={styles.stepDescription}>
                  Fill out the 4-step registration process with your info and documents
                </Text>
              </View>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Start Earning</Text>
                <Text style={styles.stepDescription}>
                  Accept jobs, complete work, track income - all from your phone!
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Ready to Join?</Text>
          <Text style={styles.ctaSubtitle}>
            Limited beta spots available. Join now and shape the future of our platform.
          </Text>
          <Button
            title="Join Beta Program"
            onPress={handleJoinNow}
            size="large"
            fullWidth
            icon={<Ionicons name="arrow-forward" size={20} color={colors.background.primary} />}
          />
          <Text style={styles.ctaNote}>
            No credit card required • Free during beta
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Questions? Email us at info@therealjohnson.com
          </Text>
          <View style={styles.footerLinks}>
            <TouchableOpacity onPress={() => router.push('/legal/terms')}>
              <Text style={styles.footerLink}>Terms of Service</Text>
            </TouchableOpacity>
            <Text style={styles.footerSeparator}>•</Text>
            <TouchableOpacity onPress={() => router.push('/legal/contractor-agreement')}>
              <Text style={styles.footerLink}>Contractor Agreement</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  content: {
    flexGrow: 1,
  },
  hero: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing['3xl'],
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: spacing.lg,
  },
  logoImage: {
    width: 100,
    height: 100,
  },
  heroTitle: {
    ...typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.background.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    ...typography.sizes.lg,
    color: colors.primary.lightest,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  betaBadge: {
    backgroundColor: colors.warning.main,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  betaBadgeText: {
    ...typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.background.primary,
    letterSpacing: 1,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xl,
    backgroundColor: colors.background.primary,
  },
  statCard: {
    alignItems: 'center',
  },
  statNumber: {
    ...typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.primary.main,
  },
  statLabel: {
    ...typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    marginTop: spacing.xs,
  },
  statSubtext: {
    ...typography.sizes.xs,
    color: colors.neutral[600],
  },
  benefitsSection: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing['2xl'],
  },
  sectionTitle: {
    ...typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  benefitCard: {
    width: '48%',
    backgroundColor: colors.background.primary,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.base,
    ...shadows.sm,
  },
  benefitIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.lightest,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  benefitTitle: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  benefitDescription: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    lineHeight: 20,
  },
  requirementsSection: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing['2xl'],
    backgroundColor: colors.background.primary,
  },
  requirementsList: {
    gap: spacing.md,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  requirementText: {
    flex: 1,
    ...typography.sizes.base,
    color: colors.neutral[700],
  },
  howItWorksSection: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing['2xl'],
  },
  stepsList: {
    gap: spacing.xl,
  },
  step: {
    flexDirection: 'row',
    gap: spacing.base,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.background.primary,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  stepDescription: {
    ...typography.sizes.base,
    color: colors.neutral[600],
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  link: {
    ...typography.sizes.base,
    color: colors.primary.main,
    fontWeight: typography.weights.semibold,
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  qrText: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[600],
  },
  qrSubtext: {
    ...typography.sizes.sm,
    color: colors.neutral[500],
    marginTop: spacing.xs,
  },
  ctaSection: {
    backgroundColor: colors.primary.lightest,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing['3xl'],
    alignItems: 'center',
  },
  ctaTitle: {
    ...typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  ctaSubtitle: {
    ...typography.sizes.base,
    color: colors.neutral[600],
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  ctaNote: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    marginTop: spacing.md,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
  footerText: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    marginBottom: spacing.md,
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  footerLink: {
    ...typography.sizes.sm,
    color: colors.primary.main,
    fontWeight: typography.weights.medium,
  },
  footerSeparator: {
    ...typography.sizes.sm,
    color: colors.neutral[400],
  },
});
