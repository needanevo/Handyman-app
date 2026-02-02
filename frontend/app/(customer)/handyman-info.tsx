/**
 * Handyman Information Page
 *
 * Explains the difference between contractors and handymen.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../src/constants/theme';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';

export default function HandymanInfoScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Button
          title=""
          onPress={() => router.back()}
          variant="ghost"
          size="small"
          icon={<Ionicons name="arrow-back" size={24} color={colors.primary.main} />}
        />
        <Text style={styles.headerTitle}>About Handymen</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Main Info Card */}
        <Card variant="elevated" padding="lg" style={styles.mainCard}>
          <View style={styles.iconContainer}>
            <Ionicons name="construct" size={48} color={colors.warning.main} />
          </View>

          <Text style={styles.title}>What is a Handyman?</Text>

          <Text style={styles.description}>
            Handymen are skilled professionals who are currently working toward their professional certification and licensing.
            They are supervised and supported as they build their expertise in the field.
          </Text>
        </Card>

        {/* Key Points */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Points</Text>

          <Card variant="outlined" padding="base" style={styles.pointCard}>
            <View style={styles.point}>
              <View style={styles.bulletPoint}>
                <Ionicons name="checkmark-circle" size={24} color={colors.success.main} />
              </View>
              <View style={styles.pointContent}>
                <Text style={styles.pointTitle}>Unlicensed Professionals</Text>
                <Text style={styles.pointText}>
                  Handymen are not yet fully licensed contractors but are actively working toward certification.
                </Text>
              </View>
            </View>
          </Card>

          <Card variant="outlined" padding="base" style={styles.pointCard}>
            <View style={styles.point}>
              <View style={styles.bulletPoint}>
                <Ionicons name="school" size={24} color={colors.primary.main} />
              </View>
              <View style={styles.pointContent}>
                <Text style={styles.pointTitle}>In Training</Text>
                <Text style={styles.pointText}>
                  They are building their skills and experience under guidance while delivering quality work.
                </Text>
              </View>
            </View>
          </Card>

          <Card variant="outlined" padding="base" style={styles.pointCard}>
            <View style={styles.point}>
              <View style={styles.bulletPoint}>
                <Ionicons name="shield-checkmark" size={24} color={colors.warning.main} />
              </View>
              <View style={styles.pointContent}>
                <Text style={styles.pointTitle}>Platform Protection</Text>
                <Text style={styles.pointText}>
                  All handymen are vetted by our platform, and your payments are protected by our escrow system.
                </Text>
              </View>
            </View>
          </Card>

          <Card variant="outlined" padding="base" style={styles.pointCard}>
            <View style={styles.point}>
              <View style={styles.bulletPoint}>
                <Ionicons name="cash" size={24} color={colors.success.main} />
              </View>
              <View style={styles.pointContent}>
                <Text style={styles.pointTitle}>Competitive Rates</Text>
                <Text style={styles.pointText}>
                  Handymen often offer more affordable rates compared to fully licensed contractors.
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Support Card */}
        <Card variant="flat" padding="base" style={styles.supportCard}>
          <View style={styles.supportContent}>
            <Ionicons name="help-circle" size={24} color={colors.primary.main} />
            <View style={styles.supportText}>
              <Text style={styles.supportTitle}>Have Questions?</Text>
              <Text style={styles.supportDescription}>
                Contact our support team if you have concerns about your handyman.
              </Text>
            </View>
            <Button
              title="Contact"
              onPress={() => router.push('/(customer)/support')}
              variant="outline"
              size="small"
            />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  headerTitle: {
    ...typography.headings.h4,
    color: colors.neutral[900],
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  mainCard: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: colors.warning.lightest,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.headings.h3,
    color: colors.neutral[900],
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    ...typography.body.regular,
    color: colors.neutral[700],
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.headings.h5,
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
  pointCard: {
    marginBottom: spacing.md,
  },
  point: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  bulletPoint: {
    marginTop: spacing.xs,
  },
  pointContent: {
    flex: 1,
  },
  pointTitle: {
    ...typography.body.regular,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  pointText: {
    ...typography.body.small,
    color: colors.neutral[600],
    lineHeight: 20,
  },
  supportCard: {
    marginTop: spacing.lg,
  },
  supportContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  supportText: {
    flex: 1,
  },
  supportTitle: {
    ...typography.body.regular,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  supportDescription: {
    ...typography.caption.regular,
    color: colors.neutral[600],
    lineHeight: 20,
  },
});
