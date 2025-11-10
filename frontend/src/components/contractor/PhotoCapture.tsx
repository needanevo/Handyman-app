/**
 * PhotoCapture Component
 *
 * Quick camera access for contractors to capture job photos on-site.
 * Supports immediate photo capture with category tagging and captions.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, typography, borderRadius, shadows } from '../../constants/theme';
import { PhotoCategory } from '../../types/contractor';
import { Button } from '../Button';

interface PhotoCaptureProps {
  onPhotoCapture: (photo: {
    uri: string;
    type: string;
    name: string;
    category: PhotoCategory;
    caption?: string;
  }) => void;
  category?: PhotoCategory;
  allowCategorySelection?: boolean;
  showPreview?: boolean;
}

const PHOTO_CATEGORIES: { value: PhotoCategory; label: string; icon: string }[] = [
  { value: 'BEFORE', label: 'Before', icon: '📸' },
  { value: 'PROGRESS', label: 'Progress', icon: '🔨' },
  { value: 'AFTER', label: 'After', icon: '✅' },
  { value: 'DETAIL', label: 'Detail', icon: '🔍' },
  { value: 'RECEIPT', label: 'Receipt', icon: '🧾' },
  { value: 'DAMAGE', label: 'Damage', icon: '⚠️' },
  { value: 'OTHER', label: 'Other', icon: '📋' },
];

export function PhotoCapture({
  onPhotoCapture,
  category = 'PROGRESS',
  allowCategorySelection = true,
  showPreview = true,
}: PhotoCaptureProps) {
  const [selectedCategory, setSelectedCategory] = useState<PhotoCategory>(category);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  const requestCameraPermission = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission Required',
          'Please enable camera access to take photos of your work.'
        );
        return false;
      }
    }
    return true;
  };

  const requestMediaLibraryPermission = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Photo Library Permission Required',
          'Please enable photo library access to select existing photos.'
        );
        return false;
      }
    }
    return true;
  };

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const photo = result.assets[0];
      if (showPreview) {
        setCapturedPhoto(photo.uri);
      } else {
        handlePhotoCapture(photo.uri);
      }
    }
  };

  const selectFromLibrary = async () => {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      allowsMultipleSelection: false,
    });

    if (!result.canceled && result.assets[0]) {
      const photo = result.assets[0];
      if (showPreview) {
        setCapturedPhoto(photo.uri);
      } else {
        handlePhotoCapture(photo.uri);
      }
    }
  };

  const handlePhotoCapture = (uri: string) => {
    const fileName = `job_photo_${Date.now()}.jpg`;
    onPhotoCapture({
      uri,
      type: 'image/jpeg',
      name: fileName,
      category: selectedCategory,
    });
    setCapturedPhoto(null);
  };

  const confirmPhoto = () => {
    if (capturedPhoto) {
      handlePhotoCapture(capturedPhoto);
    }
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
  };

  return (
    <View style={styles.container}>
      {/* Category Selection */}
      {allowCategorySelection && (
        <View style={styles.categorySection}>
          <Text style={styles.categoryLabel}>Photo Type</Text>
          <View style={styles.categoryGrid}>
            {PHOTO_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.value}
                style={[
                  styles.categoryButton,
                  selectedCategory === cat.value && styles.categoryButtonActive,
                ]}
                onPress={() => setSelectedCategory(cat.value)}
              >
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === cat.value && styles.categoryTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Photo Preview */}
      {capturedPhoto && showPreview ? (
        <View style={styles.previewSection}>
          <Image source={{ uri: capturedPhoto }} style={styles.previewImage} />
          <View style={styles.previewActions}>
            <Button
              title="Retake"
              onPress={retakePhoto}
              variant="outline"
              size="medium"
              style={styles.previewButton}
            />
            <Button
              title="Use Photo"
              onPress={confirmPhoto}
              variant="primary"
              size="medium"
              style={styles.previewButton}
            />
          </View>
        </View>
      ) : (
        /* Capture Buttons */
        <View style={styles.captureSection}>
          <TouchableOpacity style={styles.cameraButton} onPress={takePhoto}>
            <Text style={styles.cameraIcon}>📷</Text>
            <Text style={styles.cameraText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.libraryButton} onPress={selectFromLibrary}>
            <Text style={styles.libraryIcon}>🖼️</Text>
            <Text style={styles.libraryText}>Choose from Library</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  categorySection: {
    marginBottom: spacing.lg,
  },
  categoryLabel: {
    ...typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[700],
    marginBottom: spacing.sm,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryButton: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    backgroundColor: colors.background.primary,
    minWidth: 70,
  },
  categoryButtonActive: {
    borderColor: colors.primary.main,
    backgroundColor: colors.primary.lightest,
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  categoryText: {
    ...typography.sizes.xs,
    color: colors.neutral[600],
  },
  categoryTextActive: {
    color: colors.primary.main,
    fontWeight: typography.weights.semibold,
  },
  captureSection: {
    gap: spacing.md,
  },
  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  cameraIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  cameraText: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.background.primary,
  },
  libraryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[300],
  },
  libraryIcon: {
    fontSize: 28,
    marginRight: spacing.md,
  },
  libraryText: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[700],
  },
  previewSection: {
    gap: spacing.md,
  },
  previewImage: {
    width: '100%',
    height: 300,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.neutral[100],
  },
  previewActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  previewButton: {
    flex: 1,
  },
});
