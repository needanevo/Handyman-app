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
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../../src/constants/theme';
import { Button } from '../../../src/components/Button';
import { Input } from '../../../src/components/Input';
import { StepIndicator } from '../../../src/components/StepIndicator';
import { useAuth } from '../../../src/contexts/AuthContext';

interface Step1Form {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  businessName: string;
  password: string;
  confirmPassword: string;
}

export default function ContractorRegisterStep1() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Step1Form>();

  const { register } = useAuth();

  const onSubmit = async (data: Step1Form) => {
    // Validate passwords match
    if (data.password !== data.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      // Register the user immediately with basic info
      // The register function from AuthContext handles token storage and user fetch
      await register({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: 'technician',
      });

      // Navigate to next step (now authenticated for photo uploads)
      router.push({
        pathname: '/auth/contractor/register-step2',
        params: {
          firstName: data.firstName,
          lastName: data.lastName,
          businessName: data.businessName
        },
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      Alert.alert(
        'Registration Failed',
        error.response?.data?.detail || 'Please try again'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { label: 'Basic Info', completed: false },
    { label: 'Documents', completed: false },
    { label: 'Profile', completed: false },
    { label: 'Portfolio', completed: false },
  ];

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
          <StepIndicator steps={steps} currentStep={0} />

          {/* Title */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Basic Information</Text>
            <Text style={styles.subtitle}>
              Let's start with your contact details
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Controller
              control={control}
              name="firstName"
              rules={{ required: 'First name is required' }}
              render={({ field: { onChange, value } }) => (
                <Input
                  label="First Name"
                  value={value}
                  onChangeText={onChange}
                  placeholder="John"
                  autoCapitalize="words"
                  autoComplete="name-given"
                  textContentType="givenName"
                  error={errors.firstName?.message}
                  required
                  icon="person-outline"
                />
              )}
            />

            <Controller
              control={control}
              name="lastName"
              rules={{ required: 'Last name is required' }}
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Last Name"
                  value={value}
                  onChangeText={onChange}
                  placeholder="Doe"
                  autoCapitalize="words"
                  autoComplete="name-family"
                  textContentType="familyName"
                  error={errors.lastName?.message}
                  required
                  icon="person-outline"
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              rules={{
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              }}
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Email Address"
                  value={value}
                  onChangeText={onChange}
                  placeholder="john@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType="emailAddress"
                  error={errors.email?.message}
                  required
                  icon="mail-outline"
                />
              )}
            />

            <Controller
              control={control}
              name="phone"
              rules={{ required: 'Phone number is required' }}
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Phone Number"
                  value={value}
                  onChangeText={onChange}
                  placeholder="(555) 123-4567"
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  textContentType="telephoneNumber"
                  error={errors.phone?.message}
                  required
                  icon="call-outline"
                  helpText="Customers will use this to contact you"
                />
              )}
            />

            <Controller
              control={control}
              name="businessName"
              rules={{ required: 'Business name is required' }}
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Business Name"
                  value={value}
                  onChangeText={onChange}
                  placeholder="Johnson's Handyman Services"
                  autoCapitalize="words"
                  autoComplete="organization"
                  textContentType="organizationName"
                  error={errors.businessName?.message}
                  required
                  icon="briefcase-outline"
                  helpText="Your company name or DBA (Doing Business As)"
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              rules={{ 
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters'
                }
              }}
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Password"
                  value={value}
                  onChangeText={onChange}
                  placeholder="Create a secure password"
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="password-new"
                  textContentType="newPassword"
                  error={errors.password?.message}
                  required
                  icon="lock-closed-outline"
                  helpText="Minimum 8 characters"
                />
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              rules={{ 
                required: 'Please confirm your password'
              }}
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Confirm Password"
                  value={value}
                  onChangeText={onChange}
                  placeholder="Re-enter your password"
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="password-new"
                  textContentType="newPassword"
                  error={errors.confirmPassword?.message}
                  required
                  icon="lock-closed-outline"
                />
              )}
            />
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              title="Continue"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              size="large"
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
