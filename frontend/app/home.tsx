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

const { width } = Dimensions.get('window');

const serviceCategories = [
  {
    id: 'drywall',
    title: 'Drywall',
    icon: 'hammer-outline',
    color: '#FF6B35',
    description: 'Patches, repairs, texturing',
    fullDescription: 'Expert drywall repair and installation. We handle small patches, large repairs, texture matching, and full installations. Fast turnaround for holes, cracks, and water damage.',
  },
  {
    id: 'painting',
    title: 'Painting',
    icon: 'brush-outline',
    color: '#4ECDC4',
    description: 'Interior, exterior, touch-ups',
    fullDescription: 'Professional painting services for interior and exterior spaces. We provide color consultation, preparation, priming, and finishing. Touch-ups and full room makeovers available.',
  },
  {
    id: 'electrical',
    title: 'Electrical',
    icon: 'flash-outline',
    color: '#45B7D1',
    description: 'Outlets, switches, fixtures',
    fullDescription: 'Licensed electrical work including outlet installation, switch replacement, light fixture upgrades, ceiling fan installation, and minor electrical repairs. All work code-compliant.',
  },
  {
    id: 'plumbing',
    title: 'Plumbing',
    icon: 'water-outline',
    color: '#96CEB4',
    description: 'Faucets, leaks, installations',
    fullDescription: 'Reliable plumbing services for faucet repairs, leak fixes, drain clearing, toilet installation, garbage disposal replacement, and water heater maintenance.',
  },
  {
    id: 'carpentry',
    title: 'Carpentry',
    icon: 'construct-outline',
    color: '#FECA57',
    description: 'Doors, trim, repairs',
    fullDescription: 'Skilled carpentry for door installation and repair, trim work, baseboards, crown molding, custom shelving, and general woodwork repairs.',
  },
  {
    id: 'roofing',
    title: 'Roofing',
    icon: 'home-outline',
    color: '#E74C3C',
    description: 'Leak repairs, shingle replacement',
    fullDescription: 'Roofing repair and maintenance including leak detection and repair, shingle replacement, flashing repair, gutter work, and roof inspections. Emergency repairs available.',
  },
  {
    id: 'hvac',
    title: 'HVAC',
    icon: 'snow-outline',
    color: '#9B59B6',
    description: 'AC, heating, maintenance',
    fullDescription: 'HVAC services including air conditioning repair, heating system maintenance, filter replacement, thermostat installation, and seasonal tune-ups to keep your system running efficiently.',
  },
  {
    id: 'appliances',
    title: 'Appliances',
    icon: 'cube-outline',
    color: '#34495E',
    description: 'Repair, installation, service',
    fullDescription: 'Appliance installation and repair for refrigerators, washers, dryers, dishwashers, ovens, and microwaves. We diagnose issues and provide honest recommendations.',
  },
  {
    id: 'miscellaneous',
    title: 'Other',
    icon: 'build-outline',
    color: '#A29BFE',
    description: 'TV mounts, honey-do lists',
    fullDescription: 'General handyman services including TV mounting, picture hanging, furniture assembly, smart home device installation, and those honey-do list items you\'ve been putting off.',
  },
];

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
          <View style={styles.servicesGrid}>
            {serviceCategories.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={styles.serviceCard}
                onPress={() => handleServiceSelect(service.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.serviceIcon, { backgroundColor: `${service.color}20` }]}>
                  <Ionicons
                    name={service.icon as any}
                    size={24}
                    color={service.color}
                  />
                </View>
                <Text style={styles.serviceTitle}>{service.title}</Text>
                <Text style={styles.serviceDescription}>{service.description}</Text>
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
