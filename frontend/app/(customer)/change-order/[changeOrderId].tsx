import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../../src/constants/theme';
import { Button } from '../../../src/components/Button';
import { api } from '../../../src/services/api';

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
}

export default function CustomerChangeOrderScreen() {
  const router = useRouter();
  const { changeOrderId, jobId } = useLocalSearchParams<{ changeOrderId: string; jobId: string }>();

  const [loading, setLoading] = useState(true);
  const [changeOrder, setChangeOrder] = useState<ChangeOrderData | null>(null);
  const [decisionNotes, setDecisionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchChangeOrder();
  }, [changeOrderId, jobId]);

  const fetchChangeOrder = async () => {
    try {
      const response = await api.get(`/jobs/${jobId}/change-orders`);
      const order = response.data.change_orders.find((co: ChangeOrderData) => co.id === changeOrderId);
      if (order) {
        setChangeOrder(order);
      }
    } catch (error) {
      console.error('Failed to fetch change order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await api.post(`/jobs/${jobId}/change-order/${changeOrderId}/approve`, {
        decision_notes: decisionNotes || undefined,
      });

      Alert.alert(
        'Change Order Approved',
        'The change order has been approved. The job total will be updated.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to approve change order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    setIsSubmitting(true);
    try {
      await api.post(`/jobs/${jobId}/change-order/${changeOrderId}/reject`, {
        decision_notes: decisionNotes || undefined,
      });

      Alert.alert(
        'Change Order Rejected',
        'The change order has been rejected.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to reject change order');
    } finally {
      setIsSubmitting(false);
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

  if (!changeOrder || changeOrder.status !== 'pending') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Button
              title=""
              onPress={() => router.back()}
              variant="ghost"
              size="small"
              icon={<Ionicons name="arrow-back" size={24} color={colors.primary.main} />}
            />
          </View>
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Change Order Not Available</Text>
            <Text style={styles.emptyText}>
              {!changeOrder
                ? 'Change order not found.'
                : 'This change order has already been decided.'}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Button
            title=""
            onPress={() => router.back()}
            variant="ghost"
            size="small"
            icon={<Ionicons name="arrow-back" size={24} color={colors.primary.main} />}
          />
          <Text style={styles.title}>Change Order Review</Text>
        </View>

        <View style={[styles.costBadge, changeOrder.additional_cost < 0 ? { backgroundColor: `${colors.success.main}20` } : { backgroundColor: `${colors.warning.main}20` }]}>
          <Ionicons
            name={changeOrder.additional_cost < 0 ? "arrow-down-circle" : "arrow-up-circle"}
            size={24}
            color={changeOrder.additional_cost < 0 ? colors.success.main : colors.warning.main}
          />
          <Text style={[styles.costText, { color: changeOrder.additional_cost < 0 ? colors.success.main : colors.warning.main }]}>
            {changeOrder.additional_cost < 0 ? '-' : '+'}${Math.abs(changeOrder.additional_cost).toFixed(2)}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What's Changing</Text>
          <Text style={styles.sectionText}>{changeOrder.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why This Change is Needed</Text>
          <Text style={styles.sectionText}>{changeOrder.reason}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Additional Cost:</Text>
            <Text style={[styles.detailValue, { color: changeOrder.additional_cost < 0 ? colors.success.main : colors.error.main }]}>
              {changeOrder.additional_cost < 0 ? '-' : '+'}${Math.abs(changeOrder.additional_cost).toFixed(2)}
            </Text>
          </View>
          {changeOrder.additional_hours && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Additional Hours:</Text>
              <Text style={styles.detailValue}>{changeOrder.additional_hours.toFixed(1)} hrs</Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Requested:</Text>
            <Text style={styles.detailValue}>
              {new Date(changeOrder.requested_at).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {changeOrder.photo_urls.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Photos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosScroll}>
              {changeOrder.photo_urls.map((url, index) => (
                <Image
                  key={index}
                  source={{ uri: url }}
                  style={styles.photo}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.label}>Your Response (Optional)</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Add a note to the contractor..."
            placeholderTextColor={colors.neutral[400]}
            value={decisionNotes}
            onChangeText={setDecisionNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.actions}>
          <Button
            title="Reject Change"
            onPress={handleReject}
            isLoading={isSubmitting}
            disabled={isSubmitting}
            variant="outline"
            fullWidth
            style={{ marginBottom: spacing.md }}
            icon={<Ionicons name="close-circle" size={20} color={colors.error.main} />}
          />
          <Button
            title="Approve Change"
            onPress={handleApprove}
            isLoading={isSubmitting}
            disabled={isSubmitting}
            fullWidth
            icon={<Ionicons name="checkmark-circle" size={20} color="#fff" />}
          />
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
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    marginTop: spacing.md,
  },
  costBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.full,
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  costText: {
    ...typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[700],
    marginBottom: spacing.md,
  },
  sectionText: {
    ...typography.sizes.base,
    color: colors.neutral[600],
    lineHeight: 22,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  detailLabel: {
    ...typography.sizes.base,
    color: colors.neutral[600],
  },
  detailValue: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
  },
  photosScroll: {
    flexDirection: 'row',
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.md,
    marginRight: spacing.md,
  },
  label: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[700],
    marginBottom: spacing.xs,
  },
  textArea: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.sizes.base,
    color: colors.neutral[900],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    minHeight: 80,
  },
  actions: {
    marginTop: spacing.lg,
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
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.sizes.base,
    color: colors.neutral[500],
    textAlign: 'center',
  },
});
