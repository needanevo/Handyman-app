/**
 * Contractor Geofence Map
 *
 * Shows contractor's business address and 50-mile service radius
 * Displays available jobs within the geofence
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../../src/constants/theme';
import { useAuth } from '../../../src/contexts/AuthContext';

const METERS_PER_MILE = 1609.34;
const SERVICE_RADIUS_MILES = 50;
const SERVICE_RADIUS_METERS = SERVICE_RADIUS_MILES * METERS_PER_MILE;

export default function ContractorGeofenceMap() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState<any>(null);

  useEffect(() => {
    // Get contractor's business address (first address)
    const businessAddress = user?.addresses?.[0];

    if (!businessAddress || !businessAddress.latitude || !businessAddress.longitude) {
      Alert.alert(
        'No Business Address',
        'Please add your business address in your profile to view the service area map.',
        [
          { text: 'Go to Profile', onPress: () => router.push('/(contractor)/profile') },
          { text: 'Cancel', onPress: () => router.back(), style: 'cancel' },
        ]
      );
      return;
    }

    // Set map region centered on business address
    setRegion({
      latitude: businessAddress.latitude,
      longitude: businessAddress.longitude,
      latitudeDelta: 1.2, // ~50 miles in degrees
      longitudeDelta: 1.2,
    });

    setLoading(false);
  }, [user]);

  if (loading || !region) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.primary.main} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Service Area Map</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Loading map...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const businessAddress = user?.addresses?.[0];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primary.main} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Service Area Map</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons name="location" size={20} color={colors.primary.main} />
          <Text style={styles.infoText}>
            {businessAddress?.city}, {businessAddress?.state}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="radio-outline" size={20} color={colors.success.main} />
          <Text style={styles.infoText}>{SERVICE_RADIUS_MILES}-mile service radius</Text>
        </View>
      </View>

      {/* Map */}
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
      >
        {/* Business Address Marker */}
        <Marker
          coordinate={{
            latitude: businessAddress!.latitude!,
            longitude: businessAddress!.longitude!,
          }}
          title="Your Business"
          description={`${businessAddress?.street}, ${businessAddress?.city}, ${businessAddress?.state}`}
          pinColor={colors.primary.main}
        >
          <View style={styles.markerContainer}>
            <View style={styles.markerInner}>
              <Ionicons name="business" size={24} color="white" />
            </View>
          </View>
        </Marker>

        {/* 50-Mile Service Radius Circle */}
        <Circle
          center={{
            latitude: businessAddress!.latitude!,
            longitude: businessAddress!.longitude!,
          }}
          radius={SERVICE_RADIUS_METERS}
          strokeWidth={2}
          strokeColor={colors.primary.main}
          fillColor={`${colors.primary.main}20`} // 20% opacity
        />
      </MapView>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendCircle, { backgroundColor: colors.primary.main }]} />
          <Text style={styles.legendText}>Your Business Location</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendCircle, {
            backgroundColor: `${colors.primary.main}20`,
            borderWidth: 2,
            borderColor: colors.primary.main,
          }]} />
          <Text style={styles.legendText}>{SERVICE_RADIUS_MILES}-Mile Service Area</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
  },
  headerSpacer: {
    width: 40, // Same as back button to center title
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    ...typography.sizes.base,
    color: colors.neutral[600],
  },
  infoCard: {
    backgroundColor: colors.primary.lightest,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoText: {
    ...typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.neutral[800],
  },
  map: {
    flex: 1,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.lg,
    overflow: 'hidden',
  },
  markerContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  markerInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  legend: {
    backgroundColor: 'white',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    ...shadows.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legendCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  legendText: {
    ...typography.sizes.sm,
    color: colors.neutral[700],
  },
});
