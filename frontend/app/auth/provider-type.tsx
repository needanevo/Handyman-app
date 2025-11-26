import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../src/constants/theme';

export default function ProviderTypeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.neutral[900]} />
          </TouchableOpacity>
        </View>

        {/* Logo & Title */}
        <View style={styles.titleSection}>
          <Image
            source={require('../../../assets/images/logos/color/Handyman_logo_color.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Join as a Service Provider</Text>
          <Text style={styles.subtitle}>Tell us about your licensing status</Text>
        </View>

        {/* Provider Type Cards */}
        <View style={styles.cardsContainer}>
          {/* Licensed Contractor Card */}
          <TouchableOpacity
            style={[styles.card, styles.licensedCard]}
            onPress={() => router.push('/auth/contractor/register-step1')}
            activeOpacity={0.7}
          >
            <View style={[styles.iconCircle, { backgroundColor: colors.primary.lightest }]}>
              <Ionicons name="ribbon" size={48} color={colors.primary.main} />
            </View>

            <Text style={styles.cardTitle}>I am licensed</Text>
            <Text style={styles.cardDescription}>
              I have a contractor's license, business insurance, or professional certifications
            </Text>

            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success.main} />
                <Text style={styles.featureText}>Higher pricing tier</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success.main} />
                <Text style={styles.featureText}>Larger job opportunities</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success.main} />
                <Text style={styles.featureText}>Priority placement</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success.main} />
                <Text style={styles.featureText}>Professional badge</Text>
              </View>
            </View>

            <View style={styles.cardButton}>
              <Text style={styles.cardButtonText}>Continue as Licensed Contractor</Text>
              <Ionicons name="arrow-forward" size={20} color={colors.primary.main} />
            </View>
          </TouchableOpacity>

          {/* Unlicensed Handyman Card */}
          <TouchableOpacity
            style={[styles.card, styles.handymanCard]}
            onPress={() => router.push('/auth/handyman/register-step1')}
            activeOpacity={0.7}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#FFA50020' }]}>
              <Ionicons name="hammer" size={48} color="#FFA500" />
            </View>

            <Text style={styles.cardTitle}>I am unlicensed</Text>
            <Text style={styles.cardDescription}>
              I'm starting my handyman business or working toward getting licensed
            </Text>

            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success.main} />
                <Text style={styles.featureText}>Start immediately</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success.main} />
                <Text style={styles.featureText}>Build your reputation</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success.main} />
                <Text style={styles.featureText}>Smaller jobs to start</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success.main} />
                <Text style={styles.featureText}>Grow to licensed contractor</Text>
              </View>
            </View>

            <View style={[styles.cardButton, { backgroundColor: '#FFA50020' }]}>
              <Text style={[styles.cardButtonText, { color: '#FFA500' }]}>Start as Handyman</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFA500" />
            </View>
          </TouchableOpacity>
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
    paddingBottom: spacing.xl,
  },
  header: {
    paddingTop: spacing.md,
    marginBottom: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.sizes.base,
    color: colors.neutral[600],
    textAlign: 'center',
  },
  cardsContainer: {
    gap: spacing.xl,
  },
  card: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    borderWidth: 2,
    borderColor: colors.neutral[200],
    ...shadows.md,
  },
  licensedCard: {
    borderColor: colors.primary.main,
    borderWidth: 2,
  },
  handymanCard: {
    borderColor: '#FFA500',
    borderWidth: 2,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  cardTitle: {
    ...typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  cardDescription: {
    ...typography.sizes.base,
    color: colors.neutral[600],
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  featuresList: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  featureText: {
    ...typography.sizes.base,
    color: colors.neutral[700],
    flex: 1,
  },
  cardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.primary.lightest,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  cardButtonText: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.primary.main,
  },
});
