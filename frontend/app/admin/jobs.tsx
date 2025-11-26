import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../src/constants/theme';
import { Button } from '../../src/components/Button';
import { api } from '../../src/services/api';

interface Job {
  id: string;
  customer_id: string;
  contractor_id?: string;
  service_category: string;
  status: string;
  total_cost?: number;
  scheduled_date?: string;
  created_at: string;
  customer_name?: string;
  contractor_name?: string;
}

type FilterStatus = 'ALL' | 'REQUESTED' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export default function AdminJobsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL');

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchQuery, filterStatus]);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/admin/jobs');
      setJobs(response.data.jobs || []);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = () => {
    let filtered = jobs;

    // Filter by status
    if (filterStatus !== 'ALL') {
      filtered = filtered.filter((job) => job.status.toUpperCase() === filterStatus);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.service_category.toLowerCase().includes(query) ||
          job.id.toLowerCase().includes(query) ||
          job.customer_name?.toLowerCase().includes(query) ||
          job.contractor_name?.toLowerCase().includes(query)
      );
    }

    setFilteredJobs(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return colors.success.main;
      case 'in_progress':
        return colors.info.main;
      case 'accepted':
        return colors.primary.main;
      case 'cancelled':
        return colors.error.main;
      default:
        return colors.warning.main;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'checkmark-circle';
      case 'in_progress':
        return 'construct';
      case 'accepted':
        return 'hand-left';
      case 'cancelled':
        return 'close-circle';
      default:
        return 'time';
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
          <Text style={styles.title}>Job Management</Text>
          <Text style={styles.subtitle}>
            {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found
          </Text>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.neutral[400]} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by category, ID, or names..."
            placeholderTextColor={colors.neutral[400]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.neutral[400]} />
            </TouchableOpacity>
          )}
        </View>

        {/* Status Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
          <TouchableOpacity
            style={[styles.filterChip, filterStatus === 'ALL' && styles.filterChipActive]}
            onPress={() => setFilterStatus('ALL')}
          >
            <Text style={[styles.filterChipText, filterStatus === 'ALL' && styles.filterChipTextActive]}>
              All ({jobs.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filterStatus === 'REQUESTED' && styles.filterChipActive]}
            onPress={() => setFilterStatus('REQUESTED')}
          >
            <Text style={[styles.filterChipText, filterStatus === 'REQUESTED' && styles.filterChipTextActive]}>
              Requested ({jobs.filter((j) => j.status.toLowerCase() === 'requested').length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filterStatus === 'ACCEPTED' && styles.filterChipActive]}
            onPress={() => setFilterStatus('ACCEPTED')}
          >
            <Text style={[styles.filterChipText, filterStatus === 'ACCEPTED' && styles.filterChipTextActive]}>
              Accepted ({jobs.filter((j) => j.status.toLowerCase() === 'accepted').length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filterStatus === 'IN_PROGRESS' && styles.filterChipActive]}
            onPress={() => setFilterStatus('IN_PROGRESS')}
          >
            <Text style={[styles.filterChipText, filterStatus === 'IN_PROGRESS' && styles.filterChipTextActive]}>
              In Progress ({jobs.filter((j) => j.status.toLowerCase() === 'in_progress').length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filterStatus === 'COMPLETED' && styles.filterChipActive]}
            onPress={() => setFilterStatus('COMPLETED')}
          >
            <Text style={[styles.filterChipText, filterStatus === 'COMPLETED' && styles.filterChipTextActive]}>
              Completed ({jobs.filter((j) => j.status.toLowerCase() === 'completed').length})
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Jobs List */}
        <View style={styles.list}>
          {filteredJobs.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="construct-outline" size={64} color={colors.neutral[300]} />
              <Text style={styles.emptyTitle}>No Jobs Found</Text>
              <Text style={styles.emptyText}>
                {searchQuery ? 'Try adjusting your search' : 'No jobs match the current filter'}
              </Text>
            </View>
          ) : (
            filteredJobs.map((job) => (
              <View key={job.id} style={styles.jobCard}>
                {/* Job Header */}
                <View style={styles.jobHeader}>
                  <View style={styles.categoryContainer}>
                    <Ionicons name="hammer" size={20} color={colors.primary.main} />
                    <Text style={styles.category}>{job.service_category}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(job.status)}20` }]}>
                    <Ionicons
                      name={getStatusIcon(job.status) as any}
                      size={14}
                      color={getStatusColor(job.status)}
                    />
                    <Text style={[styles.statusText, { color: getStatusColor(job.status) }]}>
                      {job.status}
                    </Text>
                  </View>
                </View>

                {/* Job Details */}
                <View style={styles.jobDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="pricetag" size={16} color={colors.neutral[600]} />
                    <Text style={styles.detailText}>
                      ID: {job.id.substring(0, 8)}...
                    </Text>
                  </View>
                  {job.customer_name && (
                    <View style={styles.detailRow}>
                      <Ionicons name="person" size={16} color={colors.neutral[600]} />
                      <Text style={styles.detailText}>Customer: {job.customer_name}</Text>
                    </View>
                  )}
                  {job.contractor_name && (
                    <View style={styles.detailRow}>
                      <Ionicons name="construct" size={16} color={colors.neutral[600]} />
                      <Text style={styles.detailText}>Contractor: {job.contractor_name}</Text>
                    </View>
                  )}
                  {job.total_cost !== undefined && (
                    <View style={styles.detailRow}>
                      <Ionicons name="cash" size={16} color={colors.neutral[600]} />
                      <Text style={styles.detailText}>
                        ${job.total_cost.toFixed(2)}
                      </Text>
                    </View>
                  )}
                  {job.scheduled_date && (
                    <View style={styles.detailRow}>
                      <Ionicons name="calendar" size={16} color={colors.neutral[600]} />
                      <Text style={styles.detailText}>
                        Scheduled: {new Date(job.scheduled_date).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                  <View style={styles.detailRow}>
                    <Ionicons name="time" size={16} color={colors.neutral[600]} />
                    <Text style={styles.detailText}>
                      Created {new Date(job.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </View>
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
    marginBottom: spacing.md,
  },
  title: {
    ...typography.headings.h2,
    color: colors.neutral[900],
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body.regular,
    color: colors.neutral[600],
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body.regular,
    color: colors.neutral[900],
  },
  filtersContainer: {
    marginBottom: spacing.lg,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  filterChipActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  filterChipText: {
    ...typography.caption.regular,
    color: colors.neutral[700],
    fontWeight: typography.weights.medium,
  },
  filterChipTextActive: {
    color: '#fff',
  },
  list: {
    gap: spacing.md,
  },
  jobCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  category: {
    ...typography.headings.h5,
    color: colors.neutral[900],
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
    ...typography.caption.regular,
    fontWeight: typography.weights.semibold,
    textTransform: 'capitalize',
  },
  jobDetails: {
    gap: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  detailText: {
    ...typography.body.regular,
    color: colors.neutral[600],
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    gap: spacing.md,
  },
  emptyTitle: {
    ...typography.headings.h4,
    color: colors.neutral[700],
  },
  emptyText: {
    ...typography.body.regular,
    color: colors.neutral[500],
    textAlign: 'center',
  },
});
