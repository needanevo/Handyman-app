import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, borderRadius, shadows } from '../../../src/constants/theme';
import { Button } from '../../../src/components/Button';
import { useAuth } from '../../../src/contexts/AuthContext';

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const FEATURES: Feature[] = [
  {
    id: 'ai-estimates',
    title: 'AI Estimates',
    description: 'Smart pricing suggestions powered by AI',
    icon: 'sparkles',
  },
  {
    id: 'quoting',
    title: 'Quoting System',
    description: 'Professional quotes that close deals',
    icon: 'document-text-outline',
  },
  {
    id: 'scheduling',
    title: 'Job Scheduling',
    description: 'Calendar integration and appointment management',
    icon: 'calendar-outline',
  },
  {
    id: 'supply-chain',
    title: 'Supply Chain',
    description: 'Material sourcing and vendor management',
    icon: 'cube-outline',
  },
  {
    id: 'profitability',
    title: 'Profitability Tracking',
    description: 'Real-time profit analysis per job',
    icon: 'trending-up-outline',
  },
  {
    id: 'tax-tools',
    title: 'Tax Tools',
    description: 'Mileage tracking, expense logging, 1099 prep',
    icon: 'calculator-outline',
  },
  {
    id: 'documents',
    title: 'Document Management',
    description: 'Invoices, contracts, and photos',
    icon: 'folder-outline',
  },
  {
    id: 'takeoffs',
    title: 'Takeoffs',
    description: 'Material quantity calculations',
    icon: 'ruler-outline',
  },
  {
    id: 'job-costing',
    title: 'Job Costing',
    description: 'Track labor, materials, and overhead',
    icon: 'cash-outline',
  },
  {
    id: 'change-orders',
    title: 'Change Orders',
    description: 'Handle scope changes professionally',
    icon: 'git-branch-outline',
  },
  {
    id: 'material-lists',
    title: 'Material Lists',
    description: 'Auto-generated shopping lists',
    icon: 'list-outline',
  },
  {
    id: 'communication',
    title: 'Customer Communication',
    description: 'In-app messaging and updates',
    icon: 'chatbubbles-outline',
  },
];

