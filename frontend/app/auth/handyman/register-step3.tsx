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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../../src/constants/theme';
import { Button } from '../../../src/components/Button';
import { Input } from '../../../src/components/Input';

interface Step3Form {
  phoneVerification: string;
}

export default function HandymanRegisterStep3() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Step3Form>();

  const sendVerificationCode = async () => {
    setIsLoading(true);
    // TODO: Implement SMS verification via Twilio
    // For now, simulate sending code
    setTimeout(() => {
      setVerificationSent(true);
      setIsLoading(false);
      alert('Verification code sent to your phone');
    }, 1500);
  };

  const onSubmit = async (data: Step3Form) => {
    setIsLoading(true);

    try {
      // TODO: Verify code with backend
      // For now, accept any 6-digit code as valid
      if (data.phoneVerification.length === 6) {
        router.push({
          pathname: '/auth/handyman/register-step4',
          params,
        });
      } else {
        alert('Please enter a valid 6-digit code');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Verification error:', error);
      alert('Verification failed. Please try again.');
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
            <View style={[styles.progressSegment, styles.progressActive]} />
            <View style={[styles.progressSegment, styles.progressActive]} />
            <View style={styles.progressSegment} />
          </View>

          <View style={styles.titleSection}>
            <View style={styles.iconBadge}>
              <Ionicons name="shield-checkmark" size={32} color="#FFA500" />
            </View>
            <Text style={styles.title}>Quick Verification</Text>
            <Text style={styles.subtitle}>
              We just need to verify your phone number
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color="#FFA500" />
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>Why verify?</Text>
              <Text style={styles.infoDescription}>
                Phone verification helps customers reach you and builds trust.
                No photo ID needed to start!
              </Text>
            </View>
          </View>

          <View style={styles.formSection}>
            {!verificationSent ? (
              <View style={styles.sendCodeSection}>
                <Text style={styles.phoneDisplay}>
                  We'll send a code to: {params.phone || 'your phone'}
                </Text>
                <Button
                  title="Send Verification Code"
                  onPress={sendVerificationCode}
                  loading={isLoading}
                  size="large"
                  fullWidth
                  icon={<Ionicons name="chatbubble-ellipses" size={20} color="#FFF" />}
                />
              </View>
            ) : (
              <Controller
                control={control}
                name="phoneVerification"
                rules={{
                  required: 'Verification code required',
                  pattern: { value: /^\d{6}$/, message: '6 digits required' },
                }}
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Verification Code"
                    value={value}
                    onChangeText={onChange}
                    placeholder="123456"
                    keyboardType="numeric"
                    error={errors.phoneVerification?.message}
                    required
                    maxLength={6}
                    icon="lock-closed-outline"
                    helpText="Enter the 6-digit code we sent"
                  />
                )}
              />
            )}

            {verificationSent && (
              <Button
                title="Didn't receive code?"
                onPress={sendVerificationCode}
                variant="ghost"
                size="small"
                style={styles.resendButton}
              />
            )}
          </View>

          <View style={styles.benefitsSection}>
            <Text style={styles.benefitsTitle}>What's next?</Text>
            <View style={styles.benefitItem}>
              <Ionicons name="wallet" size={20} color="#FFA500" />
              <Text style={styles.benefitText}>Set up your payout account</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="briefcase" size={20} color="#FFA500" />
              <Text style={styles.benefitText}>Start accepting jobs immediately</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="star" size={20} color="#FFA500" />
              <Text style={styles.benefitText}>Build your reputation</Text>
            </View>
          </View>

          {verificationSent && (
            <View style={styles.actions}>
              <Button
                title="Verify & Continue"
                onPress={handleSubmit(onSubmit)}
                loading={isLoading}
                size="large"
                fullWidth
              />
            </View>
          )}
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
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#FFA50010',
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.xl,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: '#FFA50030',
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  infoDescription: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    lineHeight: 20,
  },
  formSection: {
    gap: spacing.base,
    marginBottom: spacing.xl,
  },
  sendCodeSection: {
    gap: spacing.base,
  },
  phoneDisplay: {
    ...typography.sizes.base,
    color: colors.neutral[700],
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  resendButton: {
    alignSelf: 'center',
  },
  benefitsSection: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.xl,
  },
  benefitsTitle: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  benefitText: {
    ...typography.sizes.sm,
    color: colors.neutral[700],
  },
  actions: {
    gap: spacing.md,
  },
});
