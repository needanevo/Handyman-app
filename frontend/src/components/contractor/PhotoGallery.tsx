/**
 * PhotoGallery Component
 *
 * Displays job photos in an organized grid with category filtering.
 * Supports tap to view full screen, categorization, and photo management.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../constants/theme';
import { JobPhoto, PhotoCategory } from '../../types/contractor';
import { Badge } from '../Badge';

interface PhotoGalleryProps {
  photos: JobPhoto[];
  onPhotoPress: (photo: JobPhoto, index: number) => void;
  onDeletePhoto?: (photoId: string) => void;
  showCategoryFilter?: boolean;
  emptyMessage?: string;
}

const CATEGORY_LABELS: Record<PhotoCategory, { label: string; icon: string; color: string }> = {
  BEFORE: { label: 'Before', icon: '📸', color: colors.secondary.main },
  PROGRESS: { label: 'Progress', icon: '🔨', color: colors.warning.main },
  AFTER: { label: 'After', icon: '✅', color: colors.success.main },
  DETAIL: { label: 'Detail', icon: '🔍', color: colors.primary.main },
  RECEIPT: { label: 'Receipt', icon: '🧾', color: colors.neutral[600] },
  DAMAGE: { label: 'Damage', icon: '⚠️', color: colors.error.main },
  OTHER: { label: 'Other', icon: '📋', color: colors.neutral[500] },
};

export function PhotoGallery({
  photos,
  onPhotoPress,
  onDeletePhoto,
  showCategoryFilter = true,
  emptyMessage = 'No photos yet. Start documenting your work!',
}: PhotoGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<PhotoCategory | 'ALL'>('ALL');

  const screenWidth = Dimensions.get('window').width;
  const numColumns = 3;
  const imageSize = (screenWidth - spacing.base * 2 - spacing.sm * (numColumns - 1)) / numColumns;

  // Filter photos by category
  const filteredPhotos =
    selectedCategory === 'ALL'
      ? photos
      : photos.filter((photo) => photo.category === selectedCategory);

  // Group photos by category for organized display
  const photosByCategory = photos.reduce((acc, photo) => {
    if (!acc[photo.category]) {
      acc[photo.category] = [];
    }
    acc[photo.category].push(photo);
    return acc;
  }, {} as Record<PhotoCategory, JobPhoto[]>);

  // Get category counts
  const categoryCounts = Object.entries(photosByCategory).map(([category, categoryPhotos]) => ({
    category: category as PhotoCategory,
    count: categoryPhotos.length,
  }));

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (photos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📷</Text>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Category Filter */}
      {showCategoryFilter && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedCategory === 'ALL' && styles.filterChipActive,
            ]}
            onPress={() => setSelectedCategory('ALL')}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedCategory === 'ALL' && styles.filterChipTextActive,
              ]}
            >
              All ({photos.length})
            </Text>
          </TouchableOpacity>

          {categoryCounts.map(({ category, count }) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.filterChip,
                selectedCategory === category && styles.filterChipActive,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={styles.filterChipIcon}>
                {CATEGORY_LABELS[category].icon}
              </Text>
              <Text
                style={[
                  styles.filterChipText,
                  selectedCategory === category && styles.filterChipTextActive,
                ]}
              >
                {CATEGORY_LABELS[category].label} ({count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Photo Grid */}
      <View style={styles.gridContainer}>
        {filteredPhotos.map((photo, index) => (
          <TouchableOpacity
            key={photo.id}
            style={[styles.photoContainer, { width: imageSize, height: imageSize }]}
            onPress={() => onPhotoPress(photo, index)}
            activeOpacity={0.8}
          >
            <Image
              source={{ uri: photo.thumbnailUrl || photo.url }}
              style={styles.photoImage}
              resizeMode="cover"
            />

            {/* Category Badge */}
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>
                {CATEGORY_LABELS[photo.category].icon}
              </Text>
            </View>

            {/* Timestamp */}
            <View style={styles.timestampOverlay}>
              <Text style={styles.timestampText}>{formatTimestamp(photo.timestamp)}</Text>
            </View>

            {/* Caption Preview */}
            {photo.caption && (
              <View style={styles.captionOverlay}>
                <Text style={styles.captionText} numberOfLines={2}>
                  {photo.caption}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Photo Count */}
      <View style={styles.countContainer}>
        <Text style={styles.countText}>
          Showing {filteredPhotos.length} of {photos.length} photos
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterContainer: {
    marginBottom: spacing.md,
    maxHeight: 50,
  },
  filterContent: {
    paddingHorizontal: spacing.base,
    gap: spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: colors.neutral[300],
  },
  filterChipActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  filterChipIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  filterChipText: {
    ...typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.neutral[700],
  },
  filterChipTextActive: {
    color: colors.background.primary,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
  },
  photoContainer: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.neutral[100],
    ...shadows.sm,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: borderRadius.sm,
    padding: spacing.xs,
  },
  categoryBadgeText: {
    fontSize: 14,
  },
  timestampOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
  },
  timestampText: {
    ...typography.sizes.xs,
    color: colors.background.primary,
    fontWeight: typography.weights.medium,
  },
  captionOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },
  captionText: {
    ...typography.sizes.xs,
    color: colors.background.primary,
  },
  countContainer: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  countText: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['4xl'],
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyText: {
    ...typography.sizes.base,
    color: colors.neutral[600],
    textAlign: 'center',
  },
});
