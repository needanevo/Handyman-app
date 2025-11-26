import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, borderRadius } from '../constants/theme';

interface BrandedHeaderProps {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  showLogo?: boolean;
  rightAction?: {
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    label?: string;
  };
  variant?: 'default' | 'compact';
}

/**
 * BrandedHeader - Consistent header component with navy background and gold accents
 *
 * Features:
 * - Navy background (brand-navy)
 * - Gold accent elements (brand-gold)
 * - Optional logo display (handymanBW.png)
 * - Back button navigation
 * - Optional right action button
 * - Responsive sizing
 */
export function BrandedHeader({
  title,
  subtitle,
  showBackButton = true,
  showLogo = true,
  rightAction,
  variant = 'default',
}: BrandedHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  const isCompact = variant === 'compact';

  return (
    <View style={[styles.container, isCompact && styles.containerCompact]}>
      {/* Top Row - Back button, Logo, Right Action */}
      <View style={styles.topRow}>
        {/* Back Button */}
        {showBackButton ? (
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={24} color={colors.brand.gold} />
          </TouchableOpacity>
        ) : (
          <View style={styles.backButton} />
        )}

        {/* Logo */}
        {showLogo && (
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/logos/bw/Handyman_logo_bw.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        )}

        {/* Right Action or Spacer */}
        {rightAction ? (
          <TouchableOpacity
            onPress={rightAction.onPress}
            style={styles.rightAction}
            accessibilityLabel={rightAction.label || 'Action'}
            accessibilityRole="button"
          >
            <Ionicons name={rightAction.icon} size={24} color={colors.brand.gold} />
          </TouchableOpacity>
        ) : (
          <View style={styles.rightAction} />
        )}
      </View>

      {/* Title Row */}
      {title && (
        <View style={styles.titleContainer}>
          <Text style={[styles.title, isCompact && styles.titleCompact]} numberOfLines={2}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.brand.navy,
    paddingTop: Platform.OS === 'ios' ? spacing.xl : spacing.md,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 2,
    borderBottomColor: colors.brand.gold,
  },
  containerCompact: {
    paddingTop: Platform.OS === 'ios' ? spacing.md : spacing.sm,
    paddingBottom: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    width: 50,
    height: 50,
    tintColor: colors.brand.white,
  },
  rightAction: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    ...typography.headings.h2,
    color: colors.brand.white,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  titleCompact: {
    ...typography.headings.h3,
    marginBottom: 0,
  },
  subtitle: {
    ...typography.body.small,
    color: colors.brand.paper,
    textAlign: 'center',
    opacity: 0.9,
  },
});
