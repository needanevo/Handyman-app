import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors, borderRadius, spacing, typography, shadows } from '../constants/theme';
import { quotesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface PhotoUploaderProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
  label?: string;
  helpText?: string;
  required?: boolean;
  aspectRatio?: [number, number];  // For image cropping (e.g., [16, 9] or [8.5, 5.3])
  customUpload?: (file: { uri: string; type: string; name: string }) => Promise<{ url: string }>;  // Custom upload function
}

export function PhotoUploader({
  photos,
  onPhotosChange,
  maxPhotos = 5,
  label,
  helpText,
  required = false,
  aspectRatio = [4, 3],  // Default to 4:3
  customUpload,  // Optional custom upload function
}: PhotoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  const uploadPhotoToServer = async (uri: string): Promise<string | null> => {
    if (!user?.id) {
      Alert.alert('Error', 'You must be logged in to upload photos');
      return null;
    }

    try {
      // Extract filename and type from URI
      const filename = uri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      const file = {
        uri,
        type,
        name: filename,
      };

      // Use custom upload function if provided, otherwise use default quotesAPI
      const response = customUpload
        ? await customUpload(file)
        : await quotesAPI.uploadPhotoImmediate(file, user.id);
      return response.url;
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw error;
    }
  };

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please allow camera access to take photos.'
      );
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    if (photos.length >= maxPhotos) {
      Alert.alert('Maximum Photos', `You can only upload up to ${maxPhotos} photos.`);
      return;
    }

    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    try {
      setUploading(true);
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
        aspect: aspectRatio,  // Use dynamic aspect ratio
      });

      if (!result.canceled && result.assets[0]) {
        const localUri = result.assets[0].uri;

        // Upload to server immediately
        const uploadedUrl = await uploadPhotoToServer(localUri);
        if (uploadedUrl) {
          onPhotosChange([...photos, uploadedUrl]);
        } else {
          Alert.alert('Upload Failed', 'Failed to upload photo. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const pickPhoto = async () => {
    if (photos.length >= maxPhotos) {
      Alert.alert('Maximum Photos', `You can only upload up to ${maxPhotos} photos.`);
      return;
    }

    try {
      setUploading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
        aspect: aspectRatio,  // Use dynamic aspect ratio
        allowsMultipleSelection: true,
      });

      if (!result.canceled && result.assets.length > 0) {
        const assetsToUpload = result.assets.slice(0, maxPhotos - photos.length);

        // Upload all photos in parallel
        const uploadPromises = assetsToUpload.map(asset => uploadPhotoToServer(asset.uri));
        const uploadedUrls = await Promise.all(uploadPromises);

        // Filter out failed uploads (null values)
        const successfulUrls = uploadedUrls.filter(url => url !== null) as string[];

        if (successfulUrls.length > 0) {
          onPhotosChange([...photos, ...successfulUrls]);
        }

        if (successfulUrls.length < assetsToUpload.length) {
          Alert.alert(
            'Partial Upload',
            `${successfulUrls.length} of ${assetsToUpload.length} photos uploaded successfully.`
          );
        }
      }
    } catch (error) {
      console.error('Error picking photo:', error);
      Alert.alert('Error', 'Failed to select photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      {helpText && <Text style={styles.helpText}>{helpText}</Text>}

      {photos.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.photosScroll}
          contentContainerStyle={styles.photosContainer}
        >
          {photos.map((photo, index) => (
            <View key={index} style={styles.photoWrapper}>
              <Image source={{ uri: photo }} style={styles.photo} />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removePhoto(index)}
              >
                <Ionicons name="close-circle" size={24} color={colors.error.main} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {photos.length < maxPhotos && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={takePhoto}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color={colors.primary.main} />
            ) : (
              <>
                <View style={styles.actionIconContainer}>
                  <Ionicons name="camera" size={24} color={colors.primary.main} />
                </View>
                <Text style={styles.actionText}>Take Photo</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={pickPhoto}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color={colors.primary.main} />
            ) : (
              <>
                <View style={styles.actionIconContainer}>
                  <Ionicons name="images" size={24} color={colors.primary.main} />
                </View>
                <Text style={styles.actionText}>Choose from Library</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.photoCount}>
        {photos.length} / {maxPhotos} photos
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  required: {
    color: colors.error.main,
  },
  helpText: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    marginBottom: spacing.md,
  },
  photosScroll: {
    marginBottom: spacing.md,
  },
  photosContainer: {
    gap: spacing.md,
  },
  photoWrapper: {
    position: 'relative',
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.md,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.full,
    ...shadows.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.primary.lightest,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
    borderWidth: 1,
    borderColor: colors.primary.lighter,
    borderStyle: 'dashed',
  },
  actionIconContainer: {
    marginBottom: spacing.xs,
  },
  actionText: {
    ...typography.sizes.sm,
    color: colors.primary.main,
    fontWeight: typography.weights.medium,
    textAlign: 'center',
  },
  photoCount: {
    ...typography.sizes.xs,
    color: colors.neutral[500],
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
