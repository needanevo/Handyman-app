import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../../src/constants/theme';
import { adminAPI } from '../../../src/services/api';

export default function ContractorsManagement() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  const { data: contractors, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'contractors', statusFilter],
    queryFn: () => adminAPI.getContractors(statusFilter ? { status: statusFilter } : undefined),
  });

  const filteredContractors = contractors?.filter((contractor: any) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      contractor.first_name?.toLowerCase().includes(query) ||
      contractor.last_name?.toLowerCase().includes(query) ||
      contractor.email?.toLowerCase().includes(query) ||
      contractor.business_name?.toLowerCase().includes(query)
    );
  });

  const renderContractor = ({ item }: any) => (
    <TouchableOpacity
      style={styles.contractorCard}
      onPress={() => router.push(`/(admin)/contractors/${item.id}`)}
    >
      <View style={styles.contractorHeader}>
        <View style={styles.contractorInfo}>
          <Text style={styles.contractorName}>
            {item.first_name} {item.last_name}
          </Text>
          {item.business_name && (
            <Text style={styles.businessName}>{item.business_name}</Text>
          )}
          <Text style={styles.contractorEmail}>{item.email}</Text>
        </View>
        <View style={styles.contractorStats}>
          <View
            style={[
              styles.statusBadge,
              item.registration_status === 'ACTIVE'
                ? styles.statusActive
                : styles.statusInactive,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                item.registration_status === 'ACTIVE'
                  ? styles.statusTextActive
                  : styles.statusTextInactive,
              ]}
            >
              {item.registration_status || 'PENDING'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.contractorMeta}>
        <View style={styles.metaItem}>
          <Ionicons name="briefcase-outline" size={16} color={colors.neutral[500]} />
          <Text style={styles.metaText}>{item.total_jobs || 0} total jobs</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="checkmark-circle-outline" size={16} color={colors.success.main} />
          <Text style={styles.metaText}>{item.completed_jobs || 0} completed</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="cash-outline" size={16} color={colors.primary.main} />
          <Text style={styles.metaText}>
            ${item.total_revenue?.toLocaleString() || '0'} earned
          </Text>
        </View>
      </View>

      {item.skills && item.skills.length > 0 && (
        <View style={styles.skillsContainer}>
          {item.skills.slice(0, 3).map((skill: string, index: number) => (
            <View key={index} style={styles.skillBadge}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
          {item.skills.length > 3 && (
            <Text style={styles.moreSkills}>+{item.skills.length - 3} more</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="construct-outline" size={80} color={colors.neutral[300]} />
      <Text style={styles.emptyTitle}>No Contractors Found</Text>
      <Text style={styles.emptyText}>
        {searchQuery ? 'Try adjusting your search' : 'No contractors registered yet'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primary.main} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contractors</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={colors.neutral[400]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search contractors..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.neutral[400]}
          />
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, !statusFilter && styles.filterButtonActive]}
          onPress={() => setStatusFilter(undefined)}
        >
          <Text
            style={[styles.filterButtonText, !statusFilter && styles.filterButtonTextActive]}
          >
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            statusFilter === 'ACTIVE' && styles.filterButtonActive,
          ]}
          onPress={() => setStatusFilter('ACTIVE')}
        >
          <Text
            style={[
              styles.filterButtonText,
              statusFilter === 'ACTIVE' && styles.filterButtonTextActive,
            ]}
          >
            Active
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            statusFilter === 'EXPIRED' && styles.filterButtonActive,
          ]}
          onPress={() => setStatusFilter('EXPIRED')}
        >
          <Text
            style={[
              styles.filterButtonText,
              statusFilter === 'EXPIRED' && styles.filterButtonTextActive,
            ]}
          >
            Expired
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contractors List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Loading contractors...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.error.main} />
          <Text style={styles.errorText}>Failed to load contractors</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredContractors || []}
          renderItem={renderContractor}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
        />
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
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
  },
  headerSpacer: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    ...shadows.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.sizes.base,
    color: colors.neutral[900],
    paddingVertical: spacing.md,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  filterButtonActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  filterButtonText: {
    ...typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.neutral[700],
  },
  filterButtonTextActive: {
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    ...typography.sizes.base,
    color: colors.neutral[600],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  errorText: {
    ...typography.sizes.base,
    color: colors.error.main,
  },
  retryButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: 'white',
  },
  listContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  contractorCard: {
    backgroundColor: 'white',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  contractorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  contractorInfo: {
    flex: 1,
  },
  contractorName: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.xs / 2,
  },
  businessName: {
    ...typography.sizes.sm,
    color: colors.primary.main,
    marginBottom: spacing.xs / 2,
  },
  contractorEmail: {
    ...typography.sizes.xs,
    color: colors.neutral[600],
  },
  contractorStats: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.sm,
  },
  statusActive: {
    backgroundColor: colors.success.lightest,
  },
  statusInactive: {
    backgroundColor: colors.neutral[200],
  },
  statusText: {
    ...typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  statusTextActive: {
    color: colors.success.main,
  },
  statusTextInactive: {
    color: colors.neutral[600],
  },
  contractorMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    ...typography.sizes.xs,
    color: colors.neutral[600],
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  skillBadge: {
    backgroundColor: colors.primary.lightest,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.sm,
  },
  skillText: {
    ...typography.sizes.xs,
    color: colors.primary.main,
  },
  moreSkills: {
    ...typography.sizes.xs,
    color: colors.neutral[500],
    alignSelf: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
    gap: spacing.md,
  },
  emptyTitle: {
    ...typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.neutral[700],
  },
  emptyText: {
    ...typography.sizes.base,
    color: colors.neutral[500],
    textAlign: 'center',
    maxWidth: 250,
  },
});
