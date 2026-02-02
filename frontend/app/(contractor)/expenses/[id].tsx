/**
 * Expense Detail Screen
 *
 * View full details of a specific expense with receipt photos.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../../src/constants/theme';
import { Card } from '../../../src/components/Card';
import { Button } from '../../../src/components/Button';
import { LoadingSpinner } from '../../../src/components/LoadingSpinner';
import { EmptyState } from '../../../src/components/EmptyState';
import { contractorAPI } from '../../../src/services/api';

export default function ExpenseDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Fetch expense details
  const { data: expense, isLoading } = useQuery({
    queryKey: ['contractor', 'expense', id],
    queryFn: async () => {
      if (!id) throw new Error('No expense ID provided');
      // TODO: Implement actual API call
      // return await contractorAPI.getExpenseById(id);

      // Mock data for now
      return {
        id,
        category: 'MATERIALS' as const,
        description: 'Plumbing supplies for kitchen renovation',
        amount: 245.50,
        date: '2025-11-15',
        vendor: 'Home Depot',
        notes: 'Purchased pipes, fittings, and sealant for job #1234',
        receiptPhotos: [],
        jobId: 'j1',
      };
    },
    enabled: !!id,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      MATERIALS: '🔨',
      TOOLS: '🛠️',
      EQUIPMENT: '📦',
      SUBCONTRACTOR: '👷',
      FUEL: '⛽',
      PERMITS: '📋',
      OTHER: '💰',
    };
    return icons[category] || '💰';
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Loading expense details..." />;
  }

  if (!expense) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState
          icon="receipt-outline"
          title="Expense Not Found"
          description="This expense could not be loaded"
          actionLabel="Go Back"
          onAction={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Expense Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Amount Card */}
        <Card style={styles.amountCard}>
          <Text style={styles.categoryIcon}>{getCategoryIcon(expense.category)}</Text>
          <Text style={styles.amount}>{formatCurrency(expense.amount)}</Text>
          <Text style={styles.category}>{expense.category}</Text>
        </Card>

        {/* Details Card */}
        <Card style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{formatDate(expense.date)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Description</Text>
            <Text style={styles.detailValue}>{expense.description}</Text>
          </View>

          {expense.vendor && (
            <>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Vendor</Text>
                <Text style={styles.detailValue}>{expense.vendor}</Text>
              </View>
            </>
          )}

          {expense.notes && (
            <>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Notes</Text>
                <Text style={styles.detailValue}>{expense.notes}</Text>
              </View>
            </>
          )}
        </Card>

        {/* Receipt Photos */}
        {expense.receiptPhotos && expense.receiptPhotos.length > 0 && (
          <Card style={styles.photosCard}>
            <Text style={styles.sectionTitle}>Receipt Photos</Text>
            <View style={styles.photoGrid}>
              {expense.receiptPhotos.map((photo, index) => (
                <TouchableOpacity key={index} style={styles.photoContainer}>
                  <Image source={{ uri: photo }} style={styles.photoImage} />
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Edit Expense"
            onPress={() => {
              // TODO: Navigate to edit screen
              console.log('Edit expense', id);
            }}
            variant="outline"
            size="large"
            fullWidth
          />
          <Button
            title="Delete Expense"
            onPress={() => {
              // TODO: Implement delete
              console.log('Delete expense', id);
            }}
            variant="outline"
            size="large"
            fullWidth
            icon={<Ionicons name="trash-outline" size={20} color={colors.error.main} />}
            style={styles.deleteButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.lg,
    backgroundColor: colors.background.primary,
    ...shadows.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.base,
    paddingBottom: spacing['4xl'],
  },
  amountCard: {
    alignItems: 'center',
    padding: spacing.xl,
    marginBottom: spacing.base,
  },
  categoryIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  amount: {
    ...typography.sizes['4xl'],
    fontWeight: typography.weights.bold,
    color: colors.error.main,
    marginBottom: spacing.xs,
  },
  category: {
    ...typography.sizes.base,
    color: colors.neutral[600],
    textTransform: 'capitalize',
  },
  detailsCard: {
    padding: spacing.lg,
    marginBottom: spacing.base,
  },
  detailRow: {
    paddingVertical: spacing.sm,
  },
  detailLabel: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    marginBottom: spacing.xs,
  },
  detailValue: {
    ...typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.neutral[900],
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral[200],
    marginVertical: spacing.md,
  },
  photosCard: {
    padding: spacing.lg,
    marginBottom: spacing.base,
  },
  sectionTitle: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  photoContainer: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  actions: {
    gap: spacing.md,
  },
  deleteButton: {
    borderColor: colors.error.main,
  },
});
