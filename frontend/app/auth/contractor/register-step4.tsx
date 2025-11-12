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
import { colors, spacing, typography } from '../../../src/constants/theme';
import { Button } from '../../../src/components/Button';
import { StepIndicator } from '../../../src/components/StepIndicator';
import { PhotoUploader } from '../../../src/components/PhotoUploader';
import { authAPI } from '../../../src/services/api';

export default function ContractorRegisterStep4() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [portfolioPhotos, setPortfolioPhotos] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async () => {
    // User is already registered and logged in from Step 1
    // Portfolio photos are uploaded via PhotoUploader component (already authenticated)
    // Just navigate to contractor dashboard
    
    Alert.alert(
      'Registration Complete',
      'Welcome! Your profile is now complete.',
      [
        {
          text: 'Go to Dashboard',
          onPress: () => router.replace('/(contractor)/dashboard'),
        },
      ]
    );
  };

  const steps = [
    { label: 'Basic Info', completed: true },
    { label: 'Documents', completed: true },
    { label: 'Profile', completed: true },
    { label: 'Portfolio', completed: false },
  ];

  const handleStepPress = (stepIndex: number) => {
    if (stepIndex === 0) {
      router.push({
        pathname: '/auth/contractor/register-step1',
        params,
      });
    } else if (stepIndex === 1) {
      router.push({
        pathname: '/auth/contractor/register-step2',
        params,
      });
    } else if (stepIndex === 2) {
      router.push({
        pathname: '/auth/contractor/register-step3',
        params,
      });
    }
    // Step 3 is current step, no need for alert
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
          <StepIndicator steps={steps} currentStep={3} onStepPress={handleStepPress} />

          {/* Title */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Showcase Your Work</Text>
            <Text style={styles.subtitle}>
              Upload photos of your best work to attract customers (optional)
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <PhotoUploader
              photos={portfolioPhotos}
              onPhotosChange={setPortfolioPhotos}
              maxPhotos={10}
              label="Portfolio Photos"
              helpText="Upload up to 10 photos"
            />
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              title="Complete Registration"
              onPress={onSubmit}
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
    marginBottom: spacing['2xl'],
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
  form: {
    marginBottom: spacing.xl,
  },
  actions: {
    gap: spacing.md,
  },
});
