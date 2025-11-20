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

export default function CustomersManagement() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: customers, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'customers'],
    queryFn: () => adminAPI.getCustomers(),
  });

  const filteredCustomers = customers?.filter((customer: any) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      customer.first_name?.toLowerCase().includes(query) ||
      customer.last_name?.toLowerCase().includes(query) ||
      customer.email?.toLowerCase().includes(query) ||
      customer.phone?.toLowerCase().includes(query)
    );
  });

  const renderCustomer = ({ item }: any) => (
    <TouchableOpacity
      style={styles.customerCard}
      onPress={() => router.push(`/(admin)/customers/${item.id}`)}
    >
      <View style={styles.customerHeader}>
        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>
            {item.first_name} {item.last_name}
          </Text>
          <Text style={styles.customerEmail}>{item.email}</Text>
          {item.phone && (
            <Text style={styles.customerPhone}>{item.phone}</Text>
          )}
        </View>
      </View>

      <View style={styles.customerMeta}>
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
            ${item.total_spent?.toLocaleString() || '0'} spent
          </Text>
        </View>
      </View>

      {item.addresses && item.addresses.length > 0 && (
        <View style={styles.addressContainer}>
          <Ionicons name="location-outline" size={16} color={colors.neutral[500]} />
          <Text style={styles.addressText} numberOfLines={1}>
            {item.addresses[0].city}, {item.addresses[0].state}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="people-outline" size={80} color={colors.neutral[300]} />
      <Text style={styles.emptyTitle}>No Customers Found</Text>
      <Text style={styles.emptyText}>
        {searchQuery ? 'Try adjusting your search' : 'No customers registered yet'}
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
        <Text style={styles.headerTitle}>Customers</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={colors.neutral[400]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search customers..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.neutral[400]}
          />
        </View>
      </View>

      {/* Customers List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Loading customers...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.error.main} />
          <Text style={styles.errorText}>Failed to load customers</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredCustomers || []}
          renderItem={renderCustomer}
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
  customerCard: {
    backgroundColor: 'white',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  customerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.xs / 2,
  },
  customerEmail: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    marginBottom: spacing.xs / 2,
  },
  customerPhone: {
    ...typography.sizes.xs,
    color: colors.neutral[500],
  },
  customerMeta: {
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
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
  addressText: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    flex: 1,
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
