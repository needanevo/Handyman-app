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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../../src/constants/theme';
import { Button } from '../../../src/components/Button';
import { Input } from '../../../src/components/Input';
import { StepIndicator } from '../../../src/components/StepIndicator';
import { PhotoUploader } from '../../../src/components/PhotoUploader';
import { Card } from '../../../src/components/Card';
import { useAuth } from '../../../src/contexts/AuthContext';
import { contractorAPI } from '../../../src/services/api';

export default function ContractorRegisterStep2() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user, refreshUser } = useAuth();

  const [profilePhoto, setProfilePhoto] = useState<string[]>([]);
  const [driversLicense, setDriversLicense] = useState<string[]>([]);
  const [businessLicenses, setBusinessLicenses] = useState<string[]>([]);
  const [licenseNumber, setLicenseNumber] = useState('');
  const [insurance, setInsurance] = useState<string[]>([]);
  const [insurancePolicyNumber, setInsurancePolicyNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Pre-fill existing documents when editing
  useEffect(() => {
    if (user?.profilePhoto) {
      setProfilePhoto([user.profilePhoto]);
    }
    if (user?.documents) {
      if (user.documents.license) {
        setDriversLicense([user.documents.license]);
      }
      if (user.documents.businessLicense) {
        setBusinessLicenses(Array.isArray(user.documents.businessLicense) ? user.documents.businessLicense : [user.documents.businessLicense]);
      }
      if (user.documents.insurance) {
        setInsurance([user.documents.insurance]);
      }
    }
    // Pre-fill license number and insurance policy number
    if ((user as any)?.license_number) {
      setLicenseNumber((user as any).license_number);
    }
    if ((user as any)?.insurance_policy_number) {
      setInsurancePolicyNumber((user as any).insurance_policy_number);
    }
  }, [user]);

  const onContinue = async () => {
    if (profilePhoto.length === 0) {
      Alert.alert('Required', 'Please take a profile photo to continue');
      return;
    }

    if (driversLicense.length === 0) {
      Alert.alert('Required', "Please upload your driver's license");
      return;
    }

    try{
      setIsLoading(true);

      // Note: Profile photo is already saved via PhotoUploader customUpload
      // which calls uploadProfilePhoto and updates user.profile_photo in DB

      // Save documents to database
      await contractorAPI.updateDocuments({
        license: driversLicense[0],
        business_license: businessLicenses[0] || null,
        insurance: insurance[0] || null,
      });

      // Save license number and insurance policy number if provided
      if (licenseNumber || insurancePolicyNumber) {
        await contractorAPI.updateProfile({
          license_number: licenseNumber || undefined,
          insurance_policy_number: insurancePolicyNumber || undefined,
        } as any);
      }

      // Refresh user context to get updated documents
      await refreshUser();

      // Navigate to next step
      router.push({
        pathname: '/auth/contractor/register-step3',
        params: {
          ...params,
          driversLicense: JSON.stringify(driversLicense),
          businessLicenses: JSON.stringify(businessLicenses),
          insurance: JSON.stringify(insurance),
        },
      });
    } catch (error: any) {
      console.error('Failed to save documents:', error);
      Alert.alert(
        'Error',
        error.response?.data?.detail || 'Failed to save documents. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { label: 'Basic Info', completed: true },
    { label: 'Documents', completed: false },
    { label: 'Profile', completed: false },
    { label: 'Portfolio', completed: false },
    { label: 'Banking', completed: false },
    { label: 'Review', completed: false },
  ];

  const handleStepPress = (stepIndex: number) => {
    // Allow free navigation between all steps
    if (stepIndex === 0) {
      router.push({
        pathname: '/auth/contractor/register-step1',
        params,
      });
    } else if (stepIndex === 2) {
      router.push({
        pathname: '/auth/contractor/register-step3',
        params,
      });
    } else if (stepIndex === 3) {
      router.push({
        pathname: '/auth/contractor/register-step4',
        params,
      });
    } else if (stepIndex === 4) {
      router.push({
        pathname: '/auth/contractor/register-step5',
        params,
      });
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
              photos={profilePhoto}
              onPhotosChange={setProfilePhoto}
              maxPhotos={1}
              label="Profile Photo"
              helpText="Take a clear photo of yourself (camera only)"
              required
              aspectRatio={[1, 1]}  // Square aspect ratio for profile photos
              cameraOnly={true}
              customUpload={(file) => contractorAPI.uploadProfilePhoto(file)}
            />

            <View style={styles.divider} />

            <PhotoUploader
              photos={driversLicense}
              onPhotosChange={setDriversLicense}
              maxPhotos={2}
              label="Driver's License"
              helpText="Front and back of your valid driver's license"
              required
              aspectRatio={[16, 10]}  // Standard driver's license aspect ratio
              customUpload={(file) => contractorAPI.uploadDocument(file, 'license')}
            />

            <View style={styles.divider} />

            <PhotoUploader
              photos={businessLicenses}
              onPhotosChange={setBusinessLicenses}
              maxPhotos={1}
              label="Professional License Photo"
              helpText="Upload your contractor or trade license (required for Electrical/Plumbing)"
              aspectRatio={[16, 10]}
              customUpload={(file) => contractorAPI.uploadDocument(file, 'business_license')}
            />

            <Input
              label="License Number"
              value={licenseNumber}
              onChangeText={setLicenseNumber}
              placeholder="e.g., EL-123456"
              icon="document-text-outline"
              helpText="Required for Electrical or Plumbing work"
            />

            <View style={styles.divider} />

            <PhotoUploader
              photos={insurance}
              onPhotosChange={setInsurance}
              maxPhotos={1}
              label="Insurance Documentation"
              helpText="Liability insurance certificate (recommended)"
              aspectRatio={[16, 10]}
              customUpload={(file) => contractorAPI.uploadDocument(file, 'insurance')}
            />

            <Input
              label="Insurance Policy Number"
              value={insurancePolicyNumber}
              onChangeText={setInsurancePolicyNumber}
              placeholder="e.g., POL-987654"
              icon="shield-outline"
              helpText="For contract and verification purposes"
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
