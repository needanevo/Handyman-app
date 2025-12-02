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
import { colors, spacing, typography, borderRadius, shadows } from '../../../src/constants/theme';
import { useAuth } from '../../../src/contexts/AuthContext';

export default function GrowthCenter() {
  const router = useRouter();
  const { user } = useAuth();

  // TODO: Replace dummy values by fetching from backend: GET /api/contractor/growth

  const currentLevel = 1;
  const hasLLC = false;
  const isLicensed = false;
  const isInsured = false;
  const jobsCompleted = 2;
  const currentRating = 4.5;
  const recommendedPriceIncrease = 20; // percentage

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(contractor)/dashboard')}>
          <Ionicons name="arrow-back" size={24} color={colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Growth Center</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Growth Ladder Visualization */}
        <View style={styles.ladderCard}>
          <Text style={styles.ladderTitle}>Your Growth Ladder</Text>
          <Text style={styles.ladderSubtitle}>
            Build your business step by step. Escape wage slavery.
          </Text>

          <View style={styles.ladder}>
            {/* Level 3: Licensed Contractor */}
            <View style={[styles.ladderStep, !isLicensed && styles.ladderStepInactive]}>
              <View
                style={[
                  styles.ladderNumber,
                  isLicensed ? styles.ladderNumberActive : styles.ladderNumberInactive,
                ]}
              >
                <Text
                  style={[
                    styles.ladderNumberText,
                    isLicensed && styles.ladderNumberTextActive,
                  ]}
                >
                  3
                </Text>
              </View>
              <View style={styles.ladderContent}>
                <Text
                  style={[
                    styles.ladderStepTitle,
                    !isLicensed && styles.ladderStepTitleInactive,
                  ]}
                >
                  Licensed Contractor
                </Text>
                <Text style={styles.ladderStepDesc}>
                  Get trade license, raise prices, bigger jobs
                </Text>
              </View>
              {isLicensed && (
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              )}
            </View>

            {/* Level 2: LLC Formation */}
            <View style={[styles.ladderStep, !hasLLC && styles.ladderStepInactive]}>
              <View
                style={[
                  styles.ladderNumber,
                  hasLLC ? styles.ladderNumberActive : styles.ladderNumberInactive,
                ]}
              >
                <Text
                  style={[
                    styles.ladderNumberText,
                    hasLLC && styles.ladderNumberTextActive,
                  ]}
                >
                  2
                </Text>
              </View>
              <View style={styles.ladderContent}>
                <Text
                  style={[
                    styles.ladderStepTitle,
                    !hasLLC && styles.ladderStepTitleInactive,
                  ]}
                >
                  Form an LLC
                </Text>
                <Text style={styles.ladderStepDesc}>
                  Protect personal assets, look professional
                </Text>
              </View>
              {hasLLC && <Ionicons name="checkmark-circle" size={24} color="#10B981" />}
            </View>

            {/* Level 1: Handyman (Current) */}
            <View style={styles.ladderStep}>
              <View style={[styles.ladderNumber, styles.ladderNumberActive]}>
                <Text style={[styles.ladderNumberText, styles.ladderNumberTextActive]}>
                  1
                </Text>
              </View>
              <View style={styles.ladderContent}>
                <Text style={styles.ladderStepTitle}>Handyman (You are here)</Text>
                <Text style={styles.ladderStepDesc}>
                  Build reputation, complete jobs, earn money
                </Text>
              </View>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            </View>
          </View>
        </View>

        {/* Action Cards */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Next Steps</Text>

          {/* LLC Card */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(handyman)/growth/llc')}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="briefcase" size={32} color="#FFA500" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Form an LLC</Text>
              <Text style={styles.actionDescription}>
                Protect your personal assets and look professional to customers.
              </Text>
              <View style={styles.actionMeta}>
                <Ionicons name="time" size={14} color={colors.neutral[600]} />
                <Text style={styles.actionMetaText}>Takes 1-2 weeks • $50-200</Text>
              </View>
            </View>
            <Ionicons name="arrow-forward" size={20} color="#FFA500" />
          </TouchableOpacity>

          {/* License Card */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(handyman)/growth/license')}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="ribbon" size={32} color="#FFA500" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Get Licensed</Text>
              <Text style={styles.actionDescription}>
                Become a licensed contractor and charge higher rates.
              </Text>
              <View style={styles.actionMeta}>
                <Ionicons name="time" size={14} color={colors.neutral[600]} />
                <Text style={styles.actionMetaText}>Varies by state • Study required</Text>
              </View>
            </View>
            <Ionicons name="arrow-forward" size={20} color="#FFA500" />
          </TouchableOpacity>

          {/* Insurance Card */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(handyman)/growth/insurance')}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="shield-checkmark" size={32} color="#FFA500" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Add Insurance</Text>
              <Text style={styles.actionDescription}>
                General liability insurance gives customers confidence.
              </Text>
              <View style={styles.actionMeta}>
                <Ionicons name="cash" size={14} color={colors.neutral[600]} />
                <Text style={styles.actionMetaText}>$500-1200/year</Text>
              </View>
            </View>
            <Ionicons name="arrow-forward" size={20} color="#FFA500" />
          </TouchableOpacity>

          {/* Raise Prices Card */}
          <View style={styles.priceCard}>
            <View style={styles.priceHeader}>
              <Ionicons name="trending-up" size={24} color="#FFA500" />
              <Text style={styles.priceTitle}>Raise Your Prices</Text>
            </View>
            <Text style={styles.priceDescription}>
              Based on your {currentRating}★ rating and {jobsCompleted} completed jobs,
              you can raise prices by {recommendedPriceIncrease}%.
            </Text>
            <TouchableOpacity style={styles.priceButton}>
              <Text style={styles.priceButtonText}>Update My Rates</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Philosophy Section */}
        <View style={styles.philosophyCard}>
          <Text style={styles.philosophyTitle}>Why Growth Matters</Text>
          <Text style={styles.philosophyText}>
            You're not just fixing sinks—you're building a business. Every job brings you
            closer to financial independence. Don't let anyone take 40-60% of your labor.
            This is YOUR path to ownership.
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
  ladderCard: {
    backgroundColor: '#FFA50010',
    borderRadius: borderRadius.xl,
    padding: spacing.base,
    borderWidth: 2,
    borderColor: '#FFA50030',
  },
  ladderTitle: {
    ...typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  ladderSubtitle: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    marginBottom: spacing.lg,
  },
  ladder: {
    gap: spacing.base,
  },
  ladderStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
  },
  ladderStepInactive: {
    opacity: 0.6,
  },
  ladderNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ladderNumberActive: {
    backgroundColor: '#FFA500',
  },
  ladderNumberInactive: {
    backgroundColor: colors.neutral[300],
  },
  ladderNumberText: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  ladderNumberTextActive: {
    color: '#FFF',
  },
  ladderContent: {
    flex: 1,
  },
  ladderStepTitle: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
  },
  ladderStepTitleInactive: {
    color: colors.neutral[600],
  },
  ladderStepDesc: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
  },
  actionsSection: {
    gap: spacing.base,
  },
  sectionTitle: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    ...shadows.sm,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    backgroundColor: '#FFA50020',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  actionDescription: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    marginBottom: spacing.xs,
  },
  actionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionMetaText: {
    ...typography.sizes.xs,
    color: colors.neutral[600],
  },
  priceCard: {
    backgroundColor: '#FFA50020',
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: '#FFA500',
  },
  priceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  priceTitle: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
  },
  priceDescription: {
    ...typography.sizes.sm,
    color: colors.neutral[700],
    marginBottom: spacing.base,
  },
  priceButton: {
    backgroundColor: '#FFA500',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  priceButtonText: {
    ...typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: '#FFF',
  },
  philosophyCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
  },
  philosophyTitle: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.sm,
  },
  philosophyText: {
    ...typography.sizes.sm,
    color: colors.neutral[700],
    lineHeight: 20,
  },
});
