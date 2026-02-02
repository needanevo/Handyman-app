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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../../../src/constants/theme';
import { Button } from '../../../../src/components/Button';
import api from '../../../../src/services/api';

interface ChangeOrderData {
  id: string;
  job_id: string;
  contractor_id: string;
  customer_id: string;
  description: string;
  reason: string;
  additional_cost: number;
  additional_hours?: number;
  photo_urls: string[];
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  decided_at?: string;
  decision_notes?: string;
}

export default function ChangeOrderListScreen() {
  const router = useRouter();
  const { jobId } = useLocalSearchParams<{ jobId: string }>();

  const [loading, setLoading] = useState(true);
  const [changeOrders, setChangeOrders] = useState<ChangeOrderData[]>([]);

  useEffect(() => {
    fetchChangeOrders();
  }, [jobId]);

  const fetchChangeOrders = async () => {
    try {
      const response = await api.get(`/jobs/${jobId}/change-orders`) as any;
      setChangeOrders(response.data.change_orders || []);
    } catch (error) {
      console.error('Failed to fetch change orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return colors.success.main;
      case 'rejected':
        return colors.error.main;
      default:
        return colors.warning.main;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return 'checkmark-circle';
      case 'rejected':
        return 'close-circle';
      default:
        return 'time-outline';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Button
            title=""
            onPress={() => router.back()}
            variant="ghost"
            size="small"
            icon={<Ionicons name="arrow-back" size={24} color={colors.primary.main} />}
          />
          <Text style={styles.title}>Change Orders</Text>
          <Text style={styles.subtitle}>
            View all change orders submitted for this job
          </Text>
        </View>

        {/* Create New Button */}
        <Button
          title="Create New Change Order"
          onPress={() => router.push(`/(contractor)/change-order/create/${jobId}`)}
          size="large"
          fullWidth
          style={{ marginBottom: spacing.xl }}
          icon={<Ionicons name="add-circle" size={20} color="#fff" />}
        />

        {/* Change Orders List */}
        {changeOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color={colors.neutral[300]} />
            <Text style={styles.emptyTitle}>No Change Orders Yet</Text>
            <Text style={styles.emptyText}>
              Create a change order when you need to document scope changes or additional work
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {changeOrders.map((order) => (
              <TouchableOpacity
                key={order.id}
                style={styles.card}
                activeOpacity={0.7}
              >
                {/* Status Badge */}
                <View style={styles.cardHeader}>
                  <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(order.status)}20` }]}>
                    <Ionicons
                      name={getStatusIcon(order.status) as any}
                      size={16}
                      color={getStatusColor(order.status)}
                    />
                    <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Text>
                  </View>
                  <Text style={styles.dateText}>
                    {new Date(order.requested_at).toLocaleDateString()}
                  </Text>
                </View>

                {/* Cost Badge */}
                <View style={[styles.costBadge, order.additional_cost < 0 ?
                  { backgroundColor: `${colors.success.main}20` } :
                  { backgroundColor: `${colors.warning.main}20` }
                ]}>
                  <Ionicons
                    name={order.additional_cost < 0 ? "arrow-down-circle" : "arrow-up-circle"}
                    size={20}
                    color={order.additional_cost < 0 ? colors.success.main : colors.warning.main}
                  />
                  <Text style={[styles.costText, { color: order.additional_cost < 0 ? colors.success.main : colors.warning.main }]}>
                    {order.additional_cost < 0 ? '-' : '+'}${Math.abs(order.additional_cost).toFixed(2)}
                  </Text>
                </View>

                {/* Description */}
                <Text style={styles.descriptionTitle}>Description:</Text>
                <Text style={styles.descriptionText} numberOfLines={2}>
                  {order.description}
                </Text>

                {/* Additional Details */}
                {order.additional_hours && (
                  <Text style={styles.detailText}>
                    <Ionicons name="time-outline" size={14} color={colors.neutral[600]} />
                    {' '}{order.additional_hours.toFixed(1)} additional hours
                  </Text>
                )}

                {order.photo_urls.length > 0 && (
                  <Text style={styles.detailText}>
                    <Ionicons name="images-outline" size={14} color={colors.neutral[600]} />
                    {' '}{order.photo_urls.length} photo{order.photo_urls.length > 1 ? 's' : ''}
                  </Text>
                )}

                {/* Decision Notes (if rejected/approved) */}
                {order.decision_notes && (
                  <View style={styles.notesSection}>
                    <Text style={styles.notesLabel}>Customer Response:</Text>
                    <Text style={styles.notesText}>{order.decision_notes}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.sizes['2xl'],
    fontWeight: '700' as const,
    color: colors.neutral[900],
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.sizes.base,
    color: colors.neutral[600],
    lineHeight: 22,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    gap: spacing.md,
  },
  emptyTitle: {
    ...typography.sizes.xl,
    fontWeight: '700' as const,
    color: colors.neutral[700],
  },
  emptyText: {
    ...typography.sizes.base,
    color: colors.neutral[500],
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  list: {
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    gap: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  statusText: {
    ...typography.sizes.sm,
    fontWeight: '600' as const,
  },
  dateText: {
    ...typography.sizes.sm,
    color: colors.neutral[500],
  },
  costBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  costText: {
    ...typography.sizes.lg,
    fontWeight: '700' as const,
  },
  descriptionTitle: {
    ...typography.sizes.sm,
    fontWeight: '600' as const,
    color: colors.neutral[700],
  },
  descriptionText: {
    ...typography.sizes.base,
    color: colors.neutral[600],
    lineHeight: 22,
  },
  detailText: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    flexDirection: 'row',
    alignItems: 'center',
  },
  notesSection: {
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  notesLabel: {
    ...typography.sizes.sm,
    fontWeight: '600' as const,
    color: colors.neutral[700],
    marginBottom: spacing.xs,
  },
  notesText: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    fontStyle: 'italic',
  },
});
