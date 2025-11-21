import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../../src/constants/theme';
import { Button } from '../../../src/components/Button';
import { StepIndicator } from '../../../src/components/StepIndicator';
import { useAuth } from '../../../src/contexts/AuthContext';

export default function ContractorRegisterStep5() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();

  const handleComplete = () => {
    // All data already saved by previous steps
    // Navigate to welcome page
    router.replace('/auth/contractor/welcome');
  };

  const steps = [
    { label: 'Basic Info', completed: true },
    { label: 'Documents', completed: true },
    { label: 'Profile', completed: true },
    { label: 'Portfolio', completed: true },
    { label: 'Review', completed: false },
  ];

  const handleStepPress = (stepIndex: number) => {
    const routes = [
      '/auth/contractor/register-step1',
      '/auth/contractor/register-step2',
      '/auth/contractor/register-step3',
      '/auth/contractor/register-step4',
    ];

    if (stepIndex < 4) {
      router.push({
        pathname: routes[stepIndex] as any,
        params,
      });
    }
  };

  // Extract user data for display
  const businessAddress = user?.addresses?.find(addr => addr.isDefault) || user?.addresses?.[0];
  const documents = {
    license: user?.documents?.license || null,
    insurance: user?.documents?.insurance || null,
    businessLicense: user?.documents?.businessLicense || null,
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

        {/* Progress */}
        <StepIndicator steps={steps} currentStep={4} onStepPress={handleStepPress} />

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Review Your Registration</Text>
          <Text style={styles.subtitle}>
            Please review all information before completing your registration
          </Text>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>

          {/* Personal Information Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <Ionicons name="person" size={24} color={colors.primary.main} />
                <Text style={styles.cardTitle}>Personal Information</Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push({ pathname: '/auth/contractor/register-step1', params })}
              >
                <Text style={styles.editButton}>Edit</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.cardContent}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Name:</Text>
                <Text style={styles.infoValue}>{user?.firstName} {user?.lastName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email:</Text>
                <Text style={styles.infoValue}>{user?.email}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Phone:</Text>
                <Text style={styles.infoValue}>{user?.phone}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Business Name:</Text>
                <Text style={styles.infoValue}>{user?.businessName || 'Not provided'}</Text>
              </View>
            </View>
          </View>

          {/* Documents Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <Ionicons name="document-text" size={24} color={colors.primary.main} />
                <Text style={styles.cardTitle}>Documents</Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push({ pathname: '/auth/contractor/register-step2', params })}
              >
                <Text style={styles.editButton}>Edit</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.cardContent}>
              <View style={styles.documentRow}>
                <Text style={styles.infoLabel}>Driver's License:</Text>
                <View style={styles.documentStatus}>
                  <Ionicons
                    name={documents.license ? "checkmark-circle" : "close-circle"}
                    size={20}
                    color={documents.license ? colors.success.main : colors.error.main}
                  />
                  <Text style={[
                    styles.documentStatusText,
                    { color: documents.license ? colors.success.main : colors.error.main }
                  ]}>
                    {documents.license ? 'Uploaded' : 'Not uploaded'}
                  </Text>
                </View>
              </View>
              <View style={styles.documentRow}>
                <Text style={styles.infoLabel}>Insurance:</Text>
                <View style={styles.documentStatus}>
                  <Ionicons
                    name={documents.insurance ? "checkmark-circle" : "close-circle"}
                    size={20}
                    color={documents.insurance ? colors.success.main : colors.error.main}
                  />
                  <Text style={[
                    styles.documentStatusText,
                    { color: documents.insurance ? colors.success.main : colors.error.main }
                  ]}>
                    {documents.insurance ? 'Uploaded' : 'Not uploaded'}
                  </Text>
                </View>
              </View>
              <View style={styles.documentRow}>
                <Text style={styles.infoLabel}>Business License:</Text>
                <View style={styles.documentStatus}>
                  <Ionicons
                    name={documents.businessLicense ? "checkmark-circle" : "close-circle"}
                    size={20}
                    color={documents.businessLicense ? colors.success.main : colors.error.main}
                  />
                  <Text style={[
                    styles.documentStatusText,
                    { color: documents.businessLicense ? colors.success.main : colors.error.main }
                  ]}>
                    {documents.businessLicense ? 'Uploaded' : 'Not uploaded'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Profile Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <Ionicons name="briefcase" size={24} color={colors.primary.main} />
                <Text style={styles.cardTitle}>Profile</Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push({ pathname: '/auth/contractor/register-step3', params })}
              >
                <Text style={styles.editButton}>Edit</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.cardContent}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Skills:</Text>
                <Text style={styles.infoValue}>
                  {user?.skills && user.skills.length > 0
                    ? user.skills.join(', ')
                    : 'Not specified'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Experience:</Text>
                <Text style={styles.infoValue}>
                  {user?.yearsExperience ? `${user.yearsExperience} years` : 'Not specified'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Business Address:</Text>
                <Text style={styles.infoValue}>
                  {businessAddress
                    ? `${businessAddress.street}, ${businessAddress.city}, ${businessAddress.state} ${businessAddress.zipCode}`
                    : 'Not provided'}
                </Text>
              </View>
              {businessAddress?.latitude && businessAddress?.longitude && (
                <View style={styles.coordinatesRow}>
                  <Ionicons name="location" size={16} color={colors.success.main} />
                  <Text style={styles.coordinatesText}>
                    Verified: {businessAddress.latitude.toFixed(4)}, {businessAddress.longitude.toFixed(4)}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Portfolio Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <Ionicons name="images" size={24} color={colors.primary.main} />
                <Text style={styles.cardTitle}>Portfolio</Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push({ pathname: '/auth/contractor/register-step4', params })}
              >
                <Text style={styles.editButton}>Edit</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.cardContent}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Photos Uploaded:</Text>
                <Text style={styles.infoValue}>
                  {user?.portfolioPhotos && user.portfolioPhotos.length > 0
                    ? `${user.portfolioPhotos.length} photo${user.portfolioPhotos.length > 1 ? 's' : ''}`
                    : 'No photos uploaded'}
                </Text>
              </View>
            </View>
          </View>

        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Confirm & Complete Registration"
            onPress={handleComplete}
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
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.sizes.base,
    color: colors.neutral[600],
    lineHeight: 24,
  },
  summaryContainer: {
    marginBottom: spacing.xl,
    gap: spacing.lg,
  },
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardTitle: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
  },
  editButton: {
    ...typography.sizes.sm,
    color: colors.primary.main,
    fontWeight: typography.weights.semibold,
  },
  cardContent: {
    gap: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  infoLabel: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    fontWeight: typography.weights.medium,
    flex: 1,
  },
  infoValue: {
    ...typography.sizes.sm,
    color: colors.neutral[900],
    fontWeight: typography.weights.medium,
    flex: 2,
    textAlign: 'right',
  },
  documentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  documentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  documentStatusText: {
    ...typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  coordinatesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  coordinatesText: {
    ...typography.sizes.xs,
    color: colors.neutral[600],
    fontFamily: 'monospace',
  },
  actions: {
    gap: spacing.md,
  },
});
