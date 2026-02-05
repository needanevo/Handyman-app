import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../../src/constants/theme';
import { Button } from '../../../src/components/Button';
import { Card } from '../../../src/components/Card';
import { Badge } from '../../../src/components/Badge';
import { ProgressBar } from '../../../src/components/ProgressBar';
import { jobsAPI } from '../../../src/services/api';

// Types for job data
interface JobContractor {
  id: string;
  name: string;
  rating: number;
  completedJobs: number;
  photo?: string;
  role: 'handyman' | 'contractor';
}

interface JobPayment {
  total: number;
  upfrontPaid: number;
  materialsReleased: number;
  milestone50Released: number;
  finalRelease: number;
  escrowBalance: number;
}

interface Milestone {
  id: string;
  name: string;
  status: 'completed' | 'pending_approval' | 'pending';
  date?: string;
  amount: number;
  evidence?: string[];
  notes?: string;
}

interface TimelineEvent {
  date: string;
  event: string;
  icon: string;
}

interface JobData {
  id: string;
  service_category: string;
  description: string;
  status: string;
  agreed_amount?: number;
  budget_max?: number;
  assigned_provider?: {
    id: string;
    name: string;
    rating?: number;
    completed_jobs?: number;
    photo_url?: string;
    role?: string;
  };
  created_at: string;
}

