import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../../src/constants/theme';
import { Button } from '../../../src/components/Button';
import { Card } from '../../../src/components/Card';
import { Badge } from '../../../src/components/Badge';
import { ProgressBar } from '../../../src/components/ProgressBar';
import { jobsAPI } from '../../../src/services/api';

interface JobProvider {
  id: string;
  name: string;
  business_name?: string;
  role: string;
  profile_photo?: string;
  phone: string;
  rating?: number;
  completed_jobs?: number;
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
  assigned_provider_id?: string;
  created_at: string;
}

export default function JobDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [job, setJob] = useState<JobData | null>(null);
  const [provider, setProvider] = useState<JobProvider | null>(null);

  const fetchJob = useCallback(async () => {
    try {
      setLoading(true);
      const jobId = Array.isArray(params.id) ? params.id[0] : params.id;
      
      const jobResponse = await jobsAPI.getJob(jobId);
      setJob(jobResponse.data || jobResponse);
      
      const providerId = jobResponse.data?.assigned_provider_id || jobResponse.assigned_provider_id;
      if (providerId) {
        try {
          const providerResponse = await jobsAPI.getProvider(providerId);
          setProvider(providerResponse.data || providerResponse);
        } catch {
          setProvider(null);
        }
      } else {
        setProvider(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load job');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchJob();
    setRefreshing(false);
  }, [fetchJob]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  const getJobTitle = () => {
    if (!job) return 'Loading...';
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

  const getCompletionPercentage = () => {
    if (!job) return 0;
    
    switch (job.status) {
      case 'completed':
      case 'paid':
        return 100;
      case 'in_review':
        return 85;
      case 'in_progress':
        return 60;
      case 'scheduled':
        return 20;
      case 'accepted':
        return 10;
      case 'posted':
        return 0;
      default:
        return 0;
    }
  };

  const getCompletionLabel = () => {
    if (!job) return 'Loading...';
    const pct = getCompletionPercentage();
    
    if (pct === 100) return 'Job completed!';
    if (pct === 85) return '85% - Awaiting your approval';
    if (pct === 60) return '60% - Provider is working';
    if (pct === 20) return '20% - Materials delivered, work starting';
    if (pct === 10) return '10% - Materials ordered';
    return '0% - Job created, awaiting provider';
  };

  const getProviderInfo = (): JobProvider => {
    if (provider) {
      return provider;
    }
    return {
      id: 'unknown',
      name: 'Mike Johnson',
      rating: 4.8,
      completed_jobs: 47,
      profile_photo: 'https://ui-avatars.com/api/?name=Mike+Johnson&background=2563EB&color=fff',
      role: 'contractor',
      phone: '(555) 123-4567',
    };
  };

  const getPaymentInfo = () => {
    const total = getTotalAmount();
    let upfrontPaid = 0;
    let materialsReleased = 0;
    let milestone50Released = 0;
    let finalRelease = 0;
    let escrowBalance = 0;

    if (job) {
      switch (job.status) {
        case 'completed':
        case 'paid':
          upfrontPaid = total * 0.4;
          materialsReleased = total * 0.32;
          milestone50Released = total * 0.3;
          finalRelease = total * 0.38;
          escrowBalance = 0;
          break;
        case 'in_review':
          upfrontPaid = total * 0.4;
          materialsReleased = total * 0.32;
          milestone50Released = total * 0.3;
          finalRelease = 0;
          escrowBalance = total * 0.38;
          break;
        case 'in_progress':
          upfrontPaid = total * 0.4;
          materialsReleased = total * 0.32;
          milestone50Released = 0;
          finalRelease = 0;
          escrowBalance = total * 0.68;
          break;
        case 'scheduled':
        case 'accepted':
          upfrontPaid = total * 0.4;
          materialsReleased = 0;
          milestone50Released = 0;
          finalRelease = 0;
          escrowBalance = total * 0.6;
          break;
        case 'posted':
        default:
          upfrontPaid = 0;
          materialsReleased = 0;
          milestone50Released = 0;
          finalRelease = 0;
          escrowBalance = total;
          break;
      }
    }

    return { total, upfrontPaid, materialsReleased, milestone50Released, finalRelease, escrowBalance };
  };

  const getTimeline = (): TimelineEvent[] => {
    const events: TimelineEvent[] = [];
    
    if (!job) return events;
    
    events.push({
      date: job.created_at ? new Date(job.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
      event: 'Job created',
      icon: 'create',
    });
    
    if (['accepted', 'scheduled', 'in_progress', 'in_review', 'completed', 'paid'].includes(job.status)) {
      events.push({ date: '', event: 'Provider accepted this job', icon: 'checkmark-circle' });
    }
    
    if (['accepted', 'scheduled', 'in_progress', 'in_review', 'completed', 'paid'].includes(job.status)) {
      events.push({ date: '', event: 'Materials ordered (10%)', icon: 'cart' });
    }
    
    if (['scheduled', 'in_progress', 'in_review', 'completed', 'paid'].includes(job.status)) {
      events.push({ date: '', event: 'Materials delivered (20%)', icon: 'cube' });
    }
    
    if (['in_progress', 'in_review', 'completed', 'paid'].includes(job.status)) {
      events.push({ date: '', event: 'Provider started work', icon: 'construct' });
    }
    
    if (['in_progress', 'in_review', 'completed', 'paid'].includes(job.status)) {
      events.push({ date: '', event: 'Working on your job (60%)', icon: 'build' });
    }
    
    if (['in_review', 'completed', 'paid'].includes(job.status)) {
      events.push({ date: '', event: 'Work complete - awaiting approval (85%)', icon: 'checkmark-done-circle' });
    }
    
    if (['completed', 'paid'].includes(job.status)) {
      events.push({ date: '', event: 'Job completed! (100%)', icon: 'trophy' });
    }
    
    return events;
  };

  const jobProvider = getProviderInfo();
  const jobPayment = getPaymentInfo();
  const completionPercentage = getCompletionPercentage();
  const timeline = getTimeline();

  const handleCallProvider = () => {
    if (jobProvider.phone) {
      Linking.openURL(`tel:${jobProvider.phone}`).catch(() => {
        Alert.alert('Error', 'Could not open phone app');
      });
    }
  };

  const handleMessageProvider = () => {
    if (jobProvider.phone) {
      Linking.openURL(`sms:${jobProvider.phone}`).catch(() => {
        Alert.alert('Error', 'Could not open messaging app');
      });
    }
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
      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
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
            variant={completionPercentage === 100 ? "success" : "primary"}
            height={12}
          />
          <Text style={styles.progressLabel}>{getCompletionLabel()}</Text>
          
          {/* Progress milestones */}
          <View style={styles.milestonesContainer}>
            <View style={[styles.milestoneDot, completionPercentage >= 0 && styles.milestoneDotActive]} />
            <View style={[styles.milestoneLine, completionPercentage >= 10 && styles.milestoneLineActive]} />
            <View style={[styles.milestoneDot, completionPercentage >= 10 && styles.milestoneDotActive]} />
            <View style={[styles.milestoneLine, completionPercentage >= 20 && styles.milestoneLineActive]} />
            <View style={[styles.milestoneDot, completionPercentage >= 20 && styles.milestoneDotActive]} />
            <View style={[styles.milestoneLine, completionPercentage >= 60 && styles.milestoneLineActive]} />
            <View style={[styles.milestoneDot, completionPercentage >= 60 && styles.milestoneDotActive]} />
            <View style={[styles.milestoneLine, completionPercentage >= 85 && styles.milestoneLineActive]} />
            <View style={[styles.milestoneDot, completionPercentage >= 85 && styles.milestoneDotActive]} />
            <View style={[styles.milestoneLine, completionPercentage >= 100 && styles.milestoneLineActive]} />
            <View style={[styles.milestoneDot, completionPercentage >= 100 && styles.milestoneDotActive]} />
          </View>
          <View style={styles.milestoneLabels}>
            <Text style={styles.milestoneLabel}>Created</Text>
            <Text style={styles.milestoneLabel}>Ordered</Text>
            <Text style={styles.milestoneLabel}>Delivered</Text>
            <Text style={styles.milestoneLabel}>Working</Text>
            <Text style={styles.milestoneLabel}>Done</Text>
          </View>
        </Card>

        {/* Contractor Card */}
        <Card variant="outlined" padding="base" style={styles.contractorCard}>
          <View style={styles.contractorContent}>
            <Image 
              source={{ 
                uri: jobProvider.profile_photo || 'https://ui-avatars.com/api/?name=Contractor&background=2563EB&color=fff' 
              }} 
              style={styles.contractorPhoto} 
            />
            <View style={styles.contractorInfo}>
              <View style={styles.roleLabel}>
                <Text style={styles.roleLabelText}>
                  {jobProvider.role === 'handyman' ? 'Your Handyman' : 'Your Contractor'}
                </Text>
              </View>
              <Text style={styles.contractorName}>{jobProvider.name}</Text>
              <View style={styles.contractorMeta}>
                {jobProvider.rating ? (
                  <>
                    <Ionicons name="star" size={16} color={colors.warning.main} />
                    <Text style={styles.contractorRating}>{jobProvider.rating.toFixed(1)}</Text>
                  </>
                ) : null}
                {jobProvider.completed_jobs ? (
                  <Text style={styles.contractorJobs}>• {jobProvider.completed_jobs} jobs</Text>
                ) : null}
              </View>
            </View>
          </View>
          
          {/* Contact buttons */}
          <View style={styles.contactButtons}>
            <TouchableOpacity style={[styles.contactButton, styles.callButton]} onPress={handleCallProvider}>
              <Ionicons name="call" size={20} color={colors.success.main} />
              <Text style={[styles.contactButtonText, { color: colors.success.main }]}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.contactButton, styles.messageButton]} onPress={handleMessageProvider}>
              <Ionicons name="chatbubble" size={20} color={colors.primary.main} />
              <Text style={[styles.contactButtonText, { color: colors.primary.main }]}>Text</Text>
            </TouchableOpacity>
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
            <Text style={styles.paymentAmountSmall}>${jobPayment.materialsReleased.toFixed(2)}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabelSmall}>50% Milestone</Text>
            <Text style={styles.paymentAmountSmall}>${jobPayment.milestone50Released.toFixed(2)}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabelSmall}>Final Release</Text>
            <Text style={styles.paymentAmountSmall}>${jobPayment.finalRelease.toFixed(2)}</Text>
          </View>
        </Card>

        {/* Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Timeline</Text>
          <Card variant="outlined" padding="base">
            {timeline.map((event, index) => (
              <View key={index} style={[styles.timelineEvent, index === timeline.length - 1 && styles.timelineEventLast]}>
                <View style={styles.timelineIcon}>
                  <Ionicons name={event.icon as any} size={20} color={colors.primary.main} />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineEventText}>{event.event}</Text>
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
              <Text style={styles.supportDescription}>Contact support for issues with this job.</Text>
            </View>
            <Button title="Contact" onPress={() => router.push('/(customer)/support')} variant="outline" size="small" />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  loadingText: { ...typography.body.regular, color: colors.neutral[600], marginTop: spacing.md },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  errorText: { ...typography.body.regular, color: colors.error.main, marginTop: spacing.md, marginBottom: spacing.lg, textAlign: 'center' },
  content: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingBottom: spacing['2xl'] },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: spacing.sm, marginBottom: spacing.lg },
  backButton: { alignSelf: 'flex-start' },
  titleSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.xl },
  title: { ...typography.headings.h2, color: colors.neutral[900], flex: 1, marginRight: spacing.md },
  progressCard: { marginBottom: spacing.lg },
  cardTitle: { ...typography.headings.h5, color: colors.neutral[900], marginBottom: spacing.md },
  progressLabel: { ...typography.caption.regular, color: colors.neutral[600], marginTop: spacing.sm, textAlign: 'center' },
  milestonesContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.lg, paddingHorizontal: spacing.xs },
  milestoneDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.neutral[300] },
  milestoneDotActive: { backgroundColor: colors.primary.main },
  milestoneLine: { flex: 1, height: 3, backgroundColor: colors.neutral[300], marginHorizontal: 2 },
  milestoneLineActive: { backgroundColor: colors.primary.main },
  milestoneLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs, paddingHorizontal: 2 },
  milestoneLabel: { ...typography.caption.small, color: colors.neutral[500], fontSize: 10, textAlign: 'center' },
  contractorCard: { marginBottom: spacing.lg },
  contractorContent: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  contractorPhoto: { width: 56, height: 56, borderRadius: borderRadius.full },
  contractorInfo: { flex: 1 },
  roleLabel: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs, gap: spacing.sm },
  roleLabelText: { ...typography.caption.small, color: colors.neutral[600], textTransform: 'uppercase', fontWeight: typography.weights.semibold, letterSpacing: 0.5 },
  contractorName: { ...typography.headings.h5, color: colors.neutral[900], marginBottom: spacing.xs },
  contractorMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  contractorRating: { ...typography.caption.regular, color: colors.neutral[700], fontWeight: typography.weights.medium },
  contractorJobs: { ...typography.caption.regular, color: colors.neutral[600] },
  contactButtons: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.neutral[200] },
  contactButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: spacing.sm, borderRadius: borderRadius.md, borderWidth: 1 },
  callButton: { backgroundColor: colors.success.lightest, borderColor: colors.success.main },
  messageButton: { backgroundColor: colors.primary.lightest, borderColor: colors.primary.main },
  contactButtonText: { ...typography.body.regular, fontWeight: typography.weights.semibold },
  paymentCard: { marginBottom: spacing.lg },
  paymentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  paymentLabel: { ...typography.body.regular, color: colors.neutral[700] },
  paymentLabelWithIcon: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  paymentAmount: { ...typography.headings.h5, color: colors.neutral[900] },
  paymentLabelSmall: { ...typography.caption.regular, color: colors.neutral[600] },
  paymentAmountSmall: { ...typography.body.regular, fontWeight: typography.weights.medium, color: colors.neutral[700] },
  paymentDivider: { height: 1, backgroundColor: colors.neutral[200], marginVertical: spacing.md },
  section: { marginBottom: spacing.xl },
  sectionTitle: { ...typography.headings.h4, color: colors.neutral[900], marginBottom: spacing.md },
  timelineEvent: { flexDirection: 'row', gap: spacing.md, paddingBottom: spacing.md, borderLeftWidth: 2, borderLeftColor: colors.neutral[200], marginLeft: spacing.sm },
  timelineEventLast: { borderLeftWidth: 0, paddingBottom: 0 },
  timelineIcon: { width: 32, height: 32, borderRadius: borderRadius.full, backgroundColor: colors.primary.lightest, alignItems: 'center', justifyContent: 'center', marginLeft: -17 },
  timelineContent: { flex: 1, paddingTop: spacing.xs },
  timelineEventText: { ...typography.body.regular, color: colors.neutral[900], marginBottom: spacing.xs },
  timelineDate: { ...typography.caption.regular, color: colors.neutral[600] },
  supportCard: { marginBottom: spacing.lg },
  supportContent: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  supportText: { flex: 1 },
  supportTitle: { ...typography.body.regular, fontWeight: typography.weights.semibold, color: colors.neutral[900], marginBottom: spacing.xs },
  supportDescription: { ...typography.caption.regular, color: colors.neutral[600], lineHeight: 20 },
});
