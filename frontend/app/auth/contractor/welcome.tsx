import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.iconContainer}>
            <Ionicons name="checkmark-circle" size={80} color={colors.success} />
          </View>

          <Text style={styles.welcomeTitle}>
            Welcome to The Real Johnson!
          </Text>

          {user?.firstName && (
            <Text style={styles.personalizedGreeting}>
              Welcome, {user.firstName}!
            </Text>
          )}

          <Text style={styles.heroSubtitle}>
            You're all set to start growing your business
          </Text>
        </View>

        {/* Feature Showcase */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Your Business Toolkit</Text>
          <Text style={styles.sectionSubtitle}>
            Everything you need to run a professional handyman business
          </Text>

          <View style={styles.featuresGrid}>
            {FEATURES.map((feature) => (
              <View key={feature.id} style={styles.featureCard}>
                <View style={styles.featureIconContainer}>
                  <Ionicons
                    name={feature.icon}
                    size={32}
                    color={colors.primary}
                  />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>
                  {feature.description}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Call to Action Section */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaText}>Ready to take your first job?</Text>

          <Button
            title="Go to Dashboard"
            onPress={handleGoToDashboard}
            style={styles.primaryButton}
          />

          <TouchableOpacity
            onPress={handleWatchTutorial}
            style={styles.secondaryButton}
          >
            <Ionicons name="play-circle-outline" size={20} color={colors.primary} />
            <Text style={styles.secondaryButtonText}>Watch Tutorial</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },

  // Hero Section
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    backgroundColor: colors.white,
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
    fontFamily: typography.bold,
  },
  personalizedGreeting: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
    fontFamily: typography.semibold,
  },
  heroSubtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    fontFamily: typography.regular,
    lineHeight: 26,
  },

  // Features Section
  featuresSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    fontFamily: typography.bold,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    fontFamily: typography.regular,
    lineHeight: 22,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  featureCard: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  featureIconContainer: {
    marginBottom: spacing.md,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.xs,
    fontFamily: typography.bold,
  },
  featureDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    fontFamily: typography.regular,
  },

  // CTA Section
  ctaSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xl,
    textAlign: 'center',
    fontFamily: typography.semibold,
  },
  primaryButton: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  secondaryButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
    fontFamily: typography.semibold,
  },

  // Bottom Spacing
  bottomSpacer: {
    height: spacing.xl,
  },
});