export default function JobDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [job, setJob] = useState<JobData | null>(null);
  
  // Mock milestones for now - would come from milestones API in future
  const [milestones] = useState<Milestone[]>([
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
  ]);

  // Mock timeline - would come from job history in future
  const timeline: TimelineEvent[] = [
    { date: '2025-11-02', event: 'Job accepted by contractor', icon: 'checkmark-circle' },
    { date: '2025-11-02', event: 'Upfront payment received', icon: 'cash' },
    { date: '2025-11-03', event: 'Materials receipts uploaded', icon: 'document' },
    { date: '2025-11-03', event: 'Materials payment released', icon: 'checkmark-circle' },
    { date: '2025-11-05', event: '50% milestone submitted', icon: 'alert-circle' },
  ];

  useEffect(() => {
    fetchJob();
  }, [params.id]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      const jobId = Array.isArray(params.id) ? params.id[0] : params.id;
      const response = await jobsAPI.getJob(jobId);
      setJob(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load job');
    } finally {
      setLoading(false);
    }
  };

  // Transform API job to display format
  const getJobTitle = () => {
    if (!job) return 'Loading...';
    // Use description as title if no separate title field
    return job.description?.split('.')[0] || 'Job';
  };

  const getCategory = () => {
    if (!job) return 'Loading...';
    return job.service_category || 'Service';
  };

  const getTotalAmount = () => {
    if (!job) return 0;
    return job.agreed_amount || job.budget_max || 0;
  };

  const getContractorInfo = (): JobContractor => {
    if (!job?.assigned_provider) {
      return {
        id: 'unknown',
        name: 'Mike Johnson',
        rating: 4.8,
        completedJobs: 47,
        photo: 'https://ui-avatars.com/api/?name=Mike+Johnson&background=2563EB&color=fff',
        role: 'contractor',
      };
    }
    const p = job.assigned_provider;
    return {
      id: p.id,
      name: p.name,
      rating: p.rating || 0,
      completedJobs: p.completed_jobs || 0,
      photo: p.photo_url,
      role: (p.role as 'handyman' | 'contractor') || 'contractor',
    };
  };

  const getPaymentInfo = (): JobPayment => {
    const total = getTotalAmount();
    // Mock payment calculation based on total
    return {
      total,
      upfrontPaid: total * 0.4,
      materialsReleased: total * 0.32,
      milestone50Released: total * 0.3,
      finalRelease: total * 0.38,
      escrowBalance: total * 0.6,
    };
  };

  const jobContractor = getContractorInfo();
  const jobPayment = getPaymentInfo();
  const completionPercentage = job?.status === 'completed' ? 100 : 50;

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
    Alert.alert(
      'Payment Approval',
      'This action will be enabled in a future update. Payment approval functionality is coming soon.',
      [{ text: 'OK' }]
    );
  };

  const handleRejectMilestone = (milestoneId: string) => {
    Alert.alert(
      'Request Changes',
      'This action will be enabled in a future update. Change request functionality is coming soon.',
      [{ text: 'OK' }]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Loading job details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.error.main} />
          <Text style={styles.errorText}>{error}</Text>
          <Button title="Retry" onPress={fetchJob} variant="primary" />
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
            style={styles.backButton}
          />
          <Button
            title=""
            onPress={() => router.push(`/(customer)/chat/${params.id}`)}
            variant="ghost"
            size="small"
            icon={<Ionicons name="chatbubbles" size={24} color={colors.primary.main} />}
          />
        </View>

        {/* Job Title */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{getJobTitle()}</Text>
          <Badge label={getCategory()} variant="neutral" />
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
            <Image source={{ uri: jobContractor.photo || 'https://ui-avatars.com/api/?name=Contractor&background=2563EB&color=fff' }} style={styles.contractorPhoto} />
            <View style={styles.contractorInfo}>
              {/* Role Label */}
              <View style={styles.roleLabel}>
                <Text style={styles.roleLabelText}>
                  {jobContractor.role === 'handyman' ? 'Your Handyman' : 'Your Contractor'}
                </Text>
                {jobContractor.role === 'handyman' && (
                  <TouchableOpacity
                    onPress={() => router.push('/(customer)/handyman-info')}
                    style={styles.handymanPill}
                  >
                    <Ionicons name="information-circle" size={14} color={colors.warning.main} />
                    <Text style={styles.handymanPillText}>What's this?</Text>
                  </TouchableOpacity>
                )}
              </View>

              <Text style={styles.contractorName}>{jobContractor.name}</Text>
              <View style={styles.contractorMeta}>
                <Ionicons name="star" size={16} color={colors.warning.main} />
                <Text style={styles.contractorRating}>{jobContractor.rating.toFixed(1)}</Text>
                <Text style={styles.contractorJobs}>
                  • {jobContractor.completedJobs} jobs
                </Text>
              </View>
            </View>
            <Button
              title=""
              onPress={() => router.push(`/(customer)/chat/${params.id}`)}
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
            <Text style={styles.paymentAmount}>${jobPayment.total.toFixed(2)}</Text>
          </View>

          <View style={styles.paymentDivider} />

          <View style={styles.paymentRow}>
            <View style={styles.paymentLabelWithIcon}>
              <Ionicons name="cash" size={20} color={colors.success.main} />
              <Text style={styles.paymentLabel}>Upfront Paid</Text>
            </View>
            <Text style={[styles.paymentAmount, { color: colors.success.main }]}>
              ${jobPayment.upfrontPaid.toFixed(2)}
            </Text>
          </View>

          <View style={styles.paymentRow}>
            <View style={styles.paymentLabelWithIcon}>
              <Ionicons name="shield-checkmark" size={20} color={colors.warning.main} />
              <Text style={styles.paymentLabel}>Held in Escrow</Text>
            </View>
            <Text style={[styles.paymentAmount, { color: colors.warning.main }]}>
              ${jobPayment.escrowBalance.toFixed(2)}
            </Text>
          </View>

          <View style={styles.paymentDivider} />

          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabelSmall}>Materials Released</Text>
            <Text style={styles.paymentAmountSmall}>
              ${jobPayment.materialsReleased.toFixed(2)}
            </Text>
          </View>
        </Card>

        {/* Milestones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Milestones</Text>

          {milestones.map((milestone) => (
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
            {timeline.map((event, index) => (
              <View
                key={index}
                style={[
                  styles.timelineEvent,
                  index === timeline.length - 1 && styles.timelineEventLast,
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

        {/* Change Orders */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Change Orders</Text>
            <TouchableOpacity
              onPress={() => router.push(`/(customer)/job-detail/${params.id}/change-orders`)}
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <Card variant="outlined" padding="base">
            <View style={styles.changeOrderEmptyState}>
              <Ionicons name="document-text-outline" size={48} color={colors.neutral[400]} />
              <Text style={styles.changeOrderEmptyTitle}>No Change Orders</Text>
              <Text style={styles.changeOrderEmptyText}>
                Change orders will appear here when your contractor requests scope changes or additional work.
              </Text>
            </View>
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
              onPress={() => router.push('/(customer)/support')}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    ...typography.body.regular,
    color: colors.neutral[600],
    marginTop: spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    ...typography.body.regular,
    color: colors.error.main,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    textAlign: 'center',
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
    ...typography.headings.h2,
    color: colors.neutral[900],
    flex: 1,
    marginRight: spacing.md,
  },
  progressCard: {
    marginBottom: spacing.lg,
  },
  cardTitle: {
    ...typography.headings.h5,
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
  progressLabel: {
    ...typography.caption.regular,
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
  roleLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  roleLabelText: {
    ...typography.caption.small,
    color: colors.neutral[600],
    textTransform: 'uppercase',
    fontWeight: typography.weights.semibold,
    letterSpacing: 0.5,
  },
  handymanPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.warning.lightest,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.warning.main,
  },
  handymanPillText: {
    ...typography.caption.small,
    color: colors.warning.main,
    fontWeight: typography.weights.medium,
  },
  contractorName: {
    ...typography.headings.h5,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  contractorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  contractorRating: {
    ...typography.caption.regular,
    color: colors.neutral[700],
    fontWeight: typography.weights.medium,
  },
  contractorJobs: {
    ...typography.caption.regular,
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
    ...typography.body.regular,
    color: colors.neutral[700],
  },
  paymentLabelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  paymentAmount: {
    ...typography.headings.h5,
    color: colors.neutral[900],
  },
  paymentLabelSmall: {
    ...typography.caption.regular,
    color: colors.neutral[600],
  },
  paymentAmountSmall: {
    ...typography.body.regular,
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
    ...typography.headings.h4,
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  viewAllText: {
    ...typography.body.small,
    color: colors.primary.main,
    fontWeight: typography.weights.semibold,
  },
  changeOrderEmptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  changeOrderEmptyTitle: {
    ...typography.headings.h5,
    color: colors.neutral[700],
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  changeOrderEmptyText: {
    ...typography.body.small,
    color: colors.neutral[600],
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
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
    ...typography.headings.h5,
    color: colors.neutral[900],
  },
  milestoneAmount: {
    ...typography.headings.h4,
    color: colors.primary.main,
  },
  milestoneDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  milestoneDateText: {
    ...typography.caption.regular,
    color: colors.neutral[600],
  },
  milestoneNotes: {
    ...typography.body.regular,
    color: colors.neutral[700],
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  evidenceSection: {
    marginTop: spacing.md,
  },
  evidenceTitle: {
    ...typography.caption.regular,
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
    ...typography.body.regular,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  timelineDate: {
    ...typography.caption.regular,
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
    ...typography.body.regular,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  supportDescription: {
    ...typography.caption.regular,
    color: colors.neutral[600],
    lineHeight: 20,
  },
});
