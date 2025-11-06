import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../../src/constants/theme';
import { Button } from '../../../src/components/Button';
import { Card } from '../../../src/components/Card';
import { Badge } from '../../../src/components/Badge';
import { ProgressBar } from '../../../src/components/ProgressBar';

// Mock data - would come from API in real app
const mockJob = {
  id: '1',
  title: 'Fix hole in bedroom wall',
  category: 'drywall',
  status: 'in_progress_50',
  contractor: {
    name: 'Mike Johnson',
    rating: 4.8,
    completedJobs: 47,
    photo: 'https://ui-avatars.com/api/?name=Mike+Johnson&background=2563EB&color=fff',
  },
  payment: {
    total: 300,
    upfrontPaid: 200,
    materialsReleased: 96,
    milestone50Released: 0,
    finalRelease: 0,
    escrowBalance: 104,
  },
  milestones: [
    {
      id: 'm1',
      name: 'Materials Purchase',
      status: 'completed',
      date: '2025-11-03',
      amount: 96,
      evidence: [
        'https://via.placeholder.com/300x200/10B981/FFFFFF?text=Receipt+1',
        'https://via.placeholder.com/300x200/10B981/FFFFFF?text=Receipt+2',
      ],
    },
    {
      id: 'm2',
      name: '50% Job Completion',
      status: 'pending_approval',
      date: '2025-11-05',
      amount: 90,
      evidence: [
        'https://via.placeholder.com/300x200/F59E0B/FFFFFF?text=Progress+Photo+1',
        'https://via.placeholder.com/300x200/F59E0B/FFFFFF?text=Progress+Photo+2',
      ],
      notes: 'Drywall patched and taped. Ready for texturing and paint.',
    },
    {
      id: 'm3',
      name: 'Final Completion',
      status: 'pending',
      amount: 114,
    },
  ],
  timeline: [
    { date: '2025-11-02', event: 'Job accepted by contractor', icon: 'checkmark-circle' },
    { date: '2025-11-02', event: 'Upfront payment received', icon: 'cash' },
    { date: '2025-11-03', event: 'Materials receipts uploaded', icon: 'document' },
    { date: '2025-11-03', event: 'Materials payment released', icon: 'checkmark-circle' },
    { date: '2025-11-05', event: '50% milestone submitted', icon: 'alert-circle' },
  ],
};

