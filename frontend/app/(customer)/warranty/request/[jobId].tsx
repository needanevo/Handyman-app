import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../../../src/constants/theme';
import { Button } from '../../../../src/components/Button';
import { PhotoUploader } from '../../../../src/components/PhotoUploader';
import { api } from '../../../../src/services/api';

export default function WarrantyRequestScreen() {
  const router = useRouter();
  const { jobId } = useLocalSearchParams<{ jobId: string }>();

  const [issueDescription, setIssueDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!issueDescription.trim()) {
      Alert.alert('Error', 'Please describe the issue');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post(`/jobs/${jobId}/warranty/request`, {
        issue_description: issueDescription,
        photo_urls: photos,
      });

      Alert.alert(
        'Request Submitted',
        'Your warranty request has been submitted. The contractor will review it shortly.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to submit warranty request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Button
            title=""
            onPress={() => router.back()}
            variant="ghost"
            size="small"
            icon={<Ionicons name="arrow-back" size={24} color={colors.primary.main} />}
          />
          <Text style={styles.title}>Request Warranty Service</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>Describe the Issue *</Text>
          <TextInput
            style={styles.textArea}
            placeholder="What issue are you experiencing with the completed work?"
            placeholderTextColor={colors.neutral[400]}
            value={issueDescription}
            onChangeText={setIssueDescription}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />

          <Text style={styles.label}>Photos (Optional)</Text>
          <Text style={styles.helperText}>
            Upload photos showing the issue to help the contractor understand the problem
          </Text>
          <PhotoUploader
            photos={photos}
            onPhotosChange={setPhotos}
            maxPhotos={5}
          />

          <Button
            title="Submit Warranty Request"
            onPress={handleSubmit}
            isLoading={isSubmitting}
            disabled={isSubmitting}
            size="large"
            fullWidth
            style={{ marginTop: spacing.xl }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    marginTop: spacing.md,
  },
  form: {
    gap: spacing.lg,
  },
  label: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[700],
    marginBottom: spacing.xs,
  },
  helperText: {
    ...typography.sizes.sm,
    color: colors.neutral[500],
    marginBottom: spacing.sm,
  },
  textArea: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.sizes.base,
    color: colors.neutral[900],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    minHeight: 120,
  },
});
