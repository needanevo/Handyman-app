/**
 * Global Logout Button Component
 *
 * Unified logout button used across all user roles (Customer, Handyman, Contractor).
 * Uses the original pre-Phase 1.1 styling and confirmation dialog.
 */

import React from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './Button';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../constants/theme';

export const LogoutButton = () => {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/auth/welcome');
            } catch (error) {
              console.error('Logout failed:', error);
              // Still navigate even if logout fails
              router.replace('/auth/welcome');
            }
          },
        },
      ]
    );
  };

  return (
    <Button
      title="Logout"
      onPress={handleLogout}
      variant="outline"
      size="large"
      fullWidth
      icon={<Ionicons name="log-out-outline" size={20} color={colors.error.main} />}
      style={{ borderColor: colors.error.main }}
    />
  );
};
