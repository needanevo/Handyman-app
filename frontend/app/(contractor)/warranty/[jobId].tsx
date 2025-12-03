import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../../src/constants/theme';
import { Button, LoadingSpinner, EmptyState } from '../../../src/components';
import api from '../../../src/services/api';

interface WarrantyData {
  id: string;
  job_id: string;
  customer_id: string;
  contractor_id: string;
  issue_description: string;
  photo_urls: string[];
  status: 'pending' | 'approved' | 'denied';
  requested_at: string;
}

export default function ContractorWarrantyScreen() {
  const router = useRouter();
  const { jobId } = useLocalSearchParams<{ jobId: string }>();

  const [loading, setLoading] = useState(true);
  const [warranty, setWarranty] = useState<WarrantyData | null>(null);
  const [hasWarranty, setHasWarranty] = useState(false);
  const [decisionNotes, setDecisionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchWarrantyStatus();
  }, [jobId]);

  const fetchWarrantyStatus = async () => {
    try {
      const response = await api.get(`/jobs/${jobId}/warranty/status`) as { data: { has_warranty: boolean; warranty?: WarrantyData } };
      setHasWarranty(response.data.has_warranty);
      if (response.data.has_warranty) {
        setWarranty(response.data.warranty!);
      }
    } catch (error) {
      console.error('Failed to fetch warranty status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await api.post(`/jobs/${jobId}/warranty/approve`, {
        decision_notes: decisionNotes || undefined,
      });

      Alert.alert(
        'Warranty Approved',
        'The warranty request has been approved.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to approve warranty');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeny = async () => {
    if (!decisionNotes.trim()) {
      Alert.alert('Error', 'Please provide a reason for denying the warranty request');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post(`/jobs/${jobId}/warranty/deny`, {
        decision_notes: decisionNotes,
      });

      Alert.alert(
        'Warranty Denied',
        'The warranty request has been denied.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to deny warranty');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner fullScreen text="Loading warranty request..." color={colors.primary.main} />
      </SafeAreaView>
    );
  }

  if (!hasWarranty || warranty!.status !== 'pending') {
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

          <EmptyState
            icon="document-text-outline"
            title="No Pending Warranty Request"
            description={
              !hasWarranty
                ? 'No warranty request exists for this job.'
                : 'This warranty request has already been decided.'
            }
          />
        </ScrollView>
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
          <Text style={styles.title}>Warranty Request Review</Text>
        </View>

        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: `${colors.warning.main}20` }]}>
          <Ionicons name="time" size={24} color={colors.warning.main} />
          <Text style={[styles.statusText, { color: colors.warning.main }]}>
            PENDING REVIEW
          </Text>
        </View>

        {/* Issue Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Issue</Text>
          <Text style={styles.sectionText}>{warranty!.issue_description}</Text>
        </View>

        {/* Photos */}
        {warranty!.photo_urls.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Photos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosScroll}>
              {warranty!.photo_urls.map((url, index) => (
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

        {/* Requested Date */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Request Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Requested:</Text>
            <Text style={styles.detailValue}>
              {new Date(warranty!.requested_at).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Decision Notes */}
        <View style={styles.section}>
          <Text style={styles.label}>Response Notes</Text>
          <Text style={styles.helperText}>
            {decisionNotes.trim() ? 'Optional for approval, required for denial' : 'Required for denial'}
          </Text>
          <TextInput
            style={styles.textArea}
            placeholder="Explain your decision to the customer..."
            placeholderTextColor={colors.neutral[400]}
            value={decisionNotes}
            onChangeText={setDecisionNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            title="Deny Warranty"
            onPress={handleDeny}
            loading={isSubmitting}
            disabled={isSubmitting}
            variant="outline"
            fullWidth
            style={{ marginBottom: spacing.md }}
            icon={<Ionicons name="close-circle" size={20} color={colors.error.main} />}
          />
          <Button
            title="Approve Warranty"
            onPress={handleApprove}
            loading={isSubmitting}
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
  header: {
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.headings.h2,
    color: colors.neutral[900],
    marginTop: spacing.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.full,
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  statusText: {
    ...typography.headings.h5,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.headings.h5,
    color: colors.neutral[700],
    marginBottom: spacing.md,
  },
  sectionText: {
    ...typography.body.regular,
    color: colors.neutral[600],
    lineHeight: 22,
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
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  detailLabel: {
    ...typography.body.regular,
    color: colors.neutral[600],
  },
  detailValue: {
    ...typography.body.regular,
    fontWeight: '600' as const,
    color: colors.neutral[900],
  },
  label: {
    ...typography.body.regular,
    fontWeight: '600' as const,
    color: colors.neutral[700],
    marginBottom: spacing.xs,
  },
  helperText: {
    ...typography.caption.regular,
    color: colors.neutral[500],
    marginBottom: spacing.sm,
  },
  textArea: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.body.regular,
    color: colors.neutral[900],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    minHeight: 100,
  },
  actions: {
    marginTop: spacing.lg,
  },
});
