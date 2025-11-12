import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../../src/constants/theme';
import { Button } from '../../../src/components/Button';
import { StepIndicator } from '../../../src/components/StepIndicator';
import { PhotoUploader } from '../../../src/components/PhotoUploader';
import { Card } from '../../../src/components/Card';

export default function ContractorRegisterStep2() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [driversLicense, setDriversLicense] = useState<string[]>([]);
  const [businessLicenses, setBusinessLicenses] = useState<string[]>([]);
  const [insurance, setInsurance] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const onContinue = () => {
    if (driversLicense.length === 0) {
      alert("Please upload your driver's license");
      return;
    }

    router.push({
      pathname: '/auth/contractor/register-step3',
      params: {
        ...params,
        driversLicense: JSON.stringify(driversLicense),
        businessLicenses: JSON.stringify(businessLicenses),
        insurance: JSON.stringify(insurance),
      },
    });
  };

  const steps = [
    { label: 'Basic Info', completed: true },
    { label: 'Documents', completed: false },
    { label: 'Profile', completed: false },
    { label: 'Portfolio', completed: false },
  ];

  const handleStepPress = (stepIndex: number) => {
    if (stepIndex === 0) {
      // Navigate back to step 1
      router.push({
        pathname: '/auth/contractor/register-step1',
        params,
      });
    } else if (stepIndex > 1) {
      // Prevent navigation forward
      Alert.alert('Complete Current Step', 'Please complete this step before proceeding to the next.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
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
          <StepIndicator steps={steps} currentStep={1} onStepPress={handleStepPress} />

          {/* Title */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Verification Documents</Text>
            <Text style={styles.subtitle}>
              Upload required documents for identity and business verification
            </Text>
          </View>

          {/* Security Notice */}
          <Card variant="flat" padding="base" style={styles.securityNotice}>
            <View style={styles.noticeContent}>
              <Ionicons name="shield-checkmark" size={24} color={colors.success.main} />
              <View style={styles.noticeText}>
                <Text style={styles.noticeTitle}>Your documents are secure</Text>
                <Text style={styles.noticeDescription}>
                  All documents are encrypted and used only for verification purposes
                </Text>
              </View>
            </View>
          </Card>

          {/* Form */}
          <View style={styles.form}>
            <PhotoUploader
              photos={driversLicense}
              onPhotosChange={setDriversLicense}
              maxPhotos={2}
              label="Driver's License"
              helpText="Front and back of your valid driver's license"
              required
            />

            <View style={styles.divider} />

            <PhotoUploader
              photos={businessLicenses}
              onPhotosChange={setBusinessLicenses}
              maxPhotos={5}
              label="Professional Licenses"
              helpText="Upload any relevant contractor, trade, or business licenses (optional)"
            />

            <View style={styles.divider} />

            <PhotoUploader
              photos={insurance}
              onPhotosChange={setInsurance}
              maxPhotos={3}
              label="Insurance Documentation"
              helpText="Liability insurance, workers compensation (optional but recommended)"
            />
          </View>

          {/* Info Cards */}
          <View style={styles.infoCards}>
            <Card variant="outlined" padding="base">
              <View style={styles.infoCard}>
                <Ionicons name="information-circle" size={24} color={colors.primary.main} />
                <Text style={styles.infoText}>
                  Clear, readable photos help us verify you faster. Make sure all text is visible.
                </Text>
              </View>
            </Card>

            <Card variant="outlined" padding="base">
              <View style={styles.infoCard}>
                <Ionicons name="time" size={24} color={colors.warning.main} />
                <Text style={styles.infoText}>
                  Verification typically takes 1-2 business days. You'll receive an email once approved.
                </Text>
              </View>
            </Card>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              title="Continue"
              onPress={onContinue}
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  keyboardView: {
    flex: 1,
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
    marginBottom: spacing.lg,
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
  securityNotice: {
    marginBottom: spacing.xl,
  },
  noticeContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  noticeText: {
    flex: 1,
  },
  noticeTitle: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  noticeDescription: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    lineHeight: 20,
  },
  form: {
    marginBottom: spacing.xl,
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral[200],
    marginVertical: spacing.xl,
  },
  infoCards: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  infoText: {
    ...typography.sizes.sm,
    color: colors.neutral[700],
    flex: 1,
    lineHeight: 20,
  },
  actions: {
    gap: spacing.md,
  },
});
