import React, { useState, useEffect } from 'react';
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
import { colors, spacing, typography, borderRadius } from '../../../src/constants/theme';
import { Button } from '../../../src/components/Button';
import { Input } from '../../../src/components/Input';
import { StepIndicator } from '../../../src/components/StepIndicator';
import { contractorAPI, authAPI } from '../../../src/services/api';
import { useAuth } from '../../../src/contexts/AuthContext';

interface Step5Form {
  accountHolderName: string;
  routingNumber: string;
  accountNumber: string;
  confirmAccountNumber: string;
}

export default function ContractorRegisterStep5() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
  } = useForm<Step5Form>();

  const accountNumber = watch('accountNumber');

  // Hydrate form with existing banking data
  useEffect(() => {
    console.log('[Step5] useEffect triggered, user:', user ? 'exists' : 'null');

    if (!user) {
      console.log('[Step5] User not available yet, waiting...');
      return;
    }

    const banking = (user as any).banking_info;
    console.log('[Step5] Banking info from user:', banking);

    if (banking) {
      console.log('[Step5] Hydrating banking fields');

      if (banking.account_holder_name) {
        console.log('[Step5] Setting account holder name:', banking.account_holder_name);
        setValue('accountHolderName', banking.account_holder_name);
      }
      if (banking.routing_number) {
        console.log('[Step5] Setting routing number:', banking.routing_number);
        setValue('routingNumber', banking.routing_number);
      }
      if (banking.account_number) {
        console.log('[Step5] Setting account numbers:', banking.account_number);
        setValue('accountNumber', banking.account_number);
        setValue('confirmAccountNumber', banking.account_number);
      }

      console.log('[Step5] Banking form hydration complete');
    } else {
      console.log('[Step5] No banking info found in user data');
    }
  }, [user, setValue]);

  const onSubmit = async (data: Step5Form) => {
    if (data.accountNumber !== data.confirmAccountNumber) {
      Alert.alert('Error', 'Account numbers do not match');
      return;
    }

    try {
      setIsLoading(true);

      // Save the bank info to user profile
      await contractorAPI.updateProfile({
        banking_info: {
          account_holder_name: data.accountHolderName,
          routing_number: data.routingNumber,
          account_number: data.accountNumber,
          verified: false, // Will be verified by Stripe/payment processor
        },
      } as any);

      // Refresh user context
      try {
        await refreshUser();
      } catch (refreshError) {
        console.warn('Failed to refresh user after save, continuing anyway:', refreshError);
      }

      // Track onboarding step completion
      try {
        await authAPI.updateOnboardingStep(5);
        console.log('Step 5 progress saved');
      } catch (stepError) {
        console.warn('Failed to save step progress:', stepError);
      }

      // Navigate to Step 6 (Review)
      router.push('/auth/contractor/register-step6');
    } catch (error) {
      console.error('Banking setup error:', error);
      Alert.alert('Error', 'Failed to save banking information. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { label: 'Basic Info', completed: true },
    { label: 'Documents', completed: true },
    { label: 'Profile', completed: true },
    { label: 'Portfolio', completed: true },
    { label: 'Banking', completed: false },
    { label: 'Review', completed: false },
  ];

  const handleStepPress = (stepIndex: number) => {
    if (stepIndex === 0) router.push('/auth/contractor/register-step1');
    else if (stepIndex === 1) router.push('/auth/contractor/register-step2');
    else if (stepIndex === 2) router.push('/auth/contractor/register-step3');
    else if (stepIndex === 3) router.push('/auth/contractor/register-step4');
    // Step 4 (Banking) is current step
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

          <StepIndicator steps={steps} currentStep={4} onStepPress={handleStepPress} />

          <View style={styles.titleSection}>
            <View style={styles.iconBadge}>
              <Ionicons name="card" size={32} color={colors.primary.main} />
            </View>
            <Text style={styles.title}>Get Paid</Text>
            <Text style={styles.subtitle}>
              Set up your bank account for direct deposits
            </Text>
          </View>

          <View style={styles.securityCard}>
            <Ionicons name="lock-closed" size={24} color="#10B981" />
            <View style={styles.securityText}>
              <Text style={styles.securityTitle}>Bank-level security</Text>
              <Text style={styles.securityDescription}>
                Your banking information is encrypted and never shared.
                We use Stripe for secure payment processing.
              </Text>
            </View>
          </View>

          <View style={styles.formSection}>
            <Controller
              control={control}
              name="accountHolderName"
              rules={{ required: 'Account holder name required' }}
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Account Holder Name"
                  value={value}
                  onChangeText={onChange}
                  placeholder="John Smith"
                  error={errors.accountHolderName?.message}
                  required
                  icon="person-outline"
                  helpText="Full name as it appears on your bank account"
                />
              )}
            />

            <Controller
              control={control}
              name="routingNumber"
              rules={{
                required: 'Routing number required',
                pattern: { value: /^\d{9}$/, message: 'Must be 9 digits' },
              }}
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Routing Number"
                  value={value}
                  onChangeText={onChange}
                  placeholder="123456789"
                  keyboardType="numeric"
                  error={errors.routingNumber?.message}
                  required
                  maxLength={9}
                  icon="git-branch-outline"
                  helpText="9-digit number on bottom of check"
                />
              )}
            />

            <Controller
              control={control}
              name="accountNumber"
              rules={{
                required: 'Account number required',
                minLength: { value: 4, message: 'At least 4 digits' },
                maxLength: { value: 17, message: 'Maximum 17 digits' },
              }}
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Account Number"
                  value={value}
                  onChangeText={onChange}
                  placeholder="000123456789"
                  keyboardType="numeric"
                  error={errors.accountNumber?.message}
                  required
                  icon="wallet-outline"
                  helpText="Account number on bottom of check"
                />
              )}
            />

            <Controller
              control={control}
              name="confirmAccountNumber"
              rules={{
                required: 'Please confirm account number',
                validate: (value) => value === accountNumber || 'Account numbers must match',
              }}
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Confirm Account Number"
                  value={value}
                  onChangeText={onChange}
                  placeholder="000123456789"
                  keyboardType="numeric"
                  error={errors.confirmAccountNumber?.message}
                  required
                  icon="wallet-outline"
                />
              )}
            />
          </View>

          <View style={styles.paymentInfoCard}>
            <Text style={styles.paymentInfoTitle}>How payments work</Text>
            <View style={styles.paymentInfoItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.paymentInfoText}>
                Funds held in escrow until job completion
              </Text>
            </View>
            <View style={styles.paymentInfoItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.paymentInfoText}>
                Direct deposit 2-3 days after customer approval
              </Text>
            </View>
            <View style={styles.paymentInfoItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.paymentInfoText}>
                No monthly fees or hidden charges
              </Text>
            </View>
            <View style={styles.paymentInfoItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.paymentInfoText}>
                Platform fee: 12% per completed job
              </Text>
            </View>
          </View>

          <View style={styles.disclaimerCard}>
            <Text style={styles.disclaimerText}>
              By continuing, you agree that you are an independent contractor,
              not an employee. You are responsible for your own taxes, insurance,
              and licensing as required by your state and local laws.
            </Text>
          </View>

          <View style={styles.actions}>
            <Button
              title="Continue to Review"
              onPress={handleSubmit(onSubmit)}
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
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  iconBadge: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.lightest,
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
  securityCard: {
    flexDirection: 'row',
    backgroundColor: '#10B98110',
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.xl,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: '#10B98130',
  },
  securityText: {
    flex: 1,
  },
  securityTitle: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  securityDescription: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    lineHeight: 20,
  },
  formSection: {
    gap: spacing.base,
    marginBottom: spacing.xl,
  },
  paymentInfoCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.base,
  },
  paymentInfoTitle: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
  paymentInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  paymentInfoText: {
    ...typography.sizes.sm,
    color: colors.neutral[700],
    flex: 1,
  },
  disclaimerCard: {
    backgroundColor: colors.primary.lightest,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.primary.light,
  },
  disclaimerText: {
    ...typography.sizes.sm,
    color: colors.neutral[700],
    lineHeight: 20,
    textAlign: 'center',
  },
  actions: {
    gap: spacing.md,
  },
});
