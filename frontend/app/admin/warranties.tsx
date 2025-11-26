import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../src/constants/theme';
import { Button } from '../../src/components/Button';
import { api } from '../../src/services/api';

interface WarrantyData {
  id: string;
  job_id: string;
  customer_id: string;
  contractor_id: string;
  issue_description: string;
  status: 'pending' | 'approved' | 'denied';
  requested_at: string;
  decided_at?: string;
}

export default function AdminWarrantiesScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [warranties, setWarranties] = useState<WarrantyData[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'denied'>('all');

  useEffect(() => {
    fetchWarranties();
  }, []);

  const fetchWarranties = async () => {
    try {
      // Note: This would need a new admin endpoint to list all warranties
      // For now, this is a placeholder UI
      setWarranties([]);
    } catch (error) {
      console.error('Failed to fetch warranties:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return colors.success.main;
      case 'denied':
        return colors.error.main;
      default:
        return colors.warning.main;
    }
  };

  const filteredWarranties = warranties.filter(w =>
    filter === 'all' ? true : w.status === filter
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Button
            title=""
            onPress={() => router.back()}
            variant="ghost"
            size="small"
            icon={<Ionicons name="arrow-back" size={24} color={colors.primary.main} />}
          />
          <Text style={styles.title}>Warranty Requests</Text>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'pending' && styles.filterTabActive]}
            onPress={() => setFilter('pending')}
          >
            <Text style={[styles.filterText, filter === 'pending' && styles.filterTextActive]}>
              Pending
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'approved' && styles.filterTabActive]}
            onPress={() => setFilter('approved')}
          >
            <Text style={[styles.filterText, filter === 'approved' && styles.filterTextActive]}>
              Approved
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'denied' && styles.filterTabActive]}
            onPress={() => setFilter('denied')}
          >
            <Text style={[styles.filterText, filter === 'denied' && styles.filterTextActive]}>
              Denied
            </Text>
          </TouchableOpacity>
        </View>

        {/* List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary.main} />
          </View>
        ) : filteredWarranties.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color={colors.neutral[400]} />
            <Text style={styles.emptyTitle}>No Warranty Requests</Text>
            <Text style={styles.emptyText}>
              {filter === 'all'
                ? 'No warranty requests have been submitted yet.'
                : `No ${filter} warranty requests found.`}
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
            {filteredWarranties.map((warranty) => (
              <TouchableOpacity
                key={warranty.id}
                style={styles.warrantyCard}
                onPress={() => router.push(`/(customer)/warranty/status/${warranty.job_id}`)}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardJobId}>Job #{warranty.job_id.slice(0, 8)}</Text>
                  <View
                    style={[styles.statusBadge, { backgroundColor: `${getStatusColor(warranty.status)}20` }]}
                  >
                    <Text style={[styles.statusBadgeText, { color: getStatusColor(warranty.status) }]}>
                      {warranty.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text style={styles.cardDescription} numberOfLines={2}>
                  {warranty.issue_description}
                </Text>

                <View style={styles.cardFooter}>
                  <Text style={styles.cardDate}>
                    Requested: {new Date(warranty.requested_at).toLocaleDateString()}
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  header: {
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    marginTop: spacing.md,
  },
  filterTabs: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  filterTab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  filterTabActive: {
    borderBottomColor: colors.primary.main,
  },
  filterText: {
    ...typography.sizes.base,
    color: colors.neutral[600],
  },
  filterTextActive: {
    color: colors.primary.main,
    fontWeight: typography.weights.semibold,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    ...typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.neutral[700],
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.sizes.base,
    color: colors.neutral[500],
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  warrantyCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardJobId: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[700],
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  statusBadgeText: {
    ...typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  cardDescription: {
    ...typography.sizes.base,
    color: colors.neutral[600],
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardDate: {
    ...typography.sizes.sm,
    color: colors.neutral[500],
  },
});
