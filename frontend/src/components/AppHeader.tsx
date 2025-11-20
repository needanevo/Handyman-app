/**
 * App Header Component
 *
 * Consistent header across all screens with:
 * - Back button
 * - Title
 * - Return to dashboard button
 * - 16px additional top padding for better positioning
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, shadows } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';

interface AppHeaderProps {
  title: string;
  showBack?: boolean;
  showDashboard?: boolean;
  onBackPress?: () => void;
  rightElement?: React.ReactNode;
}

export function AppHeader({
  title,
  showBack = true,
  showDashboard = true,
  onBackPress,
  rightElement,
}: AppHeaderProps) {
  const router = useRouter();
  const { user } = useAuth();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  const handleDashboardPress = () => {
    if (user?.role === 'technician') {
      router.push('/(contractor)/dashboard');
    } else if (user?.role === 'admin') {
      router.push('/(admin)/dashboard');
    } else {
      router.push('/home');
    }
  };

  return (
    <View style={styles.header}>
      <View style={styles.leftSection}>
        {showBack && (
          <TouchableOpacity
            onPress={handleBackPress}
            style={styles.iconButton}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color={colors.primary.main} />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      <View style={styles.rightSection}>
        {rightElement ? (
          rightElement
        ) : showDashboard ? (
          <TouchableOpacity
            onPress={handleDashboardPress}
            style={styles.iconButton}
            accessibilityLabel="Return to dashboard"
          >
            <Ionicons name="home" size={24} color={colors.primary.main} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg + 16, // 20px + 16px = 36px total top padding
    paddingBottom: spacing.lg,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
    ...shadows.sm,
  },
  leftSection: {
    width: 40,
    alignItems: 'flex-start',
  },
  rightSection: {
    width: 40,
    alignItems: 'flex-end',
  },
  title: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    flex: 1,
    textAlign: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
