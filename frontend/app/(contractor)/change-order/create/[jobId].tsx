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
import api from '../../../../src/services/api';

export default function CreateChangeOrderScreen() {
  const router = useRouter();
  const { jobId } = useLocalSearchParams<{ jobId: string }>();

  const [description, setDescription] = useState('');
  const [reason, setReason] = useState('');
  const [additionalCost, setAdditionalCost] = useState('');
  const [additionalHours, setAdditionalHours] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Error', 'Please describe the change');
      return;
    }

    if (!reason.trim()) {
      Alert.alert('Error', 'Please explain why this change is needed');
      return;
    }

    if (!additionalCost.trim()) {
      Alert.alert('Error', 'Please enter the additional cost');
      return;
    }

    const cost = parseFloat(additionalCost);
    if (isNaN(cost)) {
      Alert.alert('Error', 'Please enter a valid cost amount');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post(`/jobs/${jobId}/change-order/create`, {
        description,
        reason,
        additional_cost: cost,
        additional_hours: additionalHours ? parseFloat(additionalHours) : null,
        photo_urls: photos,
      });

      Alert.alert(
        'Change Order Submitted',
        'Your change order has been submitted to the customer for approval.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to create change order');
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
          <Text style={styles.title}>Create Change Order</Text>
          <Text style={styles.subtitle}>
            Document scope changes and get customer approval before proceeding
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>Change Description *</Text>
          <TextInput
            style={styles.textArea}
            placeholder="What work needs to be added or changed?"
            placeholderTextColor={colors.neutral[400]}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <Text style={styles.label}>Reason for Change *</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Why is this change necessary? (e.g., discovered additional damage, customer request, code requirements)"
            placeholderTextColor={colors.neutral[400]}
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <Text style={styles.label}>Additional Cost *</Text>
          <View style={styles.inputWithIcon}>
            <Text style={styles.inputIcon}>$</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor={colors.neutral[400]}
              value={additionalCost}
              onChangeText={setAdditionalCost}
              keyboardType="decimal-pad"
            />
          </View>
          <Text style={styles.helperText}>
            Enter the additional cost (can be negative for credits)
          </Text>

          <Text style={styles.label}>Additional Hours (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="0.0"
            placeholderTextColor={colors.neutral[400]}
            value={additionalHours}
            onChangeText={setAdditionalHours}
            keyboardType="decimal-pad"
          />

          <Text style={styles.label}>Photos (Optional)</Text>
          <Text style={styles.helperText}>
            Add photos showing why the change is needed
          </Text>
          <PhotoUploader
            photos={photos}
            onPhotosChange={setPhotos}
            maxPhotos={5}
          />

          <Button
            title="Submit Change Order"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
            size="large"
            fullWidth
            style={{ marginTop: spacing.xl }}
            icon={<Ionicons name="document-text" size={20} color="#fff" />}
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
    fontWeight: '700' as const,
    color: colors.neutral[900],
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.sizes.base,
    color: colors.neutral[600],
    lineHeight: 22,
  },
  form: {
    gap: spacing.lg,
  },
  label: {
    ...typography.sizes.base,
    fontWeight: '600' as const,
    color: colors.neutral[700],
    marginBottom: spacing.xs,
  },
  helperText: {
    ...typography.sizes.sm,
    color: colors.neutral[500],
    marginTop: -spacing.md,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.sizes.base,
    color: colors.neutral[900],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  inputIcon: {
    paddingLeft: spacing.md,
    ...typography.sizes.base,
    color: colors.neutral[600],
    fontWeight: '600' as const,
  },
  textArea: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.sizes.base,
    color: colors.neutral[900],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    minHeight: 100,
  },
});
