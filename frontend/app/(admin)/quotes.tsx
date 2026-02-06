import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../src/constants/theme';
import { adminAPI } from '../../src/services/api';

export default function AdminQuotes() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuote, setSelectedQuote] = useState<any>(null);

  const { data: quotes, isLoading } = useQuery({
    queryKey: ['admin', 'quotes'],
    queryFn: async () => {
      const response = await fetch('http://localhost:8000/api/admin/quotes', {
        headers: {
          'Authorization': 'Bearer ' + (await getAuthToken()),
        },
      });
      return response.json();
    },
  });

  const sendEmailMutation = useMutation({
    mutationFn: (quoteId: string) => adminAPI.sendQuoteEmail(quoteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'quotes'] });
    },
  });

  const getAuthToken = async () => {
    // Get token from secure storage
    return '';
  };

  const filteredQuotes = quotes?.filter((quote: any) =>
    quote.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    quote.id?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return colors.neutral[500];
      case 'sent':
        return colors.info.main;
      case 'accepted':
        return colors.success.main;
      case 'rejected':
        return colors.error.main;
      default:
        return colors.neutral[500];
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.neutral[900]} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quote Management</Text>
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
        <Text style={styles.headerTitle}>Quote Management</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.neutral[400]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search quotes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{quotes?.length || 0}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.info.main }]}>
              {quotes?.filter((q: any) => q.status === 'draft').length || 0}
            </Text>
            <Text style={styles.statLabel}>Draft</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.success.main }]}>
              {quotes?.filter((q: any) => q.status === 'accepted').length || 0}
            </Text>
            <Text style={styles.statLabel}>Accepted</Text>
          </View>
        </View>

        {/* Quotes List */}
        <View style={styles.listContainer}>
          {filteredQuotes.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={48} color={colors.neutral[400]} />
              <Text style={styles.emptyText}>No quotes found</Text>
            </View>
          ) : (
            filteredQuotes.map((quote: any) => (
              <TouchableOpacity
                key={quote.id}
                style={styles.quoteCard}
                onPress={() => setSelectedQuote(quote)}
              >
                <View style={styles.quoteHeader}>
                  <Text style={styles.quoteId}>{quote.id?.slice(-8) || 'N/A'}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(quote.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(quote.status) }]}>
                      {quote.status?.toUpperCase() || 'UNKNOWN'}
                    </Text>
                  </View>
                </View>
                <View style={styles.quoteContent}>
                  <Text style={styles.quoteCustomer}>{quote.customer_name || 'Unknown Customer'}</Text>
                  <Text style={styles.quoteAmount}>
                    ${quote.total_amount?.toLocaleString() || '0'}
                  </Text>
                </View>
                <View style={styles.quoteActions}>
                  {quote.status === 'draft' && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => sendEmailMutation.mutate(quote.id)}
                    >
                      <Ionicons name="mail" size={16} color={colors.primary.main} />
                      <Text style={styles.actionText}>Send Email</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="eye" size={16} color={colors.info.main} />
                    <Text style={styles.actionText}>View</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
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
  quoteCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  quoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  quoteId: {
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
  quoteContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  quoteCustomer: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
  },
  quoteAmount: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.success.main,
  },
  quoteActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
  },
  actionText: {
    ...typography.sizes.sm,
    color: colors.primary.main,
  },
});
