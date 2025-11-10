/**
 * Tax Reports Screen
 *
 * Generate comprehensive tax reports with photo documentation.
 * Designed to simplify tax preparation with categorized summaries.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { colors, spacing, typography, borderRadius, shadows } from '../../../src/constants/theme';
import { TaxReport } from '../../../src/types/contractor';
import { Card } from '../../../src/components/Card';
import { Button } from '../../../src/components/Button';

export default function TaxReportsScreen() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Mock data - replace with API call
  const { data: report } = useQuery<TaxReport>({
    queryKey: ['contractor', 'reports', selectedPeriod, selectedYear, selectedMonth],
    queryFn: async () => {
      // Mock tax report
      return {
        period: selectedPeriod,
        startDate: `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-01`,
        endDate: `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-30`,
        income: {
          totalRevenue: 8500.0,
          jobCount: 12,
          averageJobValue: 708.33,
        },
        expenses: {
          totalExpenses: 2100.0,
          byCategory: [
            {
              category: 'MATERIALS' as const,
              amount: 1500.0,
              percentage: 71.43,
            },
            {
              category: 'FUEL' as const,
              amount: 400.0,
              percentage: 19.05,
            },
            {
              category: 'TOOLS' as const,
              amount: 200.0,
              percentage: 9.52,
            },
          ],
        },
        mileage: {
          totalMiles: 245.5,
          deductionRate: 0.7,
          totalDeduction: 171.85,
        },
        profitLoss: {
          grossIncome: 8500.0,
          totalExpenses: 2100.0,
          mileageDeduction: 171.85,
          netProfit: 6228.15,
        },
      };
    },
  });

  const MONTHS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleExportPDF = () => {
    // In production, download PDF
    Alert.alert(
      'Export Report',
      'Your tax report will be downloaded as a PDF with all supporting documentation.'
    );
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

  if (!report) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading report...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tax Reports</Text>
        <TouchableOpacity onPress={handleExportPDF}>
          <Text style={styles.exportButton}>📥 Export PDF</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          <TouchableOpacity
            style={[
              styles.periodButton,
              selectedPeriod === 'monthly' && styles.periodButtonActive,
            ]}
            onPress={() => setSelectedPeriod('monthly')}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === 'monthly' && styles.periodButtonTextActive,
              ]}
            >
              Monthly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.periodButton,
              selectedPeriod === 'yearly' && styles.periodButtonActive,
            ]}
            onPress={() => setSelectedPeriod('yearly')}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === 'yearly' && styles.periodButtonTextActive,
              ]}
            >
              Yearly
            </Text>
          </TouchableOpacity>
        </View>

        {/* Month/Year Selector */}
        {selectedPeriod === 'monthly' && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.monthSelector}
            contentContainerStyle={styles.monthSelectorContent}
          >
            {MONTHS.map((month, index) => (
              <TouchableOpacity
                key={month}
                style={[
                  styles.monthChip,
                  selectedMonth === index + 1 && styles.monthChipActive,
                ]}
                onPress={() => setSelectedMonth(index + 1)}
              >
                <Text
                  style={[
                    styles.monthChipText,
                    selectedMonth === index + 1 && styles.monthChipTextActive,
                  ]}
                >
                  {month}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Report Period */}
        <View style={styles.reportPeriod}>
          <Text style={styles.reportPeriodText}>
            {selectedPeriod === 'monthly'
              ? `${MONTHS[selectedMonth - 1]} ${selectedYear}`
              : `${selectedYear}`}
          </Text>
        </View>

        {/* Profit/Loss Summary */}
        <Card style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Profit & Loss Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Gross Income</Text>
            <Text style={[styles.summaryValue, styles.incomeText]}>
              {formatCurrency(report.profitLoss.grossIncome)}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Expenses</Text>
            <Text style={[styles.summaryValue, styles.expenseText]}>
              -{formatCurrency(report.profitLoss.totalExpenses)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Mileage Deduction</Text>
            <Text style={[styles.summaryValue, styles.expenseText]}>
              -{formatCurrency(report.profitLoss.mileageDeduction)}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabelBold}>Net Profit</Text>
            <Text style={[styles.summaryValueBold, styles.profitText]}>
              {formatCurrency(report.profitLoss.netProfit)}
            </Text>
          </View>
        </Card>

        {/* Income Details */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Income Details</Text>

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Total Revenue</Text>
              <Text style={[styles.detailValue, styles.incomeText]}>
                {formatCurrency(report.income.totalRevenue)}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Jobs Completed</Text>
              <Text style={styles.detailValue}>{report.income.jobCount}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Average Job Value</Text>
              <Text style={styles.detailValue}>
                {formatCurrency(report.income.averageJobValue)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Expense Breakdown */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Expense Breakdown</Text>

          <View style={styles.totalExpenses}>
            <Text style={styles.totalExpensesLabel}>Total Expenses</Text>
            <Text style={[styles.totalExpensesValue, styles.expenseText]}>
              {formatCurrency(report.expenses.totalExpenses)}
            </Text>
          </View>

          <View style={styles.divider} />

          {report.expenses.byCategory.map((category) => (
            <View key={category.category} style={styles.categoryRow}>
              <View style={styles.categoryLeft}>
                <Text style={styles.categoryIcon}>{getCategoryIcon(category.category)}</Text>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>
                    {category.category.charAt(0) + category.category.slice(1).toLowerCase()}
                  </Text>
                  <Text style={styles.categoryPercentage}>
                    {category.percentage.toFixed(1)}% of expenses
                  </Text>
                </View>
              </View>
              <Text style={styles.categoryAmount}>{formatCurrency(category.amount)}</Text>
            </View>
          ))}
        </Card>

        {/* Mileage Summary */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Mileage Deduction</Text>

          <View style={styles.mileageRow}>
            <View style={styles.mileageItem}>
              <Text style={styles.mileageLabel}>Total Miles</Text>
              <Text style={styles.mileageValue}>
                {report.mileage.totalMiles.toFixed(1)} mi
              </Text>
            </View>
            <View style={styles.mileageItem}>
              <Text style={styles.mileageLabel}>IRS Rate</Text>
              <Text style={styles.mileageValue}>
                ${report.mileage.deductionRate.toFixed(2)}/mi
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.mileageTotal}>
            <Text style={styles.mileageTotalLabel}>Total Deduction</Text>
            <Text style={[styles.mileageTotalValue, styles.successText]}>
              {formatCurrency(report.mileage.totalDeduction)}
            </Text>
          </View>
        </Card>

        {/* Tax Tips */}
        <Card style={[styles.card, styles.tipsCard]}>
          <Text style={styles.tipsTitle}>💡 Tax Preparation Tips</Text>
          <View style={styles.tipsList}>
            <Text style={styles.tipItem}>
              • Keep all receipt photos organized by category
            </Text>
            <Text style={styles.tipItem}>
              • Maintain detailed mileage logs with trip purposes
            </Text>
            <Text style={styles.tipItem}>
              • Document job completion with before/after photos
            </Text>
            <Text style={styles.tipItem}>
              • Save monthly reports for quarterly tax estimates
            </Text>
            <Text style={styles.tipItem}>
              • Consult with a tax professional for deduction optimization
            </Text>
          </View>
        </Card>

        {/* Export Button */}
        <Button
          title="Export Full Report with Photos"
          onPress={handleExportPDF}
          variant="primary"
          size="large"
          fullWidth
          style={styles.exportFullButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.sizes.base,
    color: colors.neutral[600],
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
  headerTitle: {
    ...typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
  },
  exportButton: {
    ...typography.sizes.sm,
    color: colors.primary.main,
    fontWeight: typography.weights.semibold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing['4xl'],
  },
  periodSelector: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.lg,
  },
  periodButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: colors.neutral[300],
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  periodButtonText: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[700],
  },
  periodButtonTextActive: {
    color: colors.background.primary,
  },
  monthSelector: {
    maxHeight: 50,
    marginBottom: spacing.md,
  },
  monthSelectorContent: {
    paddingHorizontal: spacing.base,
    gap: spacing.sm,
  },
  monthChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: colors.neutral[300],
  },
  monthChipActive: {
    backgroundColor: colors.primary.lightest,
    borderColor: colors.primary.main,
  },
  monthChipText: {
    ...typography.sizes.sm,
    color: colors.neutral[700],
  },
  monthChipTextActive: {
    color: colors.primary.main,
    fontWeight: typography.weights.semibold,
  },
  reportPeriod: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  reportPeriodText: {
    ...typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
  },
  card: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.base,
    padding: spacing.lg,
  },
  summaryCard: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.base,
    padding: spacing.lg,
    backgroundColor: colors.primary.lightest,
    borderWidth: 2,
    borderColor: colors.primary.light,
  },
  cardTitle: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  summaryLabel: {
    ...typography.sizes.base,
    color: colors.neutral[700],
  },
  summaryValue: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.semibold,
  },
  summaryLabelBold: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
  },
  summaryValueBold: {
    ...typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
  },
  incomeText: {
    color: colors.secondary.main,
  },
  expenseText: {
    color: colors.error.main,
  },
  profitText: {
    color: colors.success.dark,
  },
  successText: {
    color: colors.success.dark,
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral[200],
    marginVertical: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    ...typography.sizes.xs,
    color: colors.neutral[600],
    marginBottom: spacing.xs,
  },
  detailValue: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
  },
  totalExpenses: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  totalExpensesLabel: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[700],
  },
  totalExpensesValue: {
    ...typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    ...typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.neutral[900],
  },
  categoryPercentage: {
    ...typography.sizes.xs,
    color: colors.neutral[600],
  },
  categoryAmount: {
    ...typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.error.main,
  },
  mileageRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  mileageItem: {
    flex: 1,
    alignItems: 'center',
  },
  mileageLabel: {
    ...typography.sizes.xs,
    color: colors.neutral[600],
    marginBottom: spacing.xs,
  },
  mileageValue: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
  },
  mileageTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mileageTotalLabel: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[700],
  },
  mileageTotalValue: {
    ...typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  tipsCard: {
    backgroundColor: colors.warning.lightest,
  },
  tipsTitle: {
    ...typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
  tipsList: {
    gap: spacing.sm,
  },
  tipItem: {
    ...typography.sizes.sm,
    color: colors.neutral[700],
    lineHeight: 20,
  },
  exportFullButton: {
    marginHorizontal: spacing.base,
    marginTop: spacing.lg,
  },
});
