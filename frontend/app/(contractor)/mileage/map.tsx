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
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Only import MapView on native platforms
let MapView: any, Circle: any, Marker: any, PROVIDER_GOOGLE: any;
if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Circle = Maps.Circle;
  Marker = Maps.Marker;
  PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
}
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

  // Show web not supported message
  if (Platform.OS === 'web') {
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
          <Ionicons name="phone-portrait-outline" size={64} color={colors.neutral[400]} />
          <Text style={styles.loadingText}>Maps are only available on mobile devices.</Text>
          <Text style={[styles.loadingText, { fontSize: 14, color: colors.neutral[500] }]}>
            Please use the mobile app to view your service area.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  useEffect(() => {
    loadMap();
  }, [user]);

  const loadMap = async () => {
    // Get contractor's business address (first address)
    const businessAddress = user?.addresses?.[0];

    console.log('=== MAP DEBUG ===');
    console.log('User addresses:', user?.addresses);
    console.log('Business address:', businessAddress);
    console.log('Lat/Lon:', businessAddress?.latitude, businessAddress?.longitude);

    if (!businessAddress) {
      Alert.alert(
        'No Business Address',
        'Please add your business address in your profile to view the service area map.',
        [
          { text: 'Go to Profile', onPress: () => router.push('/(contractor)/profile') },
          { text: 'Cancel', onPress: () => router.back(), style: 'cancel' },
        ]
      );
      setLoading(false);
      return;
    }

    // If we have lat/lon from backend, use it
    if (businessAddress.latitude && businessAddress.longitude) {
      setRegion({
        latitude: businessAddress.latitude,
        longitude: businessAddress.longitude,
        latitudeDelta: 1.2,
        longitudeDelta: 1.2,
      });
      setLoading(false);
      return;
    }

    // Otherwise, geocode using browser/device geocoding as fallback
    try {
      const addressString = `${businessAddress.street}, ${businessAddress.city}, ${businessAddress.state} ${businessAddress.zipCode}`;

      // Use Nominatim (OpenStreetMap) free geocoding API as fallback
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressString)}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);

        setRegion({
          latitude: lat,
          longitude: lon,
          latitudeDelta: 1.2,
          longitudeDelta: 1.2,
        });
      } else {
        throw new Error('Geocoding failed');
      }
    } catch (error) {
      Alert.alert(
        'Unable to Locate Address',
        'We couldn\'t find the coordinates for your business address. Please update your address or contact support.',
        [
          { text: 'Go to Profile', onPress: () => router.push('/(contractor)/profile') },
          { text: 'Cancel', onPress: () => router.back(), style: 'cancel' },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

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
      {Platform.OS !== 'web' ? (
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
      ) : (
        <View style={styles.webMapPlaceholder}>
          <Ionicons name="map-outline" size={64} color={colors.neutral[400]} />
          <Text style={styles.webMapText}>Map view is only available on mobile devices</Text>
          <Text style={styles.webMapSubtext}>
            Download the Expo Go app on your phone to view the interactive map
          </Text>
        </View>
      )}

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
  webMapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    gap: spacing.md,
  },
  webMapText: {
    ...typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[700],
    textAlign: 'center',
  },
  webMapSubtext: {
    ...typography.sizes.sm,
    color: colors.neutral[600],
    textAlign: 'center',
    maxWidth: 300,
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
