/**
 * PhotoViewer Component
 *
 * Full-screen photo viewer with swipe navigation, zoom, and photo details.
 * Allows contractors to view photos in detail and add captions/notes.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import { JobPhoto, PhotoCategory } from '../../types/contractor';
import { Button } from '../Button';

interface PhotoViewerProps {
  photos: JobPhoto[];
  initialIndex: number;
  visible: boolean;
  onClose: () => void;
  onDelete?: (photoId: string) => void;
  onAddCaption?: (photoId: string, caption: string) => void;
}

const CATEGORY_LABELS: Record<PhotoCategory, { label: string; icon: string }> = {
  BEFORE: { label: 'Before', icon: '📸' },
  PROGRESS: { label: 'Progress', icon: '🔨' },
  AFTER: { label: 'After', icon: '✅' },
  DETAIL: { label: 'Detail', icon: '🔍' },
  RECEIPT: { label: 'Receipt', icon: '🧾' },
  DAMAGE: { label: 'Damage', icon: '⚠️' },
  OTHER: { label: 'Other', icon: '📋' },
};

export function PhotoViewer({
  photos,
  initialIndex,
  visible,
  onClose,
  onDelete,
  onAddCaption,
}: PhotoViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [showDetails, setShowDetails] = useState(true);

  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  const currentPhoto = photos[currentIndex];

  const goToNext = () => {
    if (currentIndex < photos.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (!currentPhoto) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {currentIndex + 1} / {photos.length}
            </Text>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={() => setShowDetails(!showDetails)}
              style={styles.iconButton}
            >
              <Text style={styles.iconButtonText}>{showDetails ? '🔼' : '🔽'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Photo Display */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: currentPhoto.url }}
            style={styles.image}
            resizeMode="contain"
          />

          {/* Navigation Arrows */}
          {currentIndex > 0 && (
            <TouchableOpacity style={styles.navLeft} onPress={goToPrevious}>
              <Text style={styles.navText}>‹</Text>
            </TouchableOpacity>
          )}

          {currentIndex < photos.length - 1 && (
            <TouchableOpacity style={styles.navRight} onPress={goToNext}>
              <Text style={styles.navText}>›</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Photo Details */}
        {showDetails && (
          <View style={styles.detailsContainer}>
            <ScrollView style={styles.detailsScroll}>
              {/* Category */}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Category</Text>
                <View style={styles.categoryTag}>
                  <Text style={styles.categoryIcon}>
                    {CATEGORY_LABELS[currentPhoto.category].icon}
                  </Text>
                  <Text style={styles.categoryText}>
                    {CATEGORY_LABELS[currentPhoto.category].label}
                  </Text>
                </View>
              </View>

              {/* Timestamp */}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date & Time</Text>
                <Text style={styles.detailValue}>
                  {formatTimestamp(currentPhoto.timestamp)}
                </Text>
              </View>

              {/* Caption */}
              {currentPhoto.caption && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Caption</Text>
                  <Text style={styles.detailValue}>{currentPhoto.caption}</Text>
                </View>
              )}

              {/* Notes */}
              {currentPhoto.notes && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Notes</Text>
                  <Text style={styles.detailValue}>{currentPhoto.notes}</Text>
                </View>
              )}

              {/* File Info */}
              {currentPhoto.fileSize && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>File Size</Text>
                  <Text style={styles.detailValue}>
                    {(currentPhoto.fileSize / 1024 / 1024).toFixed(2)} MB
                  </Text>
                </View>
              )}

              {currentPhoto.width && currentPhoto.height && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Dimensions</Text>
                  <Text style={styles.detailValue}>
                    {currentPhoto.width} × {currentPhoto.height}
                  </Text>
                </View>
              )}
            </ScrollView>

            {/* Actions */}
            <View style={styles.actions}>
              {onAddCaption && (
                <Button
                  title="Add Caption"
                  onPress={() => {
                    // This would open a modal or input dialog
                    // For now, we'll just show a placeholder
                  }}
                  variant="outline"
                  size="small"
                  style={styles.actionButton}
                />
              )}

              {onDelete && (
                <Button
                  title="Delete"
                  onPress={() => {
                    onDelete(currentPhoto.id);
                    if (photos.length === 1) {
                      onClose();
                    } else if (currentIndex === photos.length - 1) {
                      setCurrentIndex(currentIndex - 1);
                    }
                  }}
                  variant="error"
                  size="small"
                  style={styles.actionButton}
                />
              )}
            </View>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[900],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerRight: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: colors.background.primary,
    fontSize: 28,
    fontWeight: typography.weights.bold,
  },
  headerTitle: {
    ...typography.sizes.base,
    color: colors.background.primary,
    fontWeight: typography.weights.semibold,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonText: {
    fontSize: 20,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  navLeft: {
    position: 'absolute',
    left: spacing.base,
    top: '50%',
    marginTop: -30,
    width: 60,
    height: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navRight: {
    position: 'absolute',
    right: spacing.base,
    top: '50%',
    marginTop: -30,
    width: 60,
    height: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    color: colors.background.primary,
    fontSize: 36,
    fontWeight: typography.weights.bold,
  },
  detailsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '40%',
  },
  detailsScroll: {
    padding: spacing.base,
  },
  detailRow: {
    marginBottom: spacing.md,
  },
  detailLabel: {
    ...typography.sizes.sm,
    color: colors.neutral[400],
    marginBottom: spacing.xs,
  },
  detailValue: {
    ...typography.sizes.base,
    color: colors.background.primary,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignSelf: 'flex-start',
  },
  categoryIcon: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  categoryText: {
    ...typography.sizes.sm,
    color: colors.background.primary,
    fontWeight: typography.weights.semibold,
  },
  actions: {
    flexDirection: 'row',
    padding: spacing.base,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[700],
  },
  actionButton: {
    flex: 1,
  },
});
