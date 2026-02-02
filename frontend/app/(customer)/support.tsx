/**
 * Customer Support Page
 *
 * Provides support options for customers with issues or questions.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Linking,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../src/constants/theme';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { useAuth } from '../../src/contexts/AuthContext';

export default function SupportScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleEmailSupport = async () => {
    if (!message.trim()) {
      Alert.alert('Missing Information', 'Please enter a message describing your issue.');
      return;
    }

    setIsSending(true);

    try {
      // Construct support email
      const supportEmail = 'support@therealjohnson.com';
      const subject = 'Support Request';
      const body = `
User: ${user?.firstName} ${user?.lastName}
Email: ${user?.email}
User ID: ${user?.id}

Message:
${message}
      `.trim();

      const mailtoUrl = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      // Try to open email client
      const canOpen = await Linking.canOpenURL(mailtoUrl);
      if (canOpen) {
        await Linking.openURL(mailtoUrl);
        Alert.alert(
          'Email Client Opened',
          'Please send the email from your email client.',
          [
            {
              text: 'OK',
              onPress: () => {
                setMessage('');
                router.back();
              },
            },
          ]
        );
      } else {
        // If email client not available, log the support request
        console.log('Support Request:', { user, message });
        Alert.alert(
          'Support Request Logged',
          'Your support request has been logged. Our team will contact you via email within 24 hours.',
          [
            {
              text: 'OK',
              onPress: () => {
                setMessage('');
                router.back();
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Failed to send support request:', error);
      Alert.alert(
        'Error',
        'Failed to send support request. Please try again or email us directly at support@therealjohnson.com'
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Button
          title=""
          onPress={() => router.back()}
          variant="ghost"
          size="small"
          icon={<Ionicons name="arrow-back" size={24} color={colors.primary.main} />}
        />
        <Text style={styles.headerTitle}>Contact Support</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Info Card */}
        <Card variant="elevated" padding="lg" style={styles.infoCard}>
          <View style={styles.iconContainer}>
            <Ionicons name="chatbubbles" size={40} color={colors.primary.main} />
          </View>

          <Text style={styles.title}>Try Contacting Your Contractor First</Text>

          <Text style={styles.description}>
            For job-specific issues, we recommend reaching out to your contractor directly through the chat feature.
            This is usually the fastest way to resolve questions or concerns about your project.
          </Text>
        </Card>

        {/* Support Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Still Need Help?</Text>
          <Text style={styles.sectionDescription}>
            If you need assistance from our support team, please describe your issue below.
          </Text>

          <Card variant="outlined" padding="base" style={styles.formCard}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Your Email</Text>
              <View style={styles.disabledInput}>
                <Text style={styles.disabledInputText}>{user?.email}</Text>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Message *</Text>
              <TextInput
                style={styles.textArea}
                value={message}
                onChangeText={setMessage}
                placeholder="Describe your issue or question..."
                placeholderTextColor={colors.neutral[400]}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>

            <Button
              title={isSending ? 'Sending...' : 'Email Support'}
              onPress={handleEmailSupport}
              variant="primary"
              size="large"
              fullWidth
              disabled={isSending || !message.trim()}
              icon={<Ionicons name="mail" size={20} color={colors.background.primary} />}
            />
          </Card>
        </View>

        {/* Quick Help */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Help</Text>

          <Card variant="outlined" padding="base" style={styles.helpCard}>
            <View style={styles.helpItem}>
              <Ionicons name="help-circle" size={20} color={colors.neutral[600]} />
              <View style={styles.helpContent}>
                <Text style={styles.helpTitle}>Common Questions</Text>
                <Text style={styles.helpText}>
                  Most issues can be resolved by checking our FAQ section or contacting your contractor directly.
                </Text>
              </View>
            </View>
          </Card>

          <Card variant="outlined" padding="base" style={styles.helpCard}>
            <View style={styles.helpItem}>
              <Ionicons name="shield-checkmark" size={20} color={colors.neutral[600]} />
              <View style={styles.helpContent}>
                <Text style={styles.helpTitle}>Payment Protection</Text>
                <Text style={styles.helpText}>
                  Your payments are held in escrow until you approve milestone completion.
                </Text>
              </View>
            </View>
          </Card>

          <Card variant="outlined" padding="base" style={styles.helpCard}>
            <View style={styles.helpItem}>
              <Ionicons name="time" size={20} color={colors.neutral[600]} />
              <View style={styles.helpContent}>
                <Text style={styles.helpTitle}>Response Time</Text>
                <Text style={styles.helpText}>
                  Our support team typically responds within 24 hours during business days.
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Direct Contact */}
        <Card variant="flat" padding="base" style={styles.contactCard}>
          <View style={styles.contactContent}>
            <Ionicons name="mail" size={24} color={colors.primary.main} />
            <View style={styles.contactText}>
              <Text style={styles.contactTitle}>Direct Email</Text>
              <Text style={styles.contactEmail}>support@therealjohnson.com</Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  headerTitle: {
    ...typography.headings.h4,
    color: colors.neutral[900],
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
  infoCard: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.lightest,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.headings.h4,
    color: colors.neutral[900],
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    ...typography.body.regular,
    color: colors.neutral[700],
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.headings.h5,
    color: colors.neutral[900],
    marginBottom: spacing.sm,
  },
  sectionDescription: {
    ...typography.body.small,
    color: colors.neutral[600],
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  formCard: {
    marginTop: spacing.md,
  },
  formGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.body.regular,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.sm,
  },
  disabledInput: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  disabledInputText: {
    ...typography.body.regular,
    color: colors.neutral[600],
  },
  textArea: {
    ...typography.body.regular,
    color: colors.neutral[900],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    minHeight: 120,
  },
  helpCard: {
    marginBottom: spacing.md,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  helpContent: {
    flex: 1,
  },
  helpTitle: {
    ...typography.body.regular,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  helpText: {
    ...typography.body.small,
    color: colors.neutral[600],
    lineHeight: 20,
  },
  contactCard: {
    marginTop: spacing.lg,
  },
  contactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  contactText: {
    flex: 1,
  },
  contactTitle: {
    ...typography.body.regular,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  contactEmail: {
    ...typography.body.small,
    color: colors.primary.main,
    fontWeight: typography.weights.medium,
  },
});
