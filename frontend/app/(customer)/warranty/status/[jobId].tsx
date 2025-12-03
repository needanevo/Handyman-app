import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../../../src/constants/theme';
import { Button, LoadingSpinner, EmptyState } from '../../../../src/components';
import { api } from '../../../../src/services/api';

interface WarrantyData {
  id: string;
  job_id: string;
  customer_id: string;
  contractor_id: string;
  issue_description: string;
  photo_urls: string[];
  status: 'pending' | 'approved' | 'denied';
  requested_at: string;
  decided_at?: string;
  decision_notes?: string;
}

export default function WarrantyStatusScreen() {
  const router = useRouter();
  const { jobId } = useLocalSearchParams<{ jobId: string }>();

  const [loading, setLoading] = useState(true);
  const [warranty, setWarranty] = useState<WarrantyData | null>(null);
  const [hasWarranty, setHasWarranty] = useState(false);

  useEffect(() => {
    fetchWarrantyStatus();
  }, [jobId]);

  const fetchWarrantyStatus = async () => {
    try {
      const response = await api.get(`/jobs/${jobId}/warranty/status`);
      setHasWarranty(response.data.has_warranty);
      if (response.data.has_warranty) {
        setWarranty(response.data.warranty);
      }
    } catch (error) {
      console.error('Failed to fetch warranty status:', error);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return 'checkmark-circle';
      case 'denied':
        return 'close-circle';
      default:
        return 'time';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner fullScreen text="Loading warranty status..." color={colors.primary.main} />
      </SafeAreaView>
    );
  }

  if (!hasWarranty) {
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
            title="No Warranty Request"
            description="You haven't submitted a warranty request for this job yet."
            actionLabel="Request Warranty Service"
            onAction={() => router.push(`/(customer)/warranty/request/${jobId}`)}
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
          <Text style={styles.title}>Warranty Request Status</Text>
        </View>

        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(warranty!.status)}20` }]}>
          <Ionicons name={getStatusIcon(warranty!.status)} size={24} color={getStatusColor(warranty!.status)} />
          <Text style={[styles.statusText, { color: getStatusColor(warranty!.status) }]}>
            {warranty!.status.toUpperCase()}
          </Text>
        </View>

        {/* Issue Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Issue Description</Text>
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

        {/* Decision Notes */}
        {warranty!.decision_notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contractor Response</Text>
            <Text style={styles.sectionText}>{warranty!.decision_notes}</Text>
          </View>
        )}

        {/* Dates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Request Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Requested:</Text>
            <Text style={styles.detailValue}>
              {new Date(warranty!.requested_at).toLocaleDateString()}
            </Text>
          </View>
          {warranty!.decided_at && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Decided:</Text>
              <Text style={styles.detailValue}>
                {new Date(warranty!.decided_at).toLocaleDateString()}
              </Text>
            </View>
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
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
  },
});
