import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../../src/constants/theme';
import { Button } from '../../../src/components/Button';
import { useAuth } from '../../../src/contexts/AuthContext';

export default function CustomerRegisterStep5() {
  const router = useRouter();
  const { user, isHydrated, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [registrationConfirmed, setRegistrationConfirmed] = useState(false);

  // Redirect to dashboard ONLY after confirmation
  useEffect(() => {
    if (!registrationConfirmed) return;
    if (!isHydrated || !isAuthenticated || !user?.role) return;

    console.log('Registration confirmed - redirecting to dashboard');
    if (user.role === 'customer') {
      router.replace('/(customer)/dashboard');
    } else {
      router.replace('/auth/welcome');
    }
  }, [registrationConfirmed, isHydrated, isAuthenticated, user, router]);

  const handleConfirm = () => {
    setIsLoading(true);
    setRegistrationConfirmed(true);
  };

  if (!isHydrated || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Loading your profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
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

        <View style={styles.titleSection}>
          <View style={styles.iconBadge}>
            <Ionicons name="checkmark-circle" size={48} color={colors.success.main} />
          </View>
          <Text style={styles.title}>Welcome to the Platform!</Text>
          <Text style={styles.subtitle}>
            As a customer, you can easily request jobs, review proposals, and manage your home service needs all in one place.
          </Text>
        </View>

        <View style={styles.reviewSection}>
          <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <Ionicons name="person" size={24} color={colors.brand.navy} />
              <Text style={styles.reviewTitle}>Personal Information</Text>
            </View>
            <Text style={styles.reviewItem}>Name: {user.firstName} {user.lastName}</Text>
            <Text style={styles.reviewItem}>Email: {user.email}</Text>
            <Text style={styles.reviewItem}>Phone: {user.phone || 'Not set'}</Text>
          </View>

          <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <Ionicons name="location" size={24} color={colors.brand.navy} />
              <Text style={styles.reviewTitle}>Service Address</Text>
            </View>
            {user.addresses && user.addresses.length > 0 ? (
              <>
                <Text style={styles.reviewItem}>{user.addresses[0].street}</Text>
                <Text style={styles.reviewItem}>
                  {user.addresses[0].city}, {user.addresses[0].state} {user.addresses[0].zipCode}
                </Text>
              </>
            ) : (
              <Text style={styles.reviewItem}>No address set</Text>
            )}
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons name="information-circle" size={24} color={colors.primary.main} />
              <Text style={styles.infoTitle}>How It Works</Text>
            </View>
            <Text style={styles.infoItem}>1. Post a job request with photos and details</Text>
            <Text style={styles.infoItem}>2. Receive proposals from qualified service providers</Text>
            <Text style={styles.infoItem}>3. Review profiles, ratings, and quotes</Text>
            <Text style={styles.infoItem}>4. Choose the best provider for your needs</Text>
            <Text style={styles.infoItem}>5. Track progress and release payment when satisfied</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            title="Confirm & Enter Dashboard"
            onPress={handleConfirm}
            loading={isLoading}
            size="large"
            fullWidth
          />
          <Button
            title="Back"
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
    marginBottom: spacing.md,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  iconBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.success.lightest,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.sizes.base,
    color: colors.neutral[600],
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.lg,
  },
  reviewSection: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  reviewCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  reviewTitle: {
    flex: 1,
    ...typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.brand.navy,
  },
  reviewItem: {
    ...typography.sizes.base,
    color: colors.neutral[700],
    marginBottom: spacing.xs,
    lineHeight: 22,
  },
  infoCard: {
    backgroundColor: colors.primary.lightest,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.primary.main,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary.light,
  },
  infoTitle: {
    flex: 1,
    ...typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.primary.main,
  },
  infoItem: {
    ...typography.sizes.base,
    color: colors.neutral[800],
    marginBottom: spacing.sm,
    lineHeight: 22,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorText: {
    ...typography.sizes.lg,
    color: colors.neutral[600],
    textAlign: 'center',
  },
  actions: {
    gap: spacing.md,
  },
});
