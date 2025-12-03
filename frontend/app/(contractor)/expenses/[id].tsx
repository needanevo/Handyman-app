/**
 * Expense Detail Screen
 *
 * Shows detailed information about a specific expense entry.
 * Allows viewing receipt, category, amount, and associated job.
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
import { Badge } from '../../../src/components/Badge';
import { LoadingSpinner } from '../../../src/components/LoadingSpinner';
import { contractorAPI } from '../../../src/services/api';

export default function ExpenseDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Fetch expense detail
  const { data: expense, isLoading, error } = useQuery({
    queryKey: ['contractor-expense', id],
    queryFn: async () => {
      const response = await contractorAPI.getExpenseById(id);
      return response;
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (error || !expense) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.primary.main} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Expense Detail</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error.main} />
          <Text style={styles.errorText}>Failed to load expense details</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.retryButton}>
            <Text style={styles.retryText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primary.main} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Expense Detail</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Expense Amount Card */}
        <Card style={styles.amountCard}>
          <Text style={styles.amountLabel}>Total Amount</Text>
          <Text style={styles.amountValue}>
            {formatCurrency(expense.amount || 0)}
          </Text>
          <Badge
            variant="neutral"
            label={expense.category || 'Uncategorized'}
            style={styles.categoryBadge}
          />
        </Card>

        {/* Details Card */}
        <Card style={styles.detailCard}>
          <Text style={styles.sectionTitle}>Expense Details</Text>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="receipt-outline" size={20} color={colors.primary.main} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Description</Text>
              <Text style={styles.detailValue}>
                {expense.description || 'No description'}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="calendar-outline" size={20} color={colors.primary.main} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>
                {expense.date ? formatDate(expense.date) : 'N/A'}
              </Text>
            </View>
          </View>

          {expense.vendor && (
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="business-outline" size={20} color={colors.primary.main} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Vendor</Text>
                <Text style={styles.detailValue}>{expense.vendor}</Text>
              </View>
            </View>
          )}

          {expense.job_id && (
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="hammer-outline" size={20} color={colors.primary.main} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Associated Job</Text>
                <TouchableOpacity
                  onPress={() => router.push(`/(contractor)/jobs/${expense.job_id}`)}
                >
                  <Text style={styles.jobLink}>View Job Details →</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Card>

        {/* Receipt Photo */}
        {expense.receipt_photo && (
          <Card style={styles.receiptCard}>
            <Text style={styles.sectionTitle}>Receipt Photo</Text>
            <Image
              source={{ uri: expense.receipt_photo }}
              style={styles.receiptImage}
              resizeMode="contain"
            />
          </Card>
        )}

        {/* Notes */}
        {expense.notes && (
          <Card style={styles.notesCard}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notesText}>{expense.notes}</Text>
          </Card>
        )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.primary.main,
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  amountCard: {
    alignItems: 'center',
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  amountLabel: {
    ...typography.caption,
    color: colors.neutral[600],
    marginBottom: spacing.xs,
  },
  amountValue: {
    ...typography.h1,
    color: colors.primary.main,
    marginBottom: spacing.sm,
  },
  categoryBadge: {
    marginTop: spacing.xs,
  },
  detailCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.primary.main,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    ...typography.caption,
    color: colors.neutral[600],
    marginBottom: spacing.xs,
  },
  detailValue: {
    ...typography.body,
    color: colors.neutral[900],
  },
  jobLink: {
    ...typography.body,
    color: colors.primary.main,
    fontWeight: '600',
  },
  receiptCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  receiptImage: {
    width: '100%',
    height: 300,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.neutral[100],
  },
  notesCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  notesText: {
    ...typography.body,
    color: colors.neutral[700],
    lineHeight: 24,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  errorText: {
    ...typography.body,
    color: colors.error.main,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.sm,
  },
  retryText: {
    ...typography.button,
    color: colors.background.primary,
  },
});
