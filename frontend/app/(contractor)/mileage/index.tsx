/**
 * Mileage Tracker
 *
 * Track mileage for tax deductions with automatic GPS tracking option.
 * Essential for contractors to maximize tax deductions.
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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../../src/constants/theme';
import { MileageLog } from '../../../src/types/contractor';
import { Card } from '../../../src/components/Card';
import { Button } from '../../../src/components/Button';
import { Ionicons } from '@expo/vector-icons';

export default function MileageTracker() {
  const router = useRouter();
  const [showAddMileage, setShowAddMileage] = useState(false);

  // IRS standard mileage rate for 2025 (adjust yearly)
  const MILEAGE_RATE = 0.70; // $0.70 per mile

  // Mock data - replace with API
  const { data: mileageLogs } = useQuery<MileageLog[]>({
    queryKey: ['contractor', 'mileage'],
    queryFn: async () => {
      return [
        {
          id: 'm1',
          jobId: 'j1',
          date: '2025-11-14',
          startLocation: {
            address: '123 Home Street, SF, CA',
            latitude: 37.7749,
            longitude: -122.4194,
          },
          endLocation: {
            address: '456 Oak Street, SF, CA',
            latitude: 37.7849,
            longitude: -122.4094,
          },
          miles: 12.5,
          purpose: 'Kitchen faucet repair job',
          autoTracked: true,
          createdAt: '2025-11-14T09:00:00',
        },
        {
          id: 'm2',
          date: '2025-11-14',
          startLocation: {
            address: '456 Oak Street, SF, CA',
            latitude: 37.7849,
            longitude: -122.4094,
          },
          endLocation: {
            address: 'Home Depot, SF, CA',
            latitude: 37.7650,
            longitude: -122.4200,
          },
          miles: 5.2,
          purpose: 'Materials pickup',
          autoTracked: false,
          createdAt: '2025-11-14T10:30:00',
        },
      ];
    },
  });

  const totalMiles = mileageLogs?.reduce((sum, log) => sum + log.miles, 0) || 0;
  const totalDeduction = totalMiles * MILEAGE_RATE;

  const thisMonthMiles =
    mileageLogs?.filter((log) => {
      const logDate = new Date(log.date);
      const now = new Date();
      return (
        logDate.getMonth() === now.getMonth() &&
        logDate.getFullYear() === now.getFullYear()
      );
    }).reduce((sum, log) => sum + log.miles, 0) || 0;

  const thisMonthDeduction = thisMonthMiles * MILEAGE_RATE;

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
        <Text style={styles.headerTitle}>Mileage Tracker</Text>
        <TouchableOpacity onPress={() => router.push('/(contractor)/mileage/map')}>
          <Text style={styles.mapLink}>🗺️ Map View</Text>
        </TouchableOpacity>
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
          <Text style={styles.summaryValue}>{thisMonthMiles.toFixed(1)} mi</Text>
          <Text style={styles.summaryDeduction}>{formatCurrency(thisMonthDeduction)}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>All Time</Text>
          <Text style={styles.summaryValue}>{totalMiles.toFixed(1)} mi</Text>
          <Text style={styles.summaryDeduction}>{formatCurrency(totalDeduction)}</Text>
        </View>
        <View style={[styles.summaryCard, styles.rateCard]}>
          <Text style={styles.summaryLabel}>IRS Rate 2025</Text>
          <Text style={styles.rateValue}>${MILEAGE_RATE}/mi</Text>
        </View>
      </ScrollView>

      {/* Add Mileage Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowAddMileage(true)}
        >
          <Text style={styles.actionIcon}>📝</Text>
          <Text style={styles.actionText}>Manual Entry</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonPrimary]}
          onPress={() => {
            // Start GPS tracking
            Alert.alert(
              'GPS Tracking',
              'GPS mileage tracking will start when you begin your next trip.'
            );
          }}
        >
          <Text style={styles.actionIcon}>📍</Text>
          <Text style={styles.actionText}>Auto Track</Text>
        </TouchableOpacity>
      </View>

      {/* Mileage Log List */}
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Mileage Log</Text>
        <Text style={styles.listCount}>{mileageLogs?.length || 0} trips</Text>
      </View>

      <FlatList
        data={mileageLogs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.logCard}>
            <View style={styles.logHeader}>
              <View style={styles.logHeaderLeft}>
                <Text style={styles.logDate}>{formatDate(item.date)}</Text>
                {item.autoTracked && (
                  <View style={styles.autoTrackedBadge}>
                    <Text style={styles.autoTrackedText}>GPS</Text>
                  </View>
                )}
              </View>
              <View style={styles.logMiles}>
                <Text style={styles.milesValue}>{item.miles.toFixed(1)}</Text>
                <Text style={styles.milesLabel}>miles</Text>
              </View>
            </View>

            <View style={styles.logRoute}>
              <Text style={styles.routeIcon}>📍</Text>
              <Text style={styles.routeText} numberOfLines={1}>
                {item.startLocation.address}
              </Text>
            </View>
            <View style={styles.logRoute}>
              <Text style={styles.routeIcon}>🎯</Text>
              <Text style={styles.routeText} numberOfLines={1}>
                {item.endLocation.address}
              </Text>
            </View>

            {item.purpose && (
              <Text style={styles.logPurpose}>{item.purpose}</Text>
            )}

            <View style={styles.logFooter}>
              <Text style={styles.deductionLabel}>Tax Deduction:</Text>
              <Text style={styles.deductionValue}>
                {formatCurrency(item.miles * MILEAGE_RATE)}
              </Text>
            </View>
          </Card>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🚗</Text>
            <Text style={styles.emptyText}>No mileage logged</Text>
            <Text style={styles.emptySubtext}>
              Start tracking your business miles for tax deductions
            </Text>
          </View>
        }
      />

      {/* Add Mileage Modal */}
      <AddMileageModal
        visible={showAddMileage}
        onClose={() => setShowAddMileage(false)}
      />
    </SafeAreaView>
  );
}

function AddMileageModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [startAddress, setStartAddress] = useState('');
  const [endAddress, setEndAddress] = useState('');
  const [miles, setMiles] = useState('');
  const [purpose, setPurpose] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSave = () => {
    if (!startAddress || !endAddress || !miles) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    // In production, save to backend
    console.log('Saving mileage:', { startAddress, endAddress, miles, purpose, date });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalClose}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Log Mileage</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.modalSave}>Save</Text>
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
          {/* Date */}
          <Text style={styles.label}>Date</Text>
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
          />

          {/* Start Location */}
          <Text style={styles.label}>From</Text>
          <TextInput
            style={styles.input}
            placeholder="Start address"
            value={startAddress}
            onChangeText={setStartAddress}
          />

          {/* End Location */}
          <Text style={styles.label}>To</Text>
          <TextInput
            style={styles.input}
            placeholder="Destination address"
            value={endAddress}
            onChangeText={setEndAddress}
          />

          {/* Miles */}
          <Text style={styles.label}>Miles</Text>
          <TextInput
            style={styles.input}
            placeholder="0.0"
            value={miles}
            onChangeText={setMiles}
            keyboardType="decimal-pad"
          />

          {/* Purpose */}
          <Text style={styles.label}>Purpose</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Reason for trip (e.g., job site visit, materials pickup)"
            value={purpose}
            onChangeText={setPurpose}
            multiline
            numberOfLines={3}
          />

          <View style={styles.hint}>
            <Text style={styles.hintIcon}>💡</Text>
            <Text style={styles.hintText}>
              Detailed trip purposes help support tax deductions
            </Text>
          </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.lg,
    backgroundColor: colors.background.primary,
    ...shadows.sm,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
  },
  mapLink: {
    ...typography.sizes.sm,
    color: colors.primary.main,
    fontWeight: typography.weights.semibold,
  },
  summaryContainer: {
    marginTop: spacing.base,
    maxHeight: 120,
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
  rateCard: {
    backgroundColor: colors.warning.lightest,
  },
  summaryLabel: {
    ...typography.sizes.xs,
    color: colors.neutral[600],
    marginBottom: spacing.xs,
  },
  summaryValue: {
    ...typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.primary.main,
  },
  summaryDeduction: {
    ...typography.sizes.sm,
    color: colors.success.dark,
    marginTop: spacing.xs,
  },
  rateValue: {
    ...typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.warning.dark,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.base,
    marginTop: spacing.lg,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.background.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[300],
    ...shadows.sm,
  },
  actionButtonPrimary: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  actionText: {
    ...typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[700],
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.lg,
  },
  listTitle: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
  },
  listCount: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
  },
  listContent: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.xl,
  },
  logCard: {
    marginBottom: spacing.md,
    padding: spacing.base,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  logHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logDate: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
  },
  autoTrackedBadge: {
    backgroundColor: colors.success.lightest,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  autoTrackedText: {
    ...typography.sizes.xs,
    color: colors.success.dark,
    fontWeight: typography.weights.semibold,
  },
  logMiles: {
    alignItems: 'flex-end',
  },
  milesValue: {
    ...typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.primary.main,
  },
  milesLabel: {
    ...typography.sizes.xs,
    color: colors.neutral[600],
  },
  logRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  routeIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  routeText: {
    ...typography.sizes.sm,
    color: colors.neutral[700],
    flex: 1,
  },
  logPurpose: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    fontStyle: 'italic',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  logFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  deductionLabel: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
  },
  deductionValue: {
    ...typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.success.dark,
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
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  keyboardView: {
    flex: 1,
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
    paddingBottom: spacing['4xl'],
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
  hint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.warning.lightest,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  hintIcon: {
    fontSize: 20,
  },
  hintText: {
    ...typography.sizes.sm,
    color: colors.neutral[700],
    flex: 1,
    lineHeight: 20,
  },
});
