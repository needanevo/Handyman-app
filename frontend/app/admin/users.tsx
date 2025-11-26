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

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: 'CUSTOMER' | 'TECHNICIAN' | 'HANDYMAN' | 'ADMIN';
  registration_status?: string;
  created_at: string;
}

type FilterRole = 'ALL' | 'CUSTOMER' | 'TECHNICIAN' | 'HANDYMAN' | 'ADMIN';

export default function AdminUsersScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<FilterRole>('ALL');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, filterRole]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by role
    if (filterRole !== 'ALL') {
      filtered = filtered.filter((user) => user.role === filterRole);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.email.toLowerCase().includes(query) ||
          user.first_name.toLowerCase().includes(query) ||
          user.last_name.toLowerCase().includes(query) ||
          user.phone.includes(query)
      );
    }

    setFilteredUsers(filtered);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return colors.error.main;
      case 'TECHNICIAN':
      case 'HANDYMAN':
        return colors.primary.main;
      default:
        return colors.success.main;
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'TECHNICIAN':
        return 'Contractor';
      case 'HANDYMAN':
        return 'Handyman';
      default:
        return role.charAt(0) + role.slice(1).toLowerCase();
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
          <Text style={styles.title}>User Management</Text>
          <Text style={styles.subtitle}>
            {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
          </Text>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.neutral[400]} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, email, or phone..."
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

        {/* Role Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
          <TouchableOpacity
            style={[styles.filterChip, filterRole === 'ALL' && styles.filterChipActive]}
            onPress={() => setFilterRole('ALL')}
          >
            <Text style={[styles.filterChipText, filterRole === 'ALL' && styles.filterChipTextActive]}>
              All ({users.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filterRole === 'CUSTOMER' && styles.filterChipActive]}
            onPress={() => setFilterRole('CUSTOMER')}
          >
            <Text style={[styles.filterChipText, filterRole === 'CUSTOMER' && styles.filterChipTextActive]}>
              Customers ({users.filter((u) => u.role === 'CUSTOMER').length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filterRole === 'TECHNICIAN' && styles.filterChipActive]}
            onPress={() => setFilterRole('TECHNICIAN')}
          >
            <Text style={[styles.filterChipText, filterRole === 'TECHNICIAN' && styles.filterChipTextActive]}>
              Contractors ({users.filter((u) => u.role === 'TECHNICIAN').length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filterRole === 'HANDYMAN' && styles.filterChipActive]}
            onPress={() => setFilterRole('HANDYMAN')}
          >
            <Text style={[styles.filterChipText, filterRole === 'HANDYMAN' && styles.filterChipTextActive]}>
              Handymen ({users.filter((u) => u.role === 'HANDYMAN').length})
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Users List */}
        <View style={styles.list}>
          {filteredUsers.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={64} color={colors.neutral[300]} />
              <Text style={styles.emptyTitle}>No Users Found</Text>
              <Text style={styles.emptyText}>
                {searchQuery ? 'Try adjusting your search' : 'No users match the current filter'}
              </Text>
            </View>
          ) : (
            filteredUsers.map((user) => (
              <View key={user.id} style={styles.userCard}>
                {/* User Header */}
                <View style={styles.userHeader}>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>
                      {user.first_name} {user.last_name}
                    </Text>
                    <View style={[styles.roleBadge, { backgroundColor: `${getRoleBadgeColor(user.role)}20` }]}>
                      <Text style={[styles.roleText, { color: getRoleBadgeColor(user.role) }]}>
                        {getRoleDisplayName(user.role)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* User Details */}
                <View style={styles.userDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="mail" size={16} color={colors.neutral[600]} />
                    <Text style={styles.detailText}>{user.email}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="call" size={16} color={colors.neutral[600]} />
                    <Text style={styles.detailText}>{user.phone}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="calendar" size={16} color={colors.neutral[600]} />
                    <Text style={styles.detailText}>
                      Joined {new Date(user.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  {user.registration_status && (
                    <View style={styles.detailRow}>
                      <Ionicons name="shield-checkmark" size={16} color={colors.neutral[600]} />
                      <Text style={styles.detailText}>Status: {user.registration_status}</Text>
                    </View>
                  )}
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
  userCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...typography.headings.h5,
    color: colors.neutral[900],
    marginBottom: spacing.sm,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  roleText: {
    ...typography.caption.regular,
    fontWeight: typography.weights.semibold,
  },
  userDetails: {
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
