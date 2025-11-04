import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { quotesAPI } from '../src/services/api';
import { LoadingSpinner } from '../src/components/LoadingSpinner';
import { Button } from '../src/components/Button';

export default function QuotesScreen() {
  const router = useRouter();
  
  const { 
    data: quotes, 
    isLoading, 
    refetch,
    isRefreshing 
  } = useQuery({
    queryKey: ['quotes'],
    queryFn: () => quotesAPI.getQuotes(),
  });

  const handleRefresh = () => {
    refetch();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return { name: 'document-outline', color: '#95A5A6' };
      case 'sent':
        return { name: 'mail-outline', color: '#3498DB' };
      case 'viewed':
        return { name: 'eye-outline', color: '#F39C12' };
      case 'accepted':
        return { name: 'checkmark-circle-outline', color: '#2ECC71' };
      case 'rejected':
        return { name: 'close-circle-outline', color: '#E74C3C' };
      case 'expired':
        return { name: 'time-outline', color: '#95A5A6' };
      default:
        return { name: 'document-outline', color: '#95A5A6' };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading && !quotes) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner fullScreen text="Loading your quotes..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.title}>My Quotes</Text>
        <TouchableOpacity onPress={() => router.push('/quote/request')} style={styles.addButton}>
          <Ionicons name="add" size={24} color="#FF6B35" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {quotes && quotes.length > 0 ? (
          <View style={styles.quotesList}>
            {quotes.map((quote: any, index: number) => {
              const statusInfo = getStatusIcon(quote.status);
              
              return (
                <TouchableOpacity
                  key={quote.id || index}
                  style={styles.quoteCard}
                  onPress={() => router.push(`/quotes/${quote.id}`)}
                  activeOpacity={0.7}
                >
                  <View style={styles.quoteHeader}>
                    <View style={styles.quoteInfo}>
                      <Text style={styles.quoteId}>#{quote.id?.slice(-6) || 'N/A'}</Text>
                      <Text style={styles.quoteDate}>
                        {formatDate(quote.created_at || quote.createdAt)}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: `${statusInfo.color}20` }]}>
                      <Ionicons 
                        name={statusInfo.name as any} 
                        size={16} 
                        color={statusInfo.color}
                        style={styles.statusIcon}
                      />
                      <Text style={[styles.statusText, { color: statusInfo.color }]}>
                        {quote.status?.charAt(0).toUpperCase() + quote.status?.slice(1) || 'Draft'}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={styles.quoteDescription} numberOfLines={2}>
                    {quote.description || 'Service request'}
                  </Text>
                  
                  <View style={styles.quoteFooter}>
                    <Text style={styles.quoteAmount}>
                      ${(quote.total_amount || quote.totalAmount || 0).toFixed(2)}
                    </Text>
                    {quote.expires_at && (
                      <Text style={styles.expiryDate}>
                        Expires: {formatDate(quote.expires_at)}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color="#BDC3C7" />
            <Text style={styles.emptyTitle}>No Quotes Yet</Text>
            <Text style={styles.emptyDescription}>
              Request your first quote to get started with The Real Johnson Services
            </Text>
            <Button
              title="Request Quote"
              onPress={() => router.push('/quote/request')}
              size="large"
              icon={<Ionicons name="add-circle-outline" size={20} color="#fff" />}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  addButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  quotesList: {
    padding: 24,
    gap: 16,
  },
  quoteCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F2F6',
  },
  quoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  quoteInfo: {
    flex: 1,
  },
  quoteId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  quoteDate: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  quoteDescription: {
    fontSize: 15,
    color: '#2C3E50',
    lineHeight: 20,
    marginBottom: 12,
  },
  quoteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quoteAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  expiryDate: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 24,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
});