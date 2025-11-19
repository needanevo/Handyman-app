import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../../src/constants/theme';
import { Button } from '../../../src/components/Button';
import { StepIndicator } from '../../../src/components/StepIndicator';
import { PhotoUploader } from '../../../src/components/PhotoUploader';
import { Card } from '../../../src/components/Card';

export default function JobRequestStep1() {
  const router = useRouter();
  const [photos, setPhotos] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const onContinue = () => {
    if (photos.length === 0) {
      alert('Please add at least one photo of the issue');
      return;
    }

    router.push({
      pathname: '/(customer)/job-request/step2-describe',
      params: {
        photos: JSON.stringify(photos),
      },
    });
  };

  const steps = [
    { label: 'Photos', completed: false },
    { label: 'Describe', completed: false },
    { label: 'Review', completed: false },
  ];

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
            icon={<Ionicons name="close" size={24} color={colors.neutral[600]} />}
            style={styles.backButton}
          />
        </View>

        {/* Progress */}
        <StepIndicator steps={steps} currentStep={0} />

        {/* Title */}
        <View style={styles.titleSection}>
          <View style={[styles.iconCircle, { backgroundColor: colors.primary.lightest }]}>
            <Ionicons name="camera" size={32} color={colors.primary.main} />
          </View>
          <Text style={styles.title}>Show us the problem</Text>
          <Text style={styles.subtitle}>
            Take photos of what needs to be fixed. This helps us give you an accurate quote.
          </Text>
        </View>

        {/* Photo Uploader */}
        <View style={styles.uploaderSection}>
          <PhotoUploader
            photos={photos}
            onPhotosChange={setPhotos}
            maxPhotos={5}
            label="Problem Photos"
            helpText="Take clear photos from different angles. More photos = better estimates!"
            required
          />
        </View>

        {/* Tips Card */}
        <Card variant="flat" padding="lg" style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Tips for great photos:</Text>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success.main} />
              <Text style={styles.tipText}>Take photos in good lighting</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success.main} />
              <Text style={styles.tipText}>Include close-ups of damage</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success.main} />
              <Text style={styles.tipText}>Show the full context of the area</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success.main} />
              <Text style={styles.tipText}>Capture any model numbers or labels</Text>
            </View>
          </View>
        </Card>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Continue"
            onPress={onContinue}
            loading={isLoading}
            size="large"
            fullWidth
            disabled={photos.length === 0}
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
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['2xl'],
  },
  header: {
    paddingTop: spacing.sm,
    marginBottom: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.full,
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
    paddingHorizontal: spacing.base,
  },
  uploaderSection: {
    marginBottom: spacing.xl,
  },
  tipsCard: {
    marginBottom: spacing.xl,
  },
  tipsTitle: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
  tipsList: {
    gap: spacing.sm,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  tipText: {
    ...typography.sizes.base,
    color: colors.neutral[700],
    flex: 1,
    lineHeight: 24,
  },
  actions: {
    gap: spacing.md,
  },
});
