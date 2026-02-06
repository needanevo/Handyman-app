import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../src/constants/theme';
import { adminAPI } from '../../src/services/api';

export default function AdminRefunds() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRefund, setSelectedRefund] = useState<any>(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');

  const { data: refunds, isLoading } = useQuery({
    queryKey: ['admin', 'refunds'],
    queryFn: async () => {
      // Mock data for now - replace with actual API call
      return [
        { id: 'ref_001', customer_name: 'John Doe', job_id: 'job_123', amount: 150.00, status: 'pending', reason: 'Customer requested cancellation', date: '2024-01-15' },
        { id: 'ref_002', customer_name: 'Jane Smith', job_id: 'job_456', amount: 75.50, status: 'approved', reason: 'Partial refund for materials', date: '2024-01-14' },
        { id: 'ref_003', customer_name: 'Bob Wilson', job_id: 'job_789', amount: 200.00, status: 'pending', reason: 'Service not completed', date: '2024-01-13' },
        { id: 'ref_004', customer_name: 'Alice Brown', job_id: 'job_012', amount: 50.00, status: 'rejected', reason: 'Already paid in full', date: '2024-01-12' },
      ];
    },
  });

  const processRefundMutation = useMutation({
    mutationFn: async (data: { refundId: string; amount: number; reason: string; approve: boolean }) => {
      // Mock API call
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'refunds'] });
      setSelectedRefund(null);
      Alert.alert('Success', 'Refund processed successfully');
    },
  });

  const filteredRefunds = refunds?.filter((refund: any) =>
    refund.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    refund.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    refund.job_id?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return colors.warning.main;
      case 'approved':
        return colors.success.main;
      case 'rejected':
        return colors.error.main;
      default:
        return colors.neutral[500];
    }
  };

  const handleApprove = (refund: any) => {
    setSelectedRefund({ ...refund, action: 'approve' });
    setRefundAmount(refund.amount.toString());
  };

  const handleReject = (refund: any) => {
    setSelectedRefund({ ...refund, action: 'reject' });
    setRefundReason('');
  };

  const submitRefund = () => {
    if (!selectedRefund) return;

    processRefundMutation.mutate({
      refundId: selectedRefund.id,
      amount: parseFloat(refundAmount) || 0,
      reason: refundReason,
      approve: selectedRefund.action === 'approve',
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.neutral[900]} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Refund Management</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Refund Management</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.neutral[400]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search refunds..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{refunds?.length || 0}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.warning.main }]}>
              {refunds?.filter((r: any) => r.status === 'pending').length || 0}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.success.main }]}>
              ${refunds?.filter((r: any) => r.status === 'approved').reduce((sum: number, r: any) => sum + r.amount, 0).toFixed(2) || '0'}
            </Text>
            <Text style={styles.statLabel}>Approved</Text>
          </View>
        </View>

        {/* Refunds List */}
        <View style={styles.listContainer}>
          {filteredRefunds.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="return-down-back-outline" size={48} color={colors.neutral[400]} />
              <Text style={styles.emptyText}>No refunds found</Text>
            </View>
          ) : (
            filteredRefunds.map((refund: any) => (
              <View key={refund.id} style={styles.refundCard}>
                <View style={styles.refundHeader}>
                  <Text style={styles.refundId}>{refund.id}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(refund.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(refund.status) }]}>
                      {refund.status?.toUpperCase() || 'UNKNOWN'}
                    </Text>
                  </View>
                </View>
                <View style={styles.refundContent}>
                  <View style={styles.refundRow}>
                    <Text style={styles.refundLabel}>Customer:</Text>
                    <Text style={styles.refundValue}>{refund.customer_name}</Text>
                  </View>
                  <View style={styles.refundRow}>
                    <Text style={styles.refundLabel}>Job:</Text>
                    <Text style={styles.refundValue}>{refund.job_id}</Text>
                  </View>
                  <View style={styles.refundRow}>
                    <Text style={styles.refundLabel}>Amount:</Text>
                    <Text style={[styles.refundValue, { color: colors.success.main }]}>
                      ${refund.amount?.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.refundRow}>
                    <Text style={styles.refundLabel}>Reason:</Text>
                    <Text style={styles.refundValue}>{refund.reason}</Text>
                  </View>
                  <View style={styles.refundRow}>
                    <Text style={styles.refundLabel}>Date:</Text>
                    <Text style={styles.refundValue}>{refund.date}</Text>
                  </View>
                </View>
                {refund.status === 'pending' && (
                  <View style={styles.refundActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.approveButton]}
                      onPress={() => handleApprove(refund)}
                    >
                      <Ionicons name="checkmark-circle" size={16} color={colors.success.main} />
                      <Text style={styles.approveText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.rejectButton]}
                      onPress={() => handleReject(refund)}
                    >
                      <Ionicons name="close-circle" size={16} color={colors.error.main} />
                      <Text style={styles.rejectText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Refund Modal */}
      {selectedRefund && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedRefund.action === 'approve' ? 'Approve Refund' : 'Reject Refund'}
              </Text>
              <TouchableOpacity onPress={() => setSelectedRefund(null)}>
                <Ionicons name="close" size={24} color={colors.neutral[600]} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>Refund Amount</Text>
              <TextInput
                style={styles.modalInput}
                value={refundAmount}
                onChangeText={setRefundAmount}
                keyboardType="numeric"
                editable={selectedRefund.action === 'approve'}
              />
              <Text style={styles.modalLabel}>Reason/Notes</Text>
              <TextInput
                style={[styles.modalInput, styles.modalTextArea]}
                value={refundReason}
                onChangeText={setRefundReason}
                multiline
                placeholder="Enter reason for approval/rejection..."
              />
            </View>
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setSelectedRefund(null)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, selectedRefund.action === 'approve' ? styles.confirmButton : styles.rejectModalButton]}
                onPress={submitRefund}
              >
                <Text style={styles.confirmButtonText}>
                  {selectedRefund.action === 'approve' ? 'Approve' : 'Reject'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  headerTitle: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: spacing.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    ...typography.sizes.base,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statItem: {
    flex: 1,
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  statValue: {
    ...typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
  },
  statLabel: {
    ...typography.sizes.xs,
    color: colors.neutral[600],
  },
  listContainer: {
    gap: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  emptyText: {
    ...typography.sizes.base,
    color: colors.neutral[600],
    marginTop: spacing.md,
  },
  refundCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  refundHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  refundId: {
    ...typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.neutral[600],
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusText: {
    ...typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  refundContent: {
    gap: spacing.xs,
  },
  refundRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  refundLabel: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
  },
  refundValue: {
    ...typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.neutral[900],
  },
  refundActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  approveButton: {
    backgroundColor: colors.success.lightest,
  },
  rejectButton: {
    backgroundColor: colors.error.lightest,
  },
  approveText: {
    ...typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.success.main,
  },
  rejectText: {
    ...typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.error.main,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
  },
  modalBody: {
    gap: spacing.md,
  },
  modalLabel: {
    ...typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.neutral[700],
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.sizes.base,
  },
  modalTextArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  modalButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.neutral[200],
  },
  confirmButton: {
    backgroundColor: colors.success.main,
  },
  rejectModalButton: {
    backgroundColor: colors.error.main,
  },
  cancelButtonText: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[700],
  },
  confirmButtonText: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: 'white',
  },
});