export default function JobDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);

  const job = mockJob; // Would fetch based on params.id

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending_approval':
        return 'warning';
      case 'pending':
        return 'neutral';
      default:
        return 'neutral';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'pending_approval':
        return 'Awaiting Your Approval';
      case 'pending':
        return 'Not Started';
      default:
        return status;
    }
  };

  const handleApproveMilestone = (milestoneId: string) => {
    // Implement approval logic
    console.log('Approving milestone:', milestoneId);
  };

  const handleRejectMilestone = (milestoneId: string) => {
    // Implement rejection logic
    console.log('Rejecting milestone:', milestoneId);
  };

  const completionPercentage =
    job.status === 'completed'
      ? 100
      : job.status === 'in_progress_50'
      ? 50
      : job.status === 'materials_ordered'
      ? 25
      : 10;

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
            style={styles.backButton}
          />
          <Button
            title=""
            onPress={() => router.push(`/(customer)/chat/${job.id}`)}
            variant="ghost"
            size="small"
            icon={<Ionicons name="chatbubbles" size={24} color={colors.primary.main} />}
          />
        </View>

        {/* Job Title */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{job.title}</Text>
          <Badge label={job.category} variant="neutral" />
        </View>

        {/* Progress Card */}
        <Card variant="elevated" padding="lg" style={styles.progressCard}>
          <Text style={styles.cardTitle}>Job Progress</Text>
          <ProgressBar
            progress={completionPercentage}
            showPercentage
            variant="success"
            height={12}
          />
          <Text style={styles.progressLabel}>
            {completionPercentage === 100
              ? 'Job completed!'
              : `${completionPercentage}% complete`}
          </Text>
        </Card>

        {/* Contractor Card */}
        <Card variant="outlined" padding="base" style={styles.contractorCard}>
          <View style={styles.contractorContent}>
            <Image source={{ uri: job.contractor.photo }} style={styles.contractorPhoto} />
            <View style={styles.contractorInfo}>
              <Text style={styles.contractorName}>{job.contractor.name}</Text>
              <View style={styles.contractorMeta}>
                <Ionicons name="star" size={16} color={colors.warning.main} />
                <Text style={styles.contractorRating}>{job.contractor.rating}</Text>
                <Text style={styles.contractorJobs}>
                  • {job.contractor.completedJobs} jobs
                </Text>
              </View>
            </View>
            <Button
              title=""
              onPress={() => router.push(`/(customer)/chat/${job.id}`)}
              variant="outline"
              size="small"
              icon={<Ionicons name="chatbubble" size={20} color={colors.primary.main} />}
            />
          </View>
        </Card>

        {/* Payment Overview */}
        <Card variant="elevated" padding="lg" style={styles.paymentCard}>
          <Text style={styles.cardTitle}>Payment Overview</Text>

          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Total Job Cost</Text>
            <Text style={styles.paymentAmount}>${job.payment.total.toFixed(2)}</Text>
          </View>

          <View style={styles.paymentDivider} />

          <View style={styles.paymentRow}>
            <View style={styles.paymentLabelWithIcon}>
              <Ionicons name="cash" size={20} color={colors.success.main} />
              <Text style={styles.paymentLabel}>Upfront Paid</Text>
            </View>
            <Text style={[styles.paymentAmount, { color: colors.success.main }]}>
              ${job.payment.upfrontPaid.toFixed(2)}
            </Text>
          </View>

          <View style={styles.paymentRow}>
            <View style={styles.paymentLabelWithIcon}>
              <Ionicons name="shield-checkmark" size={20} color={colors.warning.main} />
              <Text style={styles.paymentLabel}>Held in Escrow</Text>
            </View>
            <Text style={[styles.paymentAmount, { color: colors.warning.main }]}>
              ${job.payment.escrowBalance.toFixed(2)}
            </Text>
          </View>

          <View style={styles.paymentDivider} />

          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabelSmall}>Materials Released</Text>
            <Text style={styles.paymentAmountSmall}>
              ${job.payment.materialsReleased.toFixed(2)}
            </Text>
          </View>
        </Card>

        {/* Milestones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Milestones</Text>

          {job.milestones.map((milestone) => (
            <Card
              key={milestone.id}
              variant="outlined"
              padding="base"
              style={styles.milestoneCard}
            >
              <View style={styles.milestoneHeader}>
                <View style={styles.milestoneTitle}>
                  <Text style={styles.milestoneName}>{milestone.name}</Text>
                  <Badge
                    label={getStatusLabel(milestone.status)}
                    variant={getStatusColor(milestone.status) as any}
                    size="sm"
                  />
                </View>
                <Text style={styles.milestoneAmount}>${milestone.amount.toFixed(2)}</Text>
              </View>

              {milestone.date && (
                <View style={styles.milestoneDate}>
                  <Ionicons name="calendar-outline" size={16} color={colors.neutral[600]} />
                  <Text style={styles.milestoneDateText}>{milestone.date}</Text>
                </View>
              )}

              {milestone.notes && (
                <Text style={styles.milestoneNotes}>{milestone.notes}</Text>
              )}

              {milestone.evidence && milestone.evidence.length > 0 && (
                <View style={styles.evidenceSection}>
                  <Text style={styles.evidenceTitle}>Evidence:</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.evidenceScroll}
                  >
                    <View style={styles.evidenceList}>
                      {milestone.evidence.map((photo, index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() => {
                            /* Open image viewer */
                          }}
                        >
                          <Image source={{ uri: photo }} style={styles.evidencePhoto} />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}

              {milestone.status === 'pending_approval' && (
                <View style={styles.milestoneActions}>
                  <Button
                    title="Approve & Release Payment"
                    onPress={() => handleApproveMilestone(milestone.id)}
                    variant="success"
                    size="medium"
                    fullWidth
                    icon={<Ionicons name="checkmark-circle" size={20} color="#fff" />}
                  />
                  <Button
                    title="Request Changes"
                    onPress={() => handleRejectMilestone(milestone.id)}
                    variant="outline"
                    size="small"
                    fullWidth
                  />
                </View>
              )}
            </Card>
          ))}
        </View>

        {/* Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Timeline</Text>
          <Card variant="outlined" padding="base">
            {job.timeline.map((event, index) => (
              <View
                key={index}
                style={[
                  styles.timelineEvent,
                  index === job.timeline.length - 1 && styles.timelineEventLast,
                ]}
              >
                <View style={styles.timelineIcon}>
                  <Ionicons
                    name={event.icon as any}
                    size={20}
                    color={colors.primary.main}
                  />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineEvent}>{event.event}</Text>
                  <Text style={styles.timelineDate}>{event.date}</Text>
                </View>
              </View>
            ))}
          </Card>
        </View>

        {/* Support */}
        <Card variant="flat" padding="base" style={styles.supportCard}>
          <View style={styles.supportContent}>
            <Ionicons name="help-circle" size={24} color={colors.primary.main} />
            <View style={styles.supportText}>
              <Text style={styles.supportTitle}>Need Help?</Text>
              <Text style={styles.supportDescription}>
                Contact our support team if you have any issues with this job.
              </Text>
            </View>
            <Button
              title="Contact"
              onPress={() => {}}
              variant="outline"
              size="small"
            />
          </View>
        </Card>
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
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['2xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    flex: 1,
    marginRight: spacing.md,
  },
  progressCard: {
    marginBottom: spacing.lg,
  },
  cardTitle: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
  progressLabel: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  contractorCard: {
    marginBottom: spacing.lg,
  },
  contractorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  contractorPhoto: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
  },
  contractorInfo: {
    flex: 1,
  },
  contractorName: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  contractorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  contractorRating: {
    ...typography.sizes.sm,
    color: colors.neutral[700],
    fontWeight: typography.weights.medium,
  },
  contractorJobs: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
  },
  paymentCard: {
    marginBottom: spacing.lg,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  paymentLabel: {
    ...typography.sizes.base,
    color: colors.neutral[700],
  },
  paymentLabelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  paymentAmount: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
  },
  paymentLabelSmall: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
  },
  paymentAmountSmall: {
    ...typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.neutral[700],
  },
  paymentDivider: {
    height: 1,
    backgroundColor: colors.neutral[200],
    marginVertical: spacing.md,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
  milestoneCard: {
    marginBottom: spacing.md,
  },
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  milestoneTitle: {
    flex: 1,
    gap: spacing.sm,
  },
  milestoneName: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
  },
  milestoneAmount: {
    ...typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.primary.main,
  },
  milestoneDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  milestoneDateText: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
  },
  milestoneNotes: {
    ...typography.sizes.base,
    color: colors.neutral[700],
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  evidenceSection: {
    marginTop: spacing.md,
  },
  evidenceTitle: {
    ...typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[700],
    marginBottom: spacing.sm,
  },
  evidenceScroll: {
    marginBottom: spacing.md,
  },
  evidenceList: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  evidencePhoto: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.md,
  },
  milestoneActions: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  timelineEvent: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingBottom: spacing.md,
    borderLeftWidth: 2,
    borderLeftColor: colors.neutral[200],
    marginLeft: spacing.sm,
  },
  timelineEventLast: {
    borderLeftWidth: 0,
    paddingBottom: 0,
  },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.lightest,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -17,
  },
  timelineContent: {
    flex: 1,
    paddingTop: spacing.xs,
  },
  timelineEventText: {
    ...typography.sizes.base,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  timelineDate: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
  },
  supportCard: {
    marginBottom: spacing.lg,
  },
  supportContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  supportText: {
    flex: 1,
  },
  supportTitle: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  supportDescription: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    lineHeight: 20,
  },
});
