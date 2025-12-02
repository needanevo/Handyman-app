import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../../src/constants/theme';
import { Button } from '../../../src/components/Button';
import { Input } from '../../../src/components/Input';
import { authAPI } from '../../../src/services/api';
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

export default function HandymanRegisterStep1() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<Step1Form>();

  const password = watch('password');

  const onSubmit = async (data: Step1Form) => {
    if (data.password !== data.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authAPI.register({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: 'handyman',
        businessName: data.businessName,
        marketingOptIn: false,
      });

      await login(response.access_token, response.refresh_token);

      router.push({
        pathname: '/auth/handyman/register-step2',
        params: {
          firstName: data.firstName,
          businessName: data.businessName,
        },
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      alert(error.response?.data?.detail || 'Registration failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
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

          <View style={styles.progressBar}>
            <View style={[styles.progressSegment, styles.progressActive]} />
            <View style={styles.progressSegment} />
            <View style={styles.progressSegment} />
            <View style={styles.progressSegment} />
          </View>

          <View style={styles.titleSection}>
            <View style={styles.iconBadge}>
              <Ionicons name="person" size={32} color="#FFA500" />
            </View>
            <Text style={styles.title}>About You</Text>
            <Text style={styles.subtitle}>
              Basic info to get you started. Takes 2 minutes.
            </Text>
          </View>

          <View style={styles.formSection}>
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Controller
                  control={control}
                  name="firstName"
                  rules={{ required: 'First name required' }}
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="First Name"
                      value={value}
                      onChangeText={onChange}
                      placeholder="John"
                      error={errors.firstName?.message}
                      required
                      autoComplete="name-given"
                      textContentType="givenName"
                    />
                  )}
                />
              </View>
              <View style={styles.halfInput}>
                <Controller
                  control={control}
                  name="lastName"
                  rules={{ required: 'Last name required' }}
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="Last Name"
                      value={value}
                      onChangeText={onChange}
                      placeholder="Smith"
                      error={errors.lastName?.message}
                      required
                      autoComplete="name-family"
                      textContentType="familyName"
                    />
                  )}
                />
              </View>
            </View>

            <Controller
              control={control}
              name="email"
              rules={{
                required: 'Email required',
                pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' },
              }}
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Email"
                  value={value}
                  onChangeText={onChange}
                  placeholder="john@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.email?.message}
                  required
                  icon="mail-outline"
                  autoComplete="email"
                  textContentType="emailAddress"
                />
              )}
            />

            <Controller
              control={control}
              name="phone"
              rules={{
                required: 'Phone required',
                pattern: { value: /^\d{10}$/, message: '10 digits required' },
              }}
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Phone"
                  value={value}
                  onChangeText={onChange}
                  placeholder="4105551234"
                  keyboardType="phone-pad"
                  error={errors.phone?.message}
                  required
                  icon="call-outline"
                  helpText="10 digits, no spaces or dashes"
                  autoComplete="tel"
                  textContentType="telephoneNumber"
                />
              )}
            />

            <Controller
              control={control}
              name="businessName"
              rules={{ required: 'Business name required' }}
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Business Name"
                  value={value}
                  onChangeText={onChange}
                  placeholder="John's Handyman Services"
                  error={errors.businessName?.message}
                  required
                  icon="business-outline"
                  helpText="What customers will see"
                  autoComplete="organization"
                  textContentType="organizationName"
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              rules={{
                required: 'Password required',
                minLength: { value: 8, message: 'Minimum 8 characters' },
              }}
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Password"
                  value={value}
                  onChangeText={onChange}
                  placeholder="Minimum 8 characters"
                  secureTextEntry
                  error={errors.password?.message}
                  required
                  icon="lock-closed-outline"
                  autoComplete="password-new"
                  textContentType="newPassword"
                />
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              rules={{
                required: 'Please confirm password',
                validate: (value) => value === password || 'Passwords must match',
              }}
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Confirm Password"
                  value={value}
                  onChangeText={onChange}
                  placeholder="Re-enter password"
                  secureTextEntry
                  error={errors.confirmPassword?.message}
                  required
                  icon="lock-closed-outline"
                  autoComplete="password-new"
                  textContentType="newPassword"
                />
              )}
            />
          </View>

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
  progressBar: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    backgroundColor: colors.neutral[200],
    borderRadius: 2,
  },
  progressActive: {
    backgroundColor: '#FFA500',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  iconBadge: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.full,
    backgroundColor: '#FFA50020',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.sizes.base,
    color: colors.neutral[600],
    textAlign: 'center',
    lineHeight: 24,
  },
  formSection: {
    gap: spacing.base,
    marginBottom: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.base,
  },
  halfInput: {
    flex: 1,
  },
  actions: {
    gap: spacing.md,
  },
});
