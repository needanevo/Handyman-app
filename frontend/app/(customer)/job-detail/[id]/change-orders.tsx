/**
 * Change Orders Screen
 *
 * View and manage change orders for a specific job
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../../../src/constants/theme';
import { Button } from '../../../../src/components/Button';
import { Card } from '../../../../src/components/Card';

export default function ChangeOrdersScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const jobId = params.id as string;

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
          <Text style={styles.title}>Change Orders</Text>
        </View>

        {/* Empty State */}
        <Card style={styles.emptyCard}>
          <Ionicons name="document-text-outline" size={64} color={colors.neutral[400]} />
          <Text style={styles.emptyTitle}>No Change Orders</Text>
          <Text style={styles.emptyText}>
            Change orders will appear here when requested
          </Text>
        </Card>
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
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    marginTop: spacing.base,
  },
  emptyCard: {
    padding: spacing['2xl'],
    alignItems: 'center',
  },
  emptyTitle: {
    ...typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    marginTop: spacing.base,
    marginBottom: spacing.xs,
  },
  emptyText: {
    ...typography.sizes.base,
    color: colors.neutral[600],
    textAlign: 'center',
  },
});
