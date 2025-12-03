/**
 * Contractor Profile Page
 *
 * Displays contractor registration information and allows editing.
 * Includes navigation to registration steps for updating information.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, typography, borderRadius, shadows } from '../../src/constants/theme';
import { useAuth } from '../../src/contexts/AuthContext';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { contractorAPI } from '../../src/services/api';

export default function ContractorProfile() {
  const router = useRouter();
  const { user, logout, refreshUser } = useAuth();
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth/welcome');
          },
        },
      ]
    );
  };

  const handleEditRegistration = () => {
    router.push('/auth/contractor/register-step1');
  };

  const handleProfilePhotoPress = async () => {
    // Show options: camera or gallery (permissions handled automatically by ImagePicker)
    Alert.alert(
      'Upload Profile Photo',
      'Choose a photo source',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Take Photo',
          onPress: () => takePhoto(),
        },
        {
          text: 'Choose from Gallery',
          onPress: () => pickImage(),
        },
      ]
    );
  };

  const takePhoto = async () => {
    // Permissions are handled automatically by launchCameraAsync
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadProfilePhoto(result.assets[0].uri);
    }
  };

  const pickImage = async () => {
    // Permissions are handled automatically by launchImageLibraryAsync
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadProfilePhoto(result.assets[0].uri);
    }
  };

  const uploadProfilePhoto = async (uri: string) => {
    setIsUploadingPhoto(true);

    try {
      // Prepare file for upload
      const fileExtension = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const mimeType = fileExtension === 'png' ? 'image/png' : 'image/jpeg';

      await contractorAPI.uploadProfilePhoto({
        uri,
        type: mimeType,
        name: `profile.${fileExtension}`,
      });

      // Refresh user data to get updated profile photo
      await refreshUser();

      Alert.alert('Success', 'Profile photo updated successfully!');
    } catch (error: any) {
      console.error('Profile photo upload error:', error);
      Alert.alert(
        'Upload Failed',
        error.response?.data?.detail || 'Failed to upload profile photo. Please try again.'
      );
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const registrationStatusColor = () => {
    // This would be based on actual registration status from backend
    // For now, showing as ACTIVE
    return colors.success.main;
  };

  const registrationStatusText = () => {
    // This would be based on actual registration status from backend
    return 'ACTIVE';
  };

  const getInitials = () => {
    const firstInitial = user?.firstName?.[0] || '';
    const lastInitial = user?.lastName?.[0] || '';
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.primary.main} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Profile Photo Section */}
        <View style={styles.photoSection}>
          <TouchableOpacity
            onPress={handleProfilePhotoPress}
            disabled={isUploadingPhoto}
            style={styles.photoContainer}
          >
            {user?.profilePhoto ? (
              <Image
                source={{ uri: user.profilePhoto }}
                style={styles.profilePhoto}
              />
            ) : (
              <View style={styles.profilePhotoPlaceholder}>
                <Text style={styles.profilePhotoInitials}>
                  {getInitials()}
                </Text>
              </View>
            )}

            {isUploadingPhoto && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={colors.background.primary} />
              </View>
            )}

            <View style={styles.cameraButton}>
              <Ionicons name="camera" size={20} color={colors.background.primary} />
            </View>
          </TouchableOpacity>

          <Text style={styles.photoHint}>Tap to change photo</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.section}>
          <Card style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>
                  {user?.firstName} {user?.lastName}
                </Text>
                <Text style={styles.profileRole}>Contractor</Text>
                <View style={styles.statusBadge}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: registrationStatusColor() }
                    ]}
                  />
                  <Text style={styles.statusText}>{registrationStatusText()}</Text>
                </View>
              </View>
            </View>
          </Card>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <Card style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={20} color={colors.neutral[600]} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user?.email}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={20} color={colors.neutral[600]} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{user?.phone || 'Not provided'}</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Business Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Information</Text>
          <Card style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="briefcase-outline" size={20} color={colors.neutral[600]} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Business Name</Text>
                <Text style={styles.infoValue}>{user?.businessName || 'Not provided'}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Ionicons name="build-outline" size={20} color={colors.neutral[600]} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Skills</Text>
                <Text style={styles.infoValue}>
                  {user?.skills?.join(', ') || 'Not provided'}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color={colors.neutral[600]} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Service Areas</Text>
                <Text style={styles.infoValue}>
                  {user?.serviceAreas?.join(', ') || 'Not provided'}
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Documents */}
        {user?.documents && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Verification Documents</Text>
            <Card style={styles.infoCard}>
              {user.documents.license && (
                <>
                  <View style={styles.infoRow}>
                    <Ionicons name="card-outline" size={20} color={colors.neutral[600]} />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Driver's License</Text>
                      <Text style={styles.infoValue}>Uploaded ✓</Text>
                    </View>
                  </View>
                  <View style={styles.divider} />
                </>
              )}

              {user.documents.businessLicense && (
                <>
                  <View style={styles.infoRow}>
                    <Ionicons name="document-outline" size={20} color={colors.neutral[600]} />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Professional Licenses</Text>
                      <Text style={styles.infoValue}>
                        {Array.isArray(user.documents.businessLicense)
                          ? `${user.documents.businessLicense.length} file(s) uploaded`
                          : 'Uploaded ✓'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.divider} />
                </>
              )}

              {user.documents.insurance && (
                <View style={styles.infoRow}>
                  <Ionicons name="shield-checkmark-outline" size={20} color={colors.neutral[600]} />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Insurance</Text>
                    <Text style={styles.infoValue}>Uploaded ✓</Text>
                  </View>
                </View>
              )}

              {!user.documents.license && !user.documents.businessLicense && !user.documents.insurance && (
                <View style={styles.infoRow}>
                  <Ionicons name="alert-circle-outline" size={20} color={colors.warning.main} />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>No documents uploaded</Text>
                    <Text style={[styles.infoValue, { color: colors.neutral[600] }]}>
                      Complete registration to upload documents
                    </Text>
                  </View>
                </View>
              )}
            </Card>
          </View>
        )}

        {/* Portfolio */}
        {user?.portfolioPhotos && user.portfolioPhotos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Portfolio</Text>
            <Card style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Ionicons name="images-outline" size={20} color={colors.neutral[600]} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Portfolio Photos</Text>
                  <Text style={styles.infoValue}>
                    {user.portfolioPhotos.length} photo{user.portfolioPhotos.length !== 1 ? 's' : ''} uploaded
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        )}

        {/* Registration Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Registration</Text>
          <Card style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color={colors.neutral[600]} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Registration Date</Text>
                <Text style={styles.infoValue}>
                  {user?.registrationCompletedDate
                    ? new Date(user.registrationCompletedDate).toLocaleDateString()
                    : 'Not completed'}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={20} color={colors.neutral[600]} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Expiration Date</Text>
                <Text style={styles.infoValue}>
                  {user?.registrationExpirationDate
                    ? new Date(user.registrationExpirationDate).toLocaleDateString()
                    : 'Not set'}
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Button
            title="Edit Registration"
            onPress={handleEditRegistration}
            variant="primary"
            size="large"
            fullWidth
            icon={<Ionicons name="create-outline" size={20} color={colors.background.primary} />}
            style={styles.actionButton}
          />

          <Button
            title="Logout"
            onPress={handleLogout}
            variant="outline"
            size="large"
            fullWidth
            icon={<Ionicons name="log-out-outline" size={20} color={colors.error.main} />}
            style={styles.logoutButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing['4xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.lg,
    backgroundColor: colors.background.primary,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
  },
  photoSection: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
    backgroundColor: colors.background.primary,
  },
  photoContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    marginBottom: spacing.sm,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: colors.primary.main,
    backgroundColor: colors.neutral[200],
  },
  profilePhotoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: colors.primary.main,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profilePhotoInitials: {
    ...typography.sizes['4xl'],
    fontWeight: typography.weights.bold,
    color: colors.background.primary,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary.main,
    borderWidth: 3,
    borderColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  photoHint: {
    ...typography.caption.regular,
    color: colors.neutral[600],
  },
  section: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.base,
  },
  sectionTitle: {
    ...typography.headings.h5,
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
  profileCard: {
    padding: spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.base,
  },
  avatarText: {
    ...typography.headings.h1,
    color: colors.background.primary,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...typography.headings.h2,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  profileRole: {
    ...typography.body.regular,
    color: colors.neutral[600],
    marginBottom: spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.success.lightest,
    borderRadius: borderRadius.md,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
    marginRight: spacing.xs,
  },
  statusText: {
    ...typography.caption.small,
    fontWeight: typography.weights.semibold,
    color: colors.success.dark,
  },
  infoCard: {
    padding: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  infoLabel: {
    ...typography.caption.small,
    color: colors.neutral[600],
    marginBottom: spacing.xs,
  },
  infoValue: {
    ...typography.body.regular,
    color: colors.neutral[900],
    fontWeight: typography.weights.medium,
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral[200],
    marginVertical: spacing.base,
  },
  actionButton: {
    marginBottom: spacing.md,
  },
  logoutButton: {
    borderColor: colors.error.main,
  },
});
