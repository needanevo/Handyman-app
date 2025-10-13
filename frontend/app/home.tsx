import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { Button } from '../src/components/Button';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { servicesAPI, quotesAPI } from '../src/services/api';
import { LoadingSpinner } from '../src/components/LoadingSpinner';
import { serviceCategories } from '../src/constants/services';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  // Fetch recent quotes
  const { data: quotes, isLoading: quotesLoading } = useQuery({
    queryKey: ['quotes'],
    queryFn: () => quotesAPI.getQuotes(),
  });

  const handleServiceSelect = (category: string) => {
    router.push(`/quote/request?category=${category}`);
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/auth/welcome');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>Welcome back!</Text>
              <Text style={styles.userName}>
                {user?.firstName} {user?.lastName}
              </Text>
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <Ionicons name="log-out-outline" size={24} color="#7F8C8D" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Action */}
        <View style={styles.quickAction}>
          <View style={styles.quickActionContent}>
            <Text style={styles.quickActionTitle}>Need something fixed?</Text>
            <Text style={styles.quickActionSubtitle}>
              Get an AI-powered estimate in minutes
            </Text>
            <Button
              title="Get Quote Now"
              onPress={() => router.push('/quote/request')}
              size="large"
              fullWidth
            />
          </View>
        </View>

        {/* Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Services</Text>
          <View style={styles.servicesList}>
            {serviceCategories.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={styles.serviceButton}
                onPress={() => handleServiceSelect(service.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.serviceIconSmall, { backgroundColor: `${service.color}20` }]}>
                  <Ionicons
                    name={service.icon as any}
                    size={20}
                    color={service.color}
                  />
                </View>
                <View style={styles.serviceContent}>
                  <Text style={styles.serviceButtonTitle}>{service.title}</Text>
                  <Text style={styles.serviceButtonDescription}>{service.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#BDC3C7" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Quotes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Quotes</Text>
            <TouchableOpacity onPress={() => router.push('/quotes')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {quotesLoading ? (
            <LoadingSpinner text="Loading quotes..." />
          ) : quotes && quotes.length > 0 ? (
            <View style={styles.quotesList}>
              {quotes.slice(0, 3).map((quote: any, index: number) => (
                <TouchableOpacity
                  key={quote.id || index}
                  style={styles.quoteCard}
                  onPress={() => router.push(`/quotes/${quote.id}`)}
                >
                  <View style={styles.quoteHeader}>
                    <Text style={styles.quoteTitle}>Quote #{quote.id?.slice(-6)}</Text>
                    <View style={[styles.quoteBadge, getStatusColor(quote.status)]}>
                      <Text style={[styles.quoteBadgeText, getStatusTextColor(quote.status)]}>
                        {formatStatus(quote.status)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.quoteDescription}>
                    {quote.description?.slice(0, 60) || 'Service request'}...
                  </Text>
                  <Text style={styles.quoteAmount}>
                    ${quote.total_amount || quote.totalAmount || '0.00'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="document-outline" size={48} color="#BDC3C7" />
              <Text style={styles.emptyStateText}>No quotes yet</Text>
              <Text style={styles.emptyStateSubtext}>Request your first quote to get started</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'sent':
      return { backgroundColor: '#3498DB20' };
    case 'accepted':
      return { backgroundColor: '#2ECC7120' };
    case 'rejected':
      return { backgroundColor: '#E74C3C20' };
    default:
      return { backgroundColor: '#F39C1220' };
  }
}

function getStatusTextColor(status: string) {
  switch (status) {
    case 'sent':
      return { color: '#3498DB' };
    case 'accepted':
      return { color: '#2ECC71' };
    case 'rejected':
      return { color: '#E74C3C' };
    default:
      return { color: '#F39C12' };
  }
}

function formatStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 2,
  },
  logoutButton: {
    padding: 8,
  },
  quickAction: {
    marginHorizontal: 24,
    marginVertical: 20,
    backgroundColor: '#FF6B35',
    borderRadius: 16,
    padding: 24,
  },
  quickActionContent: {
    alignItems: 'center',
  },
  quickActionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  quickActionSubtitle: {
    fontSize: 16,
    color: '#FFE4DB',
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  seeAll: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: '600',
  },
  servicesList: {
    gap: 10,
  },
  serviceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  serviceIconSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serviceContent: {
    flex: 1,
  },
  serviceButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  serviceButtonDescription: {
    fontSize: 13,
    color: '#7F8C8D',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  serviceCard: {
    width: (width - 64) / 2, // 2 columns with padding
    margin: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 12,
    color: '#7F8C8D',
    lineHeight: 16,
  },
  quotesList: {
    gap: 12,
  },
  quoteCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  quoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  quoteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  quoteBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  quoteBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  quoteDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  quoteAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7F8C8D',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#BDC3C7',
    textAlign: 'center',
    marginTop: 4,
  },
});
