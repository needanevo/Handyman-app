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
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../../src/constants/theme';
import { Expense, ExpenseCategory } from '../../../src/types/contractor';
import { Card } from '../../../src/components/Card';
import { Button } from '../../../src/components/Button';
import { Badge } from '../../../src/components/Badge';
import { PhotoCapture } from '../../../src/components/contractor/PhotoCapture';
import { contractorAPI } from '../../../src/services/api';

export default function ExpensesScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | 'ALL'>('ALL');
  const [selectedReceiptPhotos, setSelectedReceiptPhotos] = useState<string[]>([]);
  const [showReceiptViewer, setShowReceiptViewer] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // Fetch expenses from API
  const { data: expenses } = useQuery<Expense[]>({
    queryKey: ['contractor', 'expenses'],
    queryFn: async () => {
      const response = await contractorAPI.getExpenses();
      return response;
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
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${dateStr}, ${timeStr}`;
  };

  const getCategoryIcon = (category: ExpenseCategory) => {
    return EXPENSE_CATEGORIES.find((c) => c.value === category)?.icon || '💰';
  };

  const handleExportPDF = async () => {
    try {
      const exportData: ExpenseExportData[] = (filteredExpenses || []).map((exp) => ({
        id: exp.id,
        category: exp.category,
        description: exp.description,
        amount: exp.amount,
        vendor: exp.vendor,
        date: exp.date,
        notes: exp.notes,
      }));

      await exportExpensesToPDF(exportData, 'expense-report');
      Alert.alert('Success', 'Expense report exported successfully!');
    } catch (error) {
      Alert.alert('Export Failed', 'Could not export expense report. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <AppHeader
        title="Expenses"
        showBack={true}
        showDashboard={true}
        rightElement={
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={handleExportPDF}
              style={styles.exportButton}
              accessibilityLabel="Export to PDF"
            >
              <Ionicons name="download-outline" size={24} color={colors.primary.main} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowAddExpense(true)}
              style={styles.addButton}
              accessibilityLabel="Add expense"
            >
              <Ionicons name="add-circle" size={28} color={colors.primary.main} />
            </TouchableOpacity>
          </View>
        }
      />

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
                  <Text style={styles.expenseDate}>
                    {formatDate(item.date)}
                  </Text>
                  {item.createdAt && (
                    <Text style={styles.expenseTimestamp}>
                      Added: {formatDateTime(item.createdAt)}
                    </Text>
                  )}
                </View>
              </View>
              <View style={styles.expenseAmountContainer}>
                <Text style={styles.expenseAmount}>{formatCurrency(item.amount)}</Text>
              </View>
            </View>

            {(item.vendor || (item.receiptPhotos && item.receiptPhotos.length > 0)) && (
              <View style={styles.expenseFooter}>
                {item.vendor && (
                  <View style={styles.vendorContainer}>
                    <Text style={styles.vendorLabel}>Vendor:</Text>
                    <Text style={styles.vendorValue}>{item.vendor}</Text>
                  </View>
                )}
                {item.receiptPhotos && item.receiptPhotos.length > 0 && (
                  <TouchableOpacity
                    style={styles.receiptButton}
                    onPress={() => {
                      setSelectedReceiptPhotos(item.receiptPhotos);
                      setCurrentPhotoIndex(0);
                      setShowReceiptViewer(true);
                    }}
                  >
                    <Ionicons name="image" size={16} color={colors.background.primary} style={styles.receiptIcon} />
                    <Text style={styles.receiptButtonText}>
                      {item.receiptPhotos.length} {item.receiptPhotos.length === 1 ? 'Photo' : 'Photos'}
                    </Text>
                  </TouchableOpacity>
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
        queryClient={queryClient}
      />

      {/* Receipt Photo Viewer Modal */}
      <Modal
        visible={showReceiptViewer}
        animationType="fade"
        onRequestClose={() => setShowReceiptViewer(false)}
      >
        <SafeAreaView style={styles.receiptViewerContainer} edges={['top', 'bottom']}>
          <View style={styles.receiptViewerHeader}>
            <Text style={styles.receiptViewerTitle}>Receipt Photo</Text>
            <TouchableOpacity onPress={() => setShowReceiptViewer(false)}>
              <Ionicons name="close" size={32} color={colors.neutral[900]} />
            </TouchableOpacity>
          </View>

          {selectedReceiptPhotos.length > 0 && (
            <View style={styles.receiptViewerContent}>
              <Image
                source={{ uri: selectedReceiptPhotos[currentPhotoIndex] }}
                style={styles.receiptImage}
                resizeMode="contain"
              />

              {selectedReceiptPhotos.length > 1 && (
                <View style={styles.receiptViewerPagination}>
                  <TouchableOpacity
                    onPress={() => setCurrentPhotoIndex(Math.max(0, currentPhotoIndex - 1))}
                    disabled={currentPhotoIndex === 0}
                    style={styles.paginationButton}
                  >
                    <Ionicons
                      name="chevron-back"
                      size={24}
                      color={currentPhotoIndex === 0 ? colors.neutral[400] : colors.primary.main}
                    />
                  </TouchableOpacity>

                  <Text style={styles.paginationText}>
                    {currentPhotoIndex + 1} / {selectedReceiptPhotos.length}
                  </Text>

                  <TouchableOpacity
                    onPress={() => setCurrentPhotoIndex(Math.min(selectedReceiptPhotos.length - 1, currentPhotoIndex + 1))}
                    disabled={currentPhotoIndex === selectedReceiptPhotos.length - 1}
                    style={styles.paginationButton}
                  >
                    <Ionicons
                      name="chevron-forward"
                      size={24}
                      color={currentPhotoIndex === selectedReceiptPhotos.length - 1 ? colors.neutral[400] : colors.primary.main}
                    />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function AddExpenseModal({ visible, onClose, queryClient }: { visible: boolean; onClose: () => void; queryClient: any }) {
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

  // Use mutation for optimistic updates
  const addExpenseMutation = useMutation({
    mutationFn: (newExpense: {
      jobId: string;
      category: string;
      description: string;
      amount: number;
      date: string;
      vendor?: string;
      notes?: string;
    }) => contractorAPI.addExpense(newExpense),
    onMutate: async (newExpense) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries(['contractor', 'expenses']);

      // Snapshot previous value
      const previousExpenses = queryClient.getQueryData(['contractor', 'expenses']) as Expense[] | undefined;

      // Optimistically update with temporary expense
      const now = new Date().toISOString();
      const optimisticExpense: Expense = {
        id: `temp-${Date.now()}`,
        jobId: newExpense.jobId,
        category: newExpense.category as ExpenseCategory,
        description: newExpense.description,
        amount: newExpense.amount,
        date: newExpense.date,
        vendor: newExpense.vendor,
        notes: newExpense.notes,
        receiptPhotos: [],
        createdAt: now,
        updatedAt: now,
      };

      queryClient.setQueryData(
        ['contractor', 'expenses'],
        (old: any) => [optimisticExpense, ...(old || [])]
      );

      return { previousExpenses };
    },
    onError: (error: any, newExpense, context: any) => {
      // Rollback on error
      if (context?.previousExpenses) {
        queryClient.setQueryData(['contractor', 'expenses'], context.previousExpenses);
      }
      console.error('Save expense error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.detail || 'Failed to save expense. Please try again.'
      );
    },
    onSuccess: (data) => {
      // Replace temporary expense with real one from server
      queryClient.setQueryData(
        ['contractor', 'expenses'],
        (old: any) => {
          const filtered = (old || []).filter((exp: any) => !exp.id.startsWith('temp-'));
          return [data, ...filtered];
        }
      );

      // Close modal and reset form
      onClose();
      setDescription('');
      setAmount('');
      setVendor('');
      setNotes('');
      setReceiptPhotos([]);
      setCategory('MATERIALS');
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries(['contractor', 'expenses']);
    },
  });

  const handleSave = async () => {
    if (!description || !amount) {
      Alert.alert('Missing Information', 'Please enter description and amount');
      return;
    }

    addExpenseMutation.mutate({
      jobId: '', // TODO: Add job selection
      category,
      description,
      amount: parseFloat(amount),
      date: new Date().toISOString(),
      vendor: vendor || undefined,
      notes: notes || undefined,
    });
  };

  const handlePhotoCapture = (photo: any) => {
    setReceiptPhotos([...receiptPhotos, photo.uri]);
    setShowPhotoCapture(false);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer} edges={['bottom']}>
        <View style={[styles.modalHeader, { paddingTop: insets.top + spacing.md }]}>
          <TouchableOpacity onPress={onClose} disabled={addExpenseMutation.isPending}>
            <Text style={styles.modalClose}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Add Expense</Text>
          <TouchableOpacity onPress={handleSave} disabled={addExpenseMutation.isPending}>
            <Text style={[styles.modalSave, addExpenseMutation.isPending && styles.modalSaveDisabled]}>
              {addExpenseMutation.isPending ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
          keyboardVerticalOffset={0}
        >
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
        </KeyboardAvoidingView>

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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  exportButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: spacing.xs / 2,
  },
  expenseTimestamp: {
    ...typography.sizes.xs,
    color: colors.neutral[500],
    fontStyle: 'italic',
  },
  expenseAmountContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: spacing.md,
  },
  expenseAmount: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.error.main,
  },
  expenseFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
    gap: spacing.md,
  },
  vendorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.xs,
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
  receiptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  receiptIcon: {
    marginRight: spacing.xs / 2,
  },
  receiptButtonText: {
    ...typography.sizes.xs,
    color: colors.background.primary,
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
  modalSaveDisabled: {
    color: colors.neutral[400],
  },
  keyboardView: {
    flex: 1,
  },
  modalContent: {
    flex: 1,
    padding: spacing.base,
  },
  modalContentContainer: {
    paddingBottom: spacing['4xl'], // Extra space at bottom for better scrolling
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
  receiptViewerContainer: {
    flex: 1,
    backgroundColor: colors.neutral[900],
  },
  receiptViewerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  receiptViewerTitle: {
    ...typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
  },
  receiptViewerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  receiptImage: {
    width: '100%',
    height: '100%',
  },
  receiptViewerPagination: {
    position: 'absolute',
    bottom: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    gap: spacing.lg,
    ...shadows.lg,
  },
  paginationButton: {
    padding: spacing.xs,
  },
  paginationText: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
  },
});
