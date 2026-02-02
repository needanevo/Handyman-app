import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../../src/constants/theme';
import { Button } from '../../../src/components/Button';
import { StepIndicator } from '../../../src/components/StepIndicator';

const { width } = Dimensions.get('window');

const serviceCategories = [
  {
    id: 'drywall',
    title: 'Drywall',
    icon: 'hammer-outline',
    color: '#FF6B35',
    description: 'Patches, repairs, texturing, installation',
  },
  {
    id: 'painting',
    title: 'Painting',
    icon: 'brush-outline',
    color: '#4ECDC4',
    description: 'Interior, exterior, touch-ups, cabinets',
  },
  {
    id: 'electrical',
    title: 'Electrical',
    icon: 'flash-outline',
    color: '#45B7D1',
    description: 'Outlets, switches, fixtures, ceiling fans',
  },
  {
    id: 'plumbing',
    title: 'Plumbing',
    icon: 'water-outline',
    color: '#96CEB4',
    description: 'Faucets, toilets, sinks, leaks',
  },
  {
    id: 'carpentry',
    title: 'Carpentry',
    icon: 'construct-outline',
    color: '#FECA57',
    description: 'Doors, trim, shelving, framing',
  },
  {
    id: 'hvac',
    title: 'HVAC',
    icon: 'thermometer-outline',
    color: '#E67E22',
    description: 'Thermostats, filters, vents, maintenance',
  },
  {
    id: 'flooring',
    title: 'Flooring',
    icon: 'grid-outline',
    color: '#8E44AD',
    description: 'Hardwood, tile, laminate, carpet',
  },
  {
    id: 'roofing',
    title: 'Roofing',
    icon: 'home-outline',
    color: '#16A085',
    description: 'Shingles, gutters, leaks, skylights',
  },
  {
    id: 'landscaping',
    title: 'Landscaping',
    icon: 'leaf-outline',
    color: '#27AE60',
    description: 'Fences, decks, patios, outdoor work',
  },
  {
    id: 'appliance',
    title: 'Appliance',
    icon: 'cube-outline',
    color: '#C0392B',
    description: 'Installation, repair, hookups',
  },
  {
    id: 'windows',
    title: 'Windows & Doors',
    icon: 'square-outline',
    color: '#2980B9',
    description: 'Installation, screens, weather sealing',
  },
  {
    id: 'other',
    title: 'Other',
    icon: 'build-outline',
    color: '#A29BFE',
    description: 'TV mounts, furniture assembly, odd jobs',
  },
];

export default function JobRequestStep1() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('');

  const handleContinue = () => {
    if (!selectedCategory) {
      alert('Please select a service category');
      return;
    }

    const selectedService = serviceCategories.find(cat => cat.id === selectedCategory);

    router.push({
      pathname: '/(customer)/job-request/step2-photos',
      params: {
        ...params,
        category: selectedCategory,
        categoryTitle: selectedService?.title,
      },
    });
  };

  const steps = [
    { label: 'Address', completed: true },
    { label: 'Service', completed: false },
    { label: 'Photos', completed: false },
    { label: 'Details', completed: false },
    { label: 'Budget', completed: false },
    { label: 'Review', completed: false },
  ];

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
        </View>

        {/* Progress */}
        <StepIndicator steps={steps} currentStep={1} />

        {/* Title */}
        <View style={styles.titleSection}>
          <View style={[styles.iconCircle, { backgroundColor: colors.primary.lightest }]}>
            <Ionicons name="list" size={32} color={colors.primary.main} />
          </View>
          <Text style={styles.title}>What service do you need?</Text>
          <Text style={styles.subtitle}>
            Select the type of work that best describes your project
          </Text>
        </View>

        {/* Address Display */}
        <View style={styles.addressCard}>
          <Ionicons name="location" size={20} color={colors.primary.main} />
          <Text style={styles.addressText} numberOfLines={1}>
            {params.fullAddress as string}
          </Text>
        </View>

        {/* Service Categories Grid */}
        <View style={styles.servicesGrid}>
          {serviceCategories.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={[
                styles.serviceCard,
                selectedCategory === service.id && styles.serviceCardSelected,
              ]}
              onPress={() => setSelectedCategory(service.id)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.serviceIcon,
                  { backgroundColor: `${service.color}20` },
                  selectedCategory === service.id && {
                    backgroundColor: service.color,
                  },
                ]}
              >
                <Ionicons
                  name={service.icon as any}
                  size={28}
                  color={selectedCategory === service.id ? '#FFF' : service.color}
                />
              </View>
              <Text
                style={[
                  styles.serviceTitle,
                  selectedCategory === service.id && styles.serviceTitleSelected,
                ]}
              >
                {service.title}
              </Text>
              <Text style={styles.serviceDescription}>{service.description}</Text>
              {selectedCategory === service.id && (
                <View style={styles.selectedBadge}>
                  <Ionicons name="checkmark-circle" size={24} color={colors.primary.main} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Continue"
            onPress={handleContinue}
            size="large"
            fullWidth
            disabled={!selectedCategory}
          />
          <Button
            title="Back"
            onPress={() => router.back()}
            variant="outline"
            size="medium"
            fullWidth
          />
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
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['2xl'],
  },
  header: {
    paddingTop: spacing.sm,
    marginBottom: spacing.md,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.sizes.base,
    color: colors.neutral[600],
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.base,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.lightest,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  addressText: {
    ...typography.sizes.sm,
    color: colors.neutral[700],
    flex: 1,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.base,
    marginBottom: spacing.xl,
  },
  serviceCard: {
    width: (width - spacing.xl * 2 - spacing.base) / 2,
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.neutral[200],
    alignItems: 'center',
    position: 'relative',
    ...shadows.sm,
  },
  serviceCardSelected: {
    borderColor: colors.primary.main,
    backgroundColor: colors.primary.lightest,
    ...shadows.md,
  },
  serviceIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  serviceTitle: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  serviceTitleSelected: {
    color: colors.primary.main,
  },
  serviceDescription: {
    ...typography.sizes.xs,
    color: colors.neutral[600],
    textAlign: 'center',
    lineHeight: 16,
  },
  selectedBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
  actions: {
    gap: spacing.md,
  },
});
