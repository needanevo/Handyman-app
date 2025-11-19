/**
 * FloatingCameraButton Component
 *
 * Always-accessible camera button that floats on job detail screens.
 * Provides instant photo capture access while working on jobs.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { colors, spacing, shadows, borderRadius } from '../../constants/theme';

interface FloatingCameraButtonProps {
  onPress: () => void;
  badge?: number;  // Number of photos taken today
  position?: 'bottom-right' | 'bottom-center';
}

export function FloatingCameraButton({
  onPress,
  badge,
  position = 'bottom-right',
}: FloatingCameraButtonProps) {
  return (
    <View style={[styles.container, styles[position]]}>
      <TouchableOpacity
        style={styles.button}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text style={styles.icon}>📷</Text>
        {badge !== undefined && badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 1000,
  },
  'bottom-right': {
    bottom: spacing.xl,
    right: spacing.base,
  },
  'bottom-center': {
    bottom: spacing.xl,
    left: '50%',
    marginLeft: -30,  // Half of button width
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.xl,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary.dark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  icon: {
    fontSize: 28,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.error.main,
    borderRadius: borderRadius.full,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background.primary,
  },
  badgeText: {
    color: colors.background.primary,
    fontSize: 11,
    fontWeight: 'bold',
  },
});
