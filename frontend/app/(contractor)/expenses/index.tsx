/**
 * Expenses Screen
 *
 * Track expenses with receipt photo capture for tax purposes.
 * Organized by job with category filtering.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../../src/constants/theme';
import { Expense, ExpenseCategory } from '../../../src/types/contractor';
import { Card } from '../../../src/components/Card';
import { Button } from '../../../src/components/Button';
import { Badge } from '../../../src/components/Badge';
import { PhotoCapture } from '../../../src/components/contractor/PhotoCapture';

export default function ExpensesScreen() {
  const router = useRouter();
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | 'ALL'>('ALL');

  // Mock data - replace with API
  const { data: expenses } = useQuery<Expense[]>({
    queryKey: ['contractor', 'expenses'],
    queryFn: async () => {
      return [
        {
          id: 'e1',
          jobId: 'j1',
          category: 'MATERIALS' as const,
          description: 'Delta Faucet Model XYZ',
          amount: 89.99,
          receiptPhotos: ['https://placeholder.com/200'],
          date: '2025-11-14',
          vendor: 'Home Depot',
          notes: 'Customer requested specific model',
          createdAt: '2025-11-14T10:30:00',
          updatedAt: '2025-11-14T10:30:00',
        },
        {
          id: 'e2',
          jobId: 'j1',
          category: 'MATERIALS' as const,
          description: 'Plumber\'s tape and washers',
          amount: 12.50,
          receiptPhotos: [],
          date: '2025-11-14',
          vendor: 'Ace Hardware',
          createdAt: '2025-11-14T11:15:00',
          updatedAt: '2025-11-14T11:15:00',
        },
      ];
    },
  });

  const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string; icon: string }[] = [
    { value: 'MATERIALS', label: 'Materials', icon: '🔨' },
    { value: 'TOOLS', label: 'Tools', icon: '🛠️' },
    { value: 'EQUIPMENT', label: 'Equipment', icon: '📦' },
    { value: 'SUBCONTRACTOR', label: 'Subcontractor', icon: '👷' },
    { value: 'FUEL', label: 'Fuel', icon: '⛽' },
    { value: 'PERMITS', label: 'Permits', icon: '📋' },
    { value: 'OTHER', label: 'Other', icon: '💰' },
  ];

  const filteredExpenses = expenses?.filter((expense) => {
    if (selectedCategory === 'ALL') return true;
    return expense.category === selectedCategory;
  });

  const totalExpenses = expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;
  const thisMonthExpenses =
    expenses?.filter((exp) => {
      const expDate = new Date(exp.date);
      const now = new Date();
      return (
        expDate.getMonth() === now.getMonth() &&
        expDate.getFullYear() === now.getFullYear()
      );
    }).reduce((sum, exp) => sum + exp.amount, 0) || 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getCategoryIcon = (category: ExpenseCategory) => {
    return EXPENSE_CATEGORIES.find((c) => c.value === category)?.icon || '💰';
  };

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
        <Text style={styles.headerTitle}>Expenses</Text>
        <Button
          title="Add Expense"
          onPress={() => setShowAddExpense(true)}
          variant="primary"
          size="small"
        />
      </View>

      {/* Summary Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.summaryContainer}
        contentContainerStyle={styles.summaryContent}
      >
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>This Month</Text>
          <Text style={[styles.summaryValue, styles.expenseText]}>
            {formatCurrency(thisMonthExpenses)}
          </Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>All Time</Text>
          <Text style={[styles.summaryValue, styles.expenseText]}>
            {formatCurrency(totalExpenses)}
          </Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Items</Text>
          <Text style={styles.summaryValue}>{expenses?.length || 0}</Text>
        </View>
      </ScrollView>

      {/* Category Filter */}
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
            All
          </Text>
        </TouchableOpacity>

        {EXPENSE_CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.value}
            style={[
              styles.filterChip,
              selectedCategory === cat.value && styles.filterChipActive,
            ]}
            onPress={() => setSelectedCategory(cat.value)}
          >
            <Text style={styles.filterChipIcon}>{cat.icon}</Text>
            <Text
              style={[
                styles.filterChipText,
                selectedCategory === cat.value && styles.filterChipTextActive,
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Expense List */}
      <FlatList
        data={filteredExpenses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card
            style={styles.expenseCard}
            onPress={() => router.push(`/(contractor)/expenses/${item.id}`)}
          >
            <View style={styles.expenseHeader}>
              <View style={styles.expenseHeaderLeft}>
                <Text style={styles.categoryIcon}>{getCategoryIcon(item.category)}</Text>
                <View style={styles.expenseInfo}>
                  <Text style={styles.expenseDescription}>{item.description}</Text>
                  <Text style={styles.expenseDate}>{formatDate(item.date)}</Text>
                </View>
              </View>
              <Text style={styles.expenseAmount}>{formatCurrency(item.amount)}</Text>
            </View>

            {item.vendor && (
              <View style={styles.expenseFooter}>
                <Text style={styles.vendorLabel}>Vendor:</Text>
                <Text style={styles.vendorValue}>{item.vendor}</Text>
                {item.receiptPhotos.length > 0 && (
                  <View style={styles.receiptBadge}>
                    <Text style={styles.receiptBadgeText}>📸 Receipt</Text>
                  </View>
                )}
              </View>
            )}
          </Card>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🧾</Text>
            <Text style={styles.emptyText}>No expenses yet</Text>
            <Text style={styles.emptySubtext}>
              Track your job expenses and receipts for tax time
            </Text>
          </View>
        }
      />

      {/* Add Expense Modal */}
      <AddExpenseModal
        visible={showAddExpense}
        onClose={() => setShowAddExpense(false)}
      />
    </SafeAreaView>
  );
}

function AddExpenseModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const [category, setCategory] = useState<ExpenseCategory>('MATERIALS');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [vendor, setVendor] = useState('');
  const [notes, setNotes] = useState('');
  const [receiptPhotos, setReceiptPhotos] = useState<string[]>([]);
  const [showPhotoCapture, setShowPhotoCapture] = useState(false);

  const CATEGORIES: { value: ExpenseCategory; label: string; icon: string }[] = [
    { value: 'MATERIALS', label: 'Materials', icon: '🔨' },
    { value: 'TOOLS', label: 'Tools', icon: '🛠️' },
    { value: 'EQUIPMENT', label: 'Equipment', icon: '📦' },
    { value: 'SUBCONTRACTOR', label: 'Subcontractor', icon: '👷' },
    { value: 'FUEL', label: 'Fuel', icon: '⛽' },
    { value: 'PERMITS', label: 'Permits', icon: '📋' },
    { value: 'OTHER', label: 'Other', icon: '💰' },
  ];

  const handleSave = () => {
    if (!description || !amount) {
      Alert.alert('Missing Information', 'Please enter description and amount');
      return;
    }

    // In production, save to backend
    console.log('Saving expense:', { category, description, amount, vendor, notes, receiptPhotos });
    onClose();
  };

  const handlePhotoCapture = (photo: any) => {
    setReceiptPhotos([...receiptPhotos, photo.uri]);
    setShowPhotoCapture(false);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer} edges={['bottom']}>
        <View style={[styles.modalHeader, { paddingTop: insets.top + spacing.md }]}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalClose}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Add Expense</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.modalSave}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.modalContent}
          contentContainerStyle={styles.modalContentContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Category Selection */}
          <Text style={styles.label}>Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
          >
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.value}
                style={[
                  styles.categoryButton,
                  category === cat.value && styles.categoryButtonActive,
                ]}
                onPress={() => setCategory(cat.value)}
              >
                <Text style={styles.categoryButtonIcon}>{cat.icon}</Text>
                <Text
                  style={[
                    styles.categoryButtonText,
                    category === cat.value && styles.categoryButtonTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Description */}
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.input}
            placeholder="What did you purchase?"
            value={description}
            onChangeText={setDescription}
          />

          {/* Amount */}
          <Text style={styles.label}>Amount</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />
          </View>

          {/* Vendor */}
          <Text style={styles.label}>Vendor (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Where did you buy it?"
            value={vendor}
            onChangeText={setVendor}
          />

          {/* Notes */}
          <Text style={styles.label}>Notes (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Additional details..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />

          {/* Receipt Photos */}
          <Text style={styles.label}>Receipt Photos</Text>
          <Button
            title={`${receiptPhotos.length > 0 ? `${receiptPhotos.length} Photos -` : ''} Add Receipt Photo`}
            onPress={() => setShowPhotoCapture(true)}
            variant="outline"
            size="medium"
          />
        </ScrollView>

        {/* Photo Capture Modal */}
        {showPhotoCapture && (
          <Modal visible={showPhotoCapture} animationType="slide">
            <SafeAreaView style={styles.photoModalContainer} edges={['top', 'bottom']}>
              <View style={styles.photoModalHeader}>
                <Text style={styles.photoModalTitle}>Add Receipt Photo</Text>
                <TouchableOpacity onPress={() => setShowPhotoCapture(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.photoModalContent}>
                <PhotoCapture
                  onPhotoCapture={handlePhotoCapture}
                  category="RECEIPT"
                  allowCategorySelection={false}
                  showPreview={true}
                />
              </View>
            </SafeAreaView>
          </Modal>
        )}
      </SafeAreaView>
    </Modal>
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
    flex: 1,
    marginLeft: spacing.sm,
  },
  summaryContainer: {
    marginTop: spacing.base,
    maxHeight: 100,
  },
  summaryContent: {
    paddingHorizontal: spacing.base,
    gap: spacing.md,
  },
  summaryCard: {
    backgroundColor: colors.background.primary,
    padding: spacing.base,
    borderRadius: borderRadius.lg,
    minWidth: 140,
    ...shadows.sm,
  },
  summaryLabel: {
    ...typography.sizes.xs,
    color: colors.neutral[600],
    marginBottom: spacing.xs,
  },
  summaryValue: {
    ...typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
  },
  expenseText: {
    color: colors.error.main,
  },
  filterContainer: {
    marginTop: spacing.base,
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
  listContent: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.xl,
  },
  expenseCard: {
    marginBottom: spacing.md,
    padding: spacing.base,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  expenseHeaderLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseDescription: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  expenseDate: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
  },
  expenseAmount: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.error.main,
  },
  expenseFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
    gap: spacing.sm,
  },
  vendorLabel: {
    ...typography.sizes.xs,
    color: colors.neutral[600],
  },
  vendorValue: {
    ...typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.neutral[700],
    flex: 1,
  },
  receiptBadge: {
    backgroundColor: colors.success.lightest,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  receiptBadgeText: {
    ...typography.sizes.xs,
    color: colors.success.dark,
    fontWeight: typography.weights.semibold,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['5xl'],
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyText: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[700],
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  modalClose: {
    fontSize: 28,
    color: colors.neutral[600],
    width: 60,
  },
  modalTitle: {
    ...typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
  },
  modalSave: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.primary.main,
    width: 60,
    textAlign: 'right',
  },
  modalContent: {
    flex: 1,
    padding: spacing.base,
  },
  modalContentContainer: {
    paddingBottom: 350, // Extra space for keyboard so notes field is visible
  },
  label: {
    ...typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[700],
    marginBottom: spacing.sm,
    marginTop: spacing.base,
  },
  input: {
    ...typography.sizes.base,
    color: colors.neutral[900],
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral[300],
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    paddingHorizontal: spacing.base,
  },
  currencySymbol: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[600],
    marginRight: spacing.sm,
  },
  amountInput: {
    flex: 1,
    ...typography.sizes.base,
    color: colors.neutral[900],
    paddingVertical: spacing.md,
  },
  categoriesScroll: {
    marginBottom: spacing.md,
  },
  categoryButton: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    backgroundColor: colors.background.primary,
    marginRight: spacing.sm,
    minWidth: 80,
  },
  categoryButtonActive: {
    borderColor: colors.primary.main,
    backgroundColor: colors.primary.lightest,
  },
  categoryButtonIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  categoryButtonText: {
    ...typography.sizes.xs,
    color: colors.neutral[700],
    textAlign: 'center',
  },
  categoryButtonTextActive: {
    color: colors.primary.main,
    fontWeight: typography.weights.semibold,
  },
  photoModalContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  photoModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md + 16,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  photoModalTitle: {
    ...typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
  },
  photoModalContent: {
    flex: 1,
    padding: spacing.base,
  },
});