export default function ContractorWelcome() {
  const router = useRouter();
  const { user } = useAuth();

  const handleGoToDashboard = () => {
    router.replace('/(contractor)/dashboard');
  };

  const handleWatchTutorial = () => {
    // Placeholder for future tutorial functionality
    alert('Tutorial feature coming soon!');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section with Gradient Background */}
        <LinearGradient
          colors={[colors.primary.lightest, colors.background.primary]}
          style={styles.heroGradient}
        >
          <View style={styles.heroSection}>
            {/* Success Icon with Animated Glow */}
            <View style={styles.iconContainer}>
              <View style={styles.iconGlowOuter}>
                <View style={styles.iconGlowInner}>
                  <Ionicons name="checkmark-circle" size={80} color={colors.success.main} />
                </View>
              </View>
            </View>

            <Text style={styles.welcomeTitle}>
              Welcome to The Real Johnson!
            </Text>

            {user?.firstName && (
              <View style={styles.greetingCard}>
                <Text style={styles.personalizedGreeting}>
                  Welcome, {user.firstName}!
                </Text>
              </View>
            )}

            <Text style={styles.heroSubtitle}>
              You're all set to start growing your business
            </Text>
          </View>
        </LinearGradient>

        {/* Feature Showcase */}
        <View style={styles.featuresSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Business Toolkit</Text>
            <View style={styles.titleUnderline} />
          </View>
          <Text style={styles.sectionSubtitle}>
            Everything you need to run a professional handyman business
          </Text>

          <View style={styles.featuresGrid}>
            {FEATURES.map((feature, index) => (
              <View key={feature.id} style={styles.featureCard}>
                {/* Gradient Accent Bar */}
                <LinearGradient
                  colors={[colors.primary.main, colors.secondary.main]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.featureAccentBar}
                />

                <View style={styles.featureContent}>
                  <View style={styles.featureIconContainer}>
                    <LinearGradient
                      colors={[colors.primary.lighter, colors.primary.lightest]}
                      style={styles.featureIconBackground}
                    >
                      <Ionicons
                        name={feature.icon}
                        size={28}
                        color={colors.primary.main}
                      />
                    </LinearGradient>
                  </View>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>
                    {feature.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Call to Action Section */}
        <LinearGradient
          colors={[colors.background.primary, colors.secondary.lightest]}
          style={styles.ctaGradient}
        >
          <View style={styles.ctaSection}>
            <View style={styles.ctaBadge}>
              <Ionicons name="rocket" size={24} color={colors.primary.main} />
            </View>

            <Text style={styles.ctaText}>Ready to take your first job?</Text>
            <Text style={styles.ctaSubtext}>
              Start earning and growing your business today
            </Text>

            <Button
              title="Go to Dashboard"
              onPress={handleGoToDashboard}
              style={styles.primaryButton}
            />

            <TouchableOpacity
              onPress={handleWatchTutorial}
              style={styles.secondaryButton}
            >
              <Ionicons name="play-circle-outline" size={20} color={colors.primary.main} />
              <Text style={styles.secondaryButtonText}>Watch Tutorial</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },

  // Hero Section with Gradient
  heroGradient: {
    width: '100%',
  },
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['3xl'],
    paddingBottom: spacing['4xl'],
  },
  iconContainer: {
    marginBottom: spacing.xl,
  },
  iconGlowOuter: {
    backgroundColor: colors.success.lighter,
    borderRadius: borderRadius.full,
    padding: spacing.md,
    ...shadows.md,
  },
  iconGlowInner: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.full,
    padding: spacing.sm,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary.main,
    textAlign: 'center',
    marginBottom: spacing.lg,
    fontFamily: typography.bold,
  },
  greetingCard: {
    backgroundColor: colors.secondary.lightest,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.secondary.lighter,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  personalizedGreeting: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.secondary.main,
    textAlign: 'center',
    fontFamily: typography.semibold,
  },
  heroSubtitle: {
    fontSize: 18,
    color: colors.neutral[600],
    textAlign: 'center',
    fontFamily: typography.regular,
    lineHeight: 26,
    maxWidth: 320,
  },

  // Features Section
  featuresSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['4xl'],
    paddingBottom: spacing.xl,
    backgroundColor: colors.background.primary,
  },
  sectionHeader: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.neutral[900],
    textAlign: 'center',
    fontFamily: typography.bold,
  },
  titleUnderline: {
    width: 60,
    height: 4,
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.sm,
    marginTop: spacing.sm,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: colors.neutral[600],
    marginBottom: spacing['2xl'],
    textAlign: 'center',
    fontFamily: typography.regular,
    lineHeight: 24,
    paddingHorizontal: spacing.md,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  featureCard: {
    width: '48%',
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.neutral[200],
    ...shadows.md,
  },
  featureAccentBar: {
    height: 4,
    width: '100%',
  },
  featureContent: {
    padding: spacing.lg,
  },
  featureIconContainer: {
    marginBottom: spacing.md,
  },
  featureIconBackground: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: spacing.xs,
    fontFamily: typography.bold,
  },
  featureDescription: {
    fontSize: 13,
    color: colors.neutral[600],
    lineHeight: 18,
    fontFamily: typography.regular,
  },

  // CTA Section with Gradient
  ctaGradient: {
    width: '100%',
    marginTop: spacing['2xl'],
  },
  ctaSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing['4xl'],
    alignItems: 'center',
  },
  ctaBadge: {
    backgroundColor: colors.primary.lightest,
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    borderWidth: 3,
    borderColor: colors.primary.lighter,
    ...shadows.md,
  },
  ctaText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: spacing.sm,
    textAlign: 'center',
    fontFamily: typography.bold,
  },
  ctaSubtext: {
    fontSize: 16,
    color: colors.neutral[600],
    marginBottom: spacing['2xl'],
    textAlign: 'center',
    fontFamily: typography.regular,
    lineHeight: 24,
  },
  primaryButton: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.primary.lighter,
    ...shadows.sm,
  },
  secondaryButtonText: {
    fontSize: 16,
    color: colors.primary.main,
    fontWeight: '600',
    fontFamily: typography.semibold,
  },

  // Bottom Spacing
  bottomSpacer: {
    height: spacing.xl,
  },
});
