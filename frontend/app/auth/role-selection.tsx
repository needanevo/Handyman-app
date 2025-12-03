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
import { Button } from '../../src/components/Button';

export default function RoleSelectionScreen() {
  const router = useRouter();

  const handleCustomerSelect = () => {
    router.push('/auth/register?role=customer');
  };

  const handleContractorSelect = () => {
    router.push('/auth/contractor/onboarding-intro');
  };

  const handleHandymanSelect = () => {
    router.push('/auth/handyman/onboarding-intro');
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

        {/* Logo & Title */}
        <View style={styles.titleSection}>
          <Image
            source={require('../../assets/images/logos/color/Handyman_logo_color.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Join The Real Johnson</Text>
          <Text style={styles.subtitle}>Choose how you want to use our platform</Text>
        </View>

        {/* Role Cards */}
        <View style={styles.rolesContainer}>
          {/* Customer Card */}
          <TouchableOpacity
            style={styles.roleCard}
            onPress={handleCustomerSelect}
            activeOpacity={0.7}
          >
            <View style={[styles.iconCircle, { backgroundColor: colors.primary.lightest }]}>
              <Ionicons name="home" size={40} color={colors.primary.main} />
            </View>

            <Text style={styles.roleTitle}>I need repairs</Text>
            <Text style={styles.roleDescription}>
              Get your home fixed by verified professionals
            </Text>

            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success.main} />
                <Text style={styles.featureText}>AI-powered instant quotes</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success.main} />
                <Text style={styles.featureText}>Escrow payment protection</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success.main} />
                <Text style={styles.featureText}>Licensed contractors & handymen</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success.main} />
                <Text style={styles.featureText}>Track job progress</Text>
              </View>
            </View>

            <View style={styles.cardButton}>
              <Text style={styles.cardButtonText}>Continue as Homeowner</Text>
              <Ionicons name="arrow-forward" size={20} color={colors.primary.main} />
            </View>
          </TouchableOpacity>

          {/* Contractor Card */}
          <TouchableOpacity
            style={styles.roleCard}
            onPress={handleContractorSelect}
            activeOpacity={0.7}
          >
            <View style={[styles.iconCircle, { backgroundColor: colors.secondary.lightest }]}>
              <Ionicons name="construct" size={40} color={colors.secondary.main} />
            </View>

            <Text style={styles.roleTitle}>I do repairs</Text>
            <Text style={styles.roleDescription}>
              Find customers and grow your handyman business
            </Text>

            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success.main} />
                <Text style={styles.featureText}>Get matched with jobs</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success.main} />
                <Text style={styles.featureText}>Secure milestone payments</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success.main} />
                <Text style={styles.featureText}>Build your reputation</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success.main} />
                <Text style={styles.featureText}>Showcase your work</Text>
              </View>
            </View>

            <View style={styles.cardButton}>
              <Text style={styles.cardButtonText}>Continue as Contractor</Text>
              <Ionicons name="arrow-forward" size={20} color={colors.primary.main} />
            </View>
          </TouchableOpacity>

          {/* Handyman Card - NEW! */}
          <TouchableOpacity
            style={[styles.roleCard, styles.handymanCard]}
            onPress={handleHandymanSelect}
            activeOpacity={0.7}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#FFA50020' }]}>
              <Ionicons name="hammer" size={40} color="#FFA500" />
            </View>

            <Text style={styles.roleTitle}>I'm starting my business</Text>
            <Text style={styles.roleDescription}>
              Begin as a handyman and grow into a licensed contractor
            </Text>

            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success.main} />
                <Text style={styles.featureText}>No license required to start</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success.main} />
                <Text style={styles.featureText}>Build your reputation</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success.main} />
                <Text style={styles.featureText}>Get jobs immediately</Text>
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

        {/* Login Link */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/auth/login')}>
            <Text style={styles.loginLink}>Sign In</Text>
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
    paddingTop: spacing.sm,
    marginBottom: spacing.md,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: spacing.base,
  },
  title: {
    ...typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body.regular,
    color: colors.neutral[600],
    textAlign: 'center',
  },
  rolesContainer: {
    gap: spacing.lg,
    marginBottom: spacing['2xl'],
  },
  roleCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    borderWidth: 2,
    borderColor: colors.neutral[200],
    ...shadows.md,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  roleTitle: {
    ...typography.headings.h2,
    color: colors.neutral[900],
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  roleDescription: {
    ...typography.body.regular,
    color: colors.neutral[600],
    textAlign: 'center',
    marginBottom: spacing.xl,
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
    ...typography.body.regular,
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
    ...typography.button.large,
    color: colors.primary.main,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  loginText: {
    ...typography.body.regular,
    color: colors.neutral[600],
  },
  loginLink: {
    ...typography.body.regular,
    color: colors.primary.main,
    fontWeight: typography.weights.semibold,
  },
  handymanCard: {
    borderColor: '#FFA500',
    borderWidth: 2,
  },
});
