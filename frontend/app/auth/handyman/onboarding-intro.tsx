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

export default function HandymanOnboardingIntro() {
  const router = useRouter();

  const benefits = [
    {
      icon: 'rocket-outline',
      title: 'Start Immediately',
      description: 'No license required. If you can do the work, you can start earning today.',
    },
    {
      icon: 'cash-outline',
      title: 'Keep What You Earn',
      description: 'Stop giving 40-60% to a boss. Build YOUR business, keep YOUR money.',
    },
    {
      icon: 'trending-up-outline',
      title: 'Grow Your Way',
      description: 'Start solo, form an LLC, get licensed - we guide you every step.',
    },
    {
      icon: 'star-outline',
      title: 'Build Reputation',
      description: 'Every good job builds your rating. Good work = more opportunities.',
    },
  ];

  const handleContinue = () => {
    router.push('/auth/handyman/register-step1');
  };

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
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/images/logos/bw/Handyman_logo_bw.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <View style={styles.iconBadge}>
            <Ionicons name="hammer" size={40} color="#FFA500" />
          </View>
          <Text style={styles.title}>Start Your Own Business</Text>
          <Text style={styles.subtitle}>
            You know the work. You can do the job. Now keep what you earn.
          </Text>
        </View>

        {/* Empowerment Message */}
        <Card variant="elevated" padding="lg" style={styles.messageCard}>
          <View style={styles.messageHeader}>
            <Ionicons name="megaphone" size={28} color="#FFA500" />
            <Text style={styles.messageTitle}>The Truth About Blue Collar Work</Text>
          </View>
          <Text style={styles.messageText}>
            You're the one fixing the sink. You're the one patching the drywall. You're the one doing the actual work.
          </Text>
          <Text style={styles.messageText}>
            So why is someone else taking 50% of what the customer pays?
          </Text>
          <Text style={[styles.messageText, styles.messageHighlight]}>
            It's time to work for yourself. Build YOUR reputation. Grow YOUR business.
          </Text>
        </Card>

        {/* Benefits Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What You Get</Text>
          <View style={styles.benefitsGrid}>
            {benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitCard}>
                <View style={styles.benefitIcon}>
                  <Ionicons name={benefit.icon as any} size={32} color="#FFA500" />
                </View>
                <Text style={styles.benefitTitle}>{benefit.title}</Text>
                <Text style={styles.benefitDescription}>{benefit.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Growth Path */}
        <Card variant="flat" padding="lg" style={styles.growthCard}>
          <View style={styles.growthHeader}>
            <Ionicons name="bar-chart" size={24} color={colors.success.main} />
            <Text style={styles.growthTitle}>Your Growth Path</Text>
          </View>
          <View style={styles.growthSteps}>
            <View style={styles.growthStep}>
              <View style={[styles.stepNumber, { backgroundColor: '#FFA50020' }]}>
                <Text style={[styles.stepNumberText, { color: '#FFA500' }]}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Start as Handyman</Text>
                <Text style={styles.stepDescription}>
                  No LLC, no license needed. Just skills and good work ethic.
                </Text>
              </View>
            </View>

            <View style={styles.growthStep}>
              <View style={[styles.stepNumber, { backgroundColor: colors.primary.lightest }]}>
                <Text style={[styles.stepNumberText, { color: colors.primary.main }]}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Form Your LLC</Text>
                <Text style={styles.stepDescription}>
                  We'll guide you. Protect your assets, look professional.
                </Text>
              </View>
            </View>

            <View style={styles.growthStep}>
              <View style={[styles.stepNumber, { backgroundColor: colors.success.lightest }]}>
                <Text style={[styles.stepNumberText, { color: colors.success.main }]}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Get Licensed & Insured</Text>
                <Text style={styles.stepDescription}>
                  Upgrade to premium pricing. Take on bigger jobs.
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Requirements */}
        <Card variant="outlined" padding="base" style={styles.requirementsCard}>
          <Text style={styles.requirementsTitle}>What You Need to Start</Text>
          <View style={styles.requirementsList}>
            <View style={styles.requirementItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success.main} />
              <Text style={styles.requirementText}>18+ years old</Text>
            </View>
            <View style={styles.requirementItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success.main} />
              <Text style={styles.requirementText}>Valid phone number</Text>
            </View>
            <View style={styles.requirementItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success.main} />
              <Text style={styles.requirementText}>Bank account for payouts</Text>
            </View>
            <View style={styles.requirementItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success.main} />
              <Text style={styles.requirementText}>Skills in at least one trade</Text>
            </View>
          </View>
        </Card>

        {/* CTA */}
        <View style={styles.ctaSection}>
          <Button
            title="Start My Business"
            onPress={handleContinue}
            size="large"
            fullWidth
            style={styles.ctaButton}
          />
          <Text style={styles.ctaSubtext}>
            Takes 5 minutes. Start getting jobs today.
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
  content: {
    flexGrow: 1,
    paddingBottom: spacing['2xl'],
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    marginBottom: spacing.md,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  hero: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing['2xl'],
  },
  logoContainer: {
    marginBottom: spacing.base,
  },
  logo: {
    width: 80,
    height: 80,
  },
  iconBadge: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: '#FFA50020',
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
  messageCard: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    borderLeftWidth: 4,
    borderLeftColor: '#FFA500',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  messageTitle: {
    ...typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    flex: 1,
  },
  messageText: {
    ...typography.sizes.base,
    color: colors.neutral[700],
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  messageHighlight: {
    color: '#FFA500',
    fontWeight: typography.weights.semibold,
    fontSize: 17,
  },
  section: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    marginBottom: spacing.lg,
  },
  benefitsGrid: {
    gap: spacing.base,
  },
  benefitCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    ...shadows.sm,
  },
  benefitIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: '#FFA50020',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  benefitTitle: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  benefitDescription: {
    ...typography.sizes.base,
    color: colors.neutral[600],
    lineHeight: 22,
  },
  growthCard: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  growthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  growthTitle: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
  },
  growthSteps: {
    gap: spacing.lg,
  },
  growthStep: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.bold,
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
  stepDescription: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    lineHeight: 20,
  },
  requirementsCard: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  requirementsTitle: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.lg,
  },
  requirementsList: {
    gap: spacing.md,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  requirementText: {
    ...typography.sizes.base,
    color: colors.neutral[700],
  },
  ctaSection: {
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  ctaButton: {
    marginBottom: spacing.md,
  },
  ctaSubtext: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    textAlign: 'center',
  },
});
