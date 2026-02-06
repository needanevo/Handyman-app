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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../src/constants/theme';
import { adminAPI } from '../../src/services/api';

type ApprovalType = 'contractor' | 'handyman';

interface PendingApproval {
  id: string;
  type: ApprovalType;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  skills?: string[];
  registration_date: string;
  status: string;
  photo_url?: string;
}

export default function AdminApprovals() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<ApprovalType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApproval, setSelectedApproval] = useState<PendingApproval | null>(null);
  const [notes, setNotes] = useState('');

  const { data: approvals, isLoading } = useQuery({
    queryKey: ['admin', 'approvals'],
    queryFn: async () => {
      // Mock data for now - replace with actual API call
      return [
        {
          id: 'user_001',
          type: 'contractor' as ApprovalType,
          email: 'john.contractor@email.com',
          first_name: 'John',
          last_name: 'Johnson',
          phone: '555-123-4567',
          skills: ['Plumbing', 'Electrical', 'Carpentry'],
          registration_date: '2024-01-15',
          status: 'pending',
          photo_url: 'https://example.com/photos/john.jpg',
        },
        {
          id: 'user_002',
          type: 'handyman' as ApprovalType,
          email: 'jane.handyman@email.com',
          first_name: 'Jane',
          last_name: 'Williams',
          phone: '555-234-5678',
          skills: ['Painting', 'Drywall'],
          registration_date: '2024-01-14',
          status: 'pending',
        },
        {
          id: 'user_003',
          type: 'contractor' as ApprovalType,
          email: 'bob.builder@email.com',
          first_name: 'Bob',
          last_name: 'Brown',
          phone: '555-345-6789',
          skills: ['Masonry', 'Concrete'],
          registration_date: '2024-01-13',
          status: 'pending',
        },
        {
          id: 'user_004',
          type: 'handyman' as ApprovalType,
          email: 'alice.repair@email.com',
          first_name: 'Alice',
          last_name: 'Davis',
          phone: '555-456-7890',
          skills: ['General Repair', 'Maintenance'],
          registration_date: '2024-01-12',
          status: 'pending',
        },
      ] as PendingApproval[];
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (data: { userId: string; approve: boolean; notes: string }) => {
      // Mock API call
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'approvals'] });
      setSelectedApproval(null);
      setNotes('');
      Alert.alert('Success', 'Registration processed successfully');
    },
  });

  const filteredApprovals = approvals?.filter((approval: PendingApproval) => {
    const matchesFilter = filter === 'all' || approval.type === filter;
    const matchesSearch =
      approval.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      approval.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      approval.last_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch && approval.status === 'pending';
  }) || [];

  const handleApprove = (approval: PendingApproval) => {
    setSelectedApproval(approval);
    setNotes('');
  };

  const handleReject = (approval: PendingApproval) => {
    Alert.alert(
      'Reject Registration',
      `Are you sure you want to reject ${approval.first_name} ${approval.last_name}'s registration?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () => {
            approveMutation.mutate({
              userId: approval.id,
              approve: false,
              notes: 'Registration rejected by admin',
            });
          },
        },
      ]
    );
  };

  const submitApproval = () => {
    if (!selectedApproval) return;

    approveMutation.mutate({
      userId: selectedApproval.id,
      approve: true,
      notes,
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.neutral[900]} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pending Approvals</Text>
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
        <Text style={styles.headerTitle}>Pending Approvals</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterTabText, filter === 'all' && styles.filterTabTextActive]}>
              All ({approvals?.length || 0})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'contractor' && styles.filterTabActive]}
            onPress={() => setFilter('contractor')}
          >
            <Ionicons name="construct" size={16} color={filter === 'contractor' ? colors.primary.main : colors.neutral[600]} as any />
            <Text style={[styles.filterTabText, filter === 'contractor' && styles.filterTabTextActive]}>
              Contractors ({approvals?.filter((a: PendingApproval) => a.type === 'contractor').length || 0})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'handyman' && styles.filterTabActive]}
            onPress={() => setFilter('handyman')}
          >
            <Ionicons name="build" size={16} color={filter === 'handyman' ? colors.primary.main : colors.neutral[600]} as any />
            <Text style={[styles.filterTabText, filter === 'handyman' && styles.filterTabTextActive]}>
              Handymen ({approvals?.filter((a: PendingApproval) => a.type === 'handyman').length || 0})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.neutral[400]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or email..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Approvals List */}
        <View style={styles.listContainer}>
          {filteredApprovals.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle-outline" size={48} color={colors.success.main} />
              <Text style={styles.emptyText}>No pending approvals</Text>
              <Text style={styles.emptySubtext}>All registrations have been processed</Text>
            </View>
          ) : (
            filteredApprovals.map((approval: PendingApproval) => (
              <View key={approval.id} style={styles.approvalCard}>
                <View style={styles.approvalHeader}>
                  <View style={styles.avatarContainer}>
                    {approval.photo_url ? (
                      <Image source={{ uri: approval.photo_url }} style={styles.avatar} />
                    ) : (
                      <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>
                          {approval.first_name?.[0]}{approval.last_name?.[0]}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.approvalInfo}>
                    <Text style={styles.approvalName}>
                      {approval.first_name} {approval.last_name}
                    </Text>
                    <Text style={styles.approvalEmail}>{approval.email}</Text>
                    <Text style={styles.approvalPhone}>{approval.phone}</Text>
                  </View>
                  <View style={[styles.typeBadge, approval.type === 'contractor' ? styles.contractorBadge : styles.handymanBadge]}>
                    <Ionicons
                      name={approval.type === 'contractor' ? 'construct' : 'build'}
                      size={14}
                      color={approval.type === 'contractor' ? colors.primary.main : colors.warning.main}
                      as any
                    />
                    <Text style={[styles.typeText, approval.type === 'contractor' ? styles.contractorText : styles.handymanText]}>
                      {approval.type === 'contractor' ? 'Contractor' : 'Handyman'}
                    </Text>
                  </View>
                </View>

                {approval.skills && approval.skills.length > 0 && (
                  <View style={styles.skillsContainer}>
                    {approval.skills.map((skill, index) => (
                      <View key={index} style={styles.skillBadge}>
                        <Text style={styles.skillText}>{skill}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <View style={styles.approvalMeta}>
                  <View style={styles.metaRow}>
                    <Ionicons name="calendar-outline" size={14} color={colors.neutral[500]} />
                    <Text style={styles.metaText}>Registered: {approval.registration_date}</Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Ionicons name="time-outline" size={14} color={colors.neutral[500]} />
                    <Text style={styles.metaText}>Status: Pending Review</Text>
                  </View>
                </View>

                <View style={styles.approvalActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => handleReject(approval)}
                  >
                    <Ionicons name="close-circle" size={18} color={colors.error.main} />
                    <Text style={styles.rejectText}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.approveButton]}
                    onPress={() => handleApprove(approval)}
                  >
                    <Ionicons name="checkmark-circle" size={18} color={colors.success.main} />
                    <Text style={styles.approveText}>Approve</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Approval Modal */}
      {selectedApproval && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Approve Registration</Text>
              <TouchableOpacity onPress={() => setSelectedApproval(null)}>
                <Ionicons name="close" size={24} color={colors.neutral[600]} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.modalUserInfo}>
                <View style={styles.modalAvatar}>
                  <Text style={styles.modalAvatarText}>
                    {selectedApproval.first_name?.[0]}{selectedApproval.last_name?.[0]}
                  </Text>
                </View>
                <View>
                  <Text style={styles.modalUserName}>
                    {selectedApproval.first_name} {selectedApproval.last_name}
                  </Text>
                  <Text style={styles.modalUserType}>
                    {selectedApproval.type === 'contractor' ? 'Contractor' : 'Handyman'}
                  </Text>
                </View>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Contact Information</Text>
                <View style={styles.modalRow}>
                  <Ionicons name="mail-outline" size={16} color={colors.neutral[500]} />
                  <Text style={styles.modalText}>{selectedApproval.email}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Ionicons name="call-outline" size={16} color={colors.neutral[500]} />
                  <Text style={styles.modalText}>{selectedApproval.phone}</Text>
                </View>
              </View>

              {selectedApproval.skills && selectedApproval.skills.length > 0 && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Skills</Text>
                  <View style={styles.modalSkills}>
                    {selectedApproval.skills.map((skill, index) => (
                      <View key={index} style={styles.modalSkillBadge}>
                        <Text style={styles.modalSkillText}>{skill}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Notes (Optional)</Text>
                <TextInput
                  style={styles.modalNotesInput}
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  placeholder="Add any notes about this approval..."
                  placeholderTextColor={colors.neutral[400]}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setSelectedApproval(null)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={submitApproval}
              >
                <Ionicons name="checkmark" size={18} color="white" />
                <Text style={styles.confirmButtonText}>Approve</Text>
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
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.lg,
    padding: spacing.xs,
    marginBottom: spacing.lg,
  },
  filterTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  filterTabActive: {
    backgroundColor: colors.background.primary,
    ...shadows.sm,
  },
  filterTabText: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    fontWeight: typography.weights.medium,
  },
  filterTabTextActive: {
    color: colors.primary.main,
    fontWeight: typography.weights.semibold,
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
  listContainer: {
    gap: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyText: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    marginTop: spacing.md,
  },
  emptySubtext: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    marginTop: spacing.xs,
  },
  approvalCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  approvalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.primary.lightest,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.primary.main,
  },
  approvalInfo: {
    flex: 1,
  },
  approvalName: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
  },
  approvalEmail: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
  },
  approvalPhone: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  contractorBadge: {
    backgroundColor: colors.primary.lightest,
  },
  handymanBadge: {
    backgroundColor: colors.warning.lightest,
  },
  typeText: {
    ...typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
  contractorText: {
    color: colors.primary.main,
  },
  handymanText: {
    color: colors.warning.main,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  skillBadge: {
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  skillText: {
    ...typography.sizes.xs,
    color: colors.neutral[700],
  },
  approvalMeta: {
    gap: spacing.xs,
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
  },
  approvalActions: {
    flexDirection: 'row',
    gap: spacing.md,
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
  rejectButton: {
    backgroundColor: colors.error.lightest,
  },
  approveButton: {
    backgroundColor: colors.success.lightest,
  },
  rejectText: {
    ...typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.error.main,
  },
  approveText: {
    ...typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.success.main,
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
    width: '90%',
    maxWidth: 450,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  modalTitle: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
  },
  modalBody: {
    padding: spacing.lg,
  },
  modalUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  modalAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary.lightest,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalAvatarText: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primary.main,
  },
  modalUserName: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
  },
  modalUserType: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
  },
  modalSection: {
    marginBottom: spacing.lg,
  },
  modalSectionTitle: {
    ...typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[700],
    marginBottom: spacing.sm,
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  modalText: {
    ...typography.sizes.sm,
    color: colors.neutral[900],
  },
  modalSkills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  modalSkillBadge: {
    backgroundColor: colors.primary.lightest,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  modalSkillText: {
    ...typography.sizes.sm,
    color: colors.primary.main,
    fontWeight: typography.weights.medium,
  },
  modalNotesInput: {
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    minHeight: 80,
    textAlignVertical: 'top',
    ...typography.sizes.sm,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  cancelButton: {
    backgroundColor: colors.neutral[200],
  },
  cancelButtonText: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[700],
  },
  confirmButton: {
    backgroundColor: colors.success.main,
  },
  confirmButtonText: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: 'white',
  },
});
