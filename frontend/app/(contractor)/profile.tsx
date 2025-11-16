/**
 * Contractor Profile Page
 *
 * Displays contractor registration information and allows editing.
 * Includes navigation to registration steps for updating information.
 */

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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../src/constants/theme';
import { useAuth } from '../../src/contexts/AuthContext';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';

export default function ContractorProfile() {
  const router = useRouter();
  const { user, logout } = useAuth();

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

  const registrationStatusColor = () => {
    // This would be based on actual registration status from backend
    // For now, showing as ACTIVE
    return colors.success.main;
  };

  const registrationStatusText = () => {
    // This would be based on actual registration status from backend
    return 'ACTIVE';
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
  section: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.base,
  },
  sectionTitle: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.bold,
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
    ...typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.background.primary,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  profileRole: {
    ...typography.sizes.base,
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
    ...typography.sizes.xs,
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
    ...typography.sizes.xs,
    color: colors.neutral[600],
    marginBottom: spacing.xs,
  },
  infoValue: {
    ...typography.sizes.base,
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
