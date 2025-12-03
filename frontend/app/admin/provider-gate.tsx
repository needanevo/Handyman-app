import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../src/constants/theme';
import { Button } from '../../src/components/Button';
import { api } from '../../src/services/api';

type ProviderGateMode = 'both' | 'licensed_only' | 'handyman_only' | 'contractors_disabled';

interface ProviderGateStatus {
  allowed_provider_types: ProviderGateMode;
  licensed_contractors_allowed: boolean;
  unlicensed_handymen_allowed: boolean;
  registrations_open: boolean;
}

interface GateOption {
  mode: ProviderGateMode;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const gateOptions: GateOption[] = [
  {
    mode: 'both',
    title: 'Both Allowed',
    description: 'Allow both licensed contractors and unlicensed handymen to register',
    icon: 'checkmark-done-circle',
    color: colors.success.main,
  },
  {
    mode: 'licensed_only',
    title: 'Licensed Only',
    description: 'Only allow licensed contractors (TECHNICIAN role)',
    icon: 'shield-checkmark',
    color: colors.brand.navy,
  },
  {
    mode: 'handyman_only',
    title: 'Handyman Only',
    description: 'Only allow unlicensed handymen (HANDYMAN role)',
    icon: 'hammer',
    color: colors.warning.main,
  },
  {
    mode: 'contractors_disabled',
    title: 'Registrations Disabled',
    description: 'Temporarily disable all new contractor registrations (maintenance mode)',
    icon: 'close-circle',
    color: colors.error.main,
  },
];

export default function AdminProviderGateScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<ProviderGateStatus | null>(null);
  const [selectedMode, setSelectedMode] = useState<ProviderGateMode>('both');

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await api.get('/admin/provider-gate/status');
      setStatus(response.data);
      setSelectedMode(response.data.allowed_provider_types);
    } catch (error) {
      console.error('Failed to fetch provider gate status:', error);
      // Mock default status
      const defaultStatus: ProviderGateStatus = {
        allowed_provider_types: 'both',
        licensed_contractors_allowed: true,
        unlicensed_handymen_allowed: true,
        registrations_open: true,
      };
      setStatus(defaultStatus);
      setSelectedMode('both');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/admin/provider-gate/update', {
        allowed_provider_types: selectedMode,
      });
      Alert.alert('Success', 'Provider gate settings updated successfully');
      await fetchStatus();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.brand.navy} />
        </View>
      </SafeAreaView>
    );
  }

  const currentOption = gateOptions.find((opt) => opt.mode === selectedMode);

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
            icon={<Ionicons name="arrow-back" size={24} color={colors.brand.navy} />}
          />
          <Text style={styles.title}>Provider Gate Control</Text>
          <Text style={styles.subtitle}>
            Control which types of contractors can register on the platform
          </Text>
        </View>

        {/* Current Status Banner */}
        {currentOption && (
          <View style={[styles.statusBanner, { backgroundColor: `${currentOption.color}20` }]}>
            <Ionicons name={currentOption.icon} size={32} color={currentOption.color} />
            <View style={styles.statusTextContainer}>
              <Text style={styles.statusTitle}>Current Mode:</Text>
              <Text style={[styles.statusMode, { color: currentOption.color }]}>
                {currentOption.title}
              </Text>
            </View>
          </View>
        )}

        {/* Status Indicators */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Status</Text>
          <View style={styles.indicatorsContainer}>
            <View style={styles.indicator}>
              <Ionicons
                name={status?.licensed_contractors_allowed ? 'checkmark-circle' : 'close-circle'}
                size={24}
                color={status?.licensed_contractors_allowed ? colors.success.main : colors.error.main}
              />
              <Text style={styles.indicatorText}>Licensed Contractors</Text>
            </View>
            <View style={styles.indicator}>
              <Ionicons
                name={status?.unlicensed_handymen_allowed ? 'checkmark-circle' : 'close-circle'}
                size={24}
                color={status?.unlicensed_handymen_allowed ? colors.success.main : colors.error.main}
              />
              <Text style={styles.indicatorText}>Unlicensed Handymen</Text>
            </View>
            <View style={styles.indicator}>
              <Ionicons
                name={status?.registrations_open ? 'checkmark-circle' : 'close-circle'}
                size={24}
                color={status?.registrations_open ? colors.success.main : colors.error.main}
              />
              <Text style={styles.indicatorText}>Registrations Open</Text>
            </View>
          </View>
        </View>

        {/* Gate Mode Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Mode</Text>
          <View style={styles.optionsContainer}>
            {gateOptions.map((option) => (
              <TouchableOpacity
                key={option.mode}
                style={[
                  styles.optionCard,
                  selectedMode === option.mode && styles.optionCardActive,
                  selectedMode === option.mode && { borderColor: option.color },
                ]}
                onPress={() => setSelectedMode(option.mode)}
                activeOpacity={0.7}
              >
                <View style={[styles.optionIcon, { backgroundColor: `${option.color}20` }]}>
                  <Ionicons name={option.icon} size={28} color={option.color} />
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
                {selectedMode === option.mode && (
                  <Ionicons name="checkmark-circle" size={24} color={option.color} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Warning */}
        <View style={styles.warningCard}>
          <Ionicons name="warning" size={24} color={colors.warning.main} />
          <Text style={styles.warningText}>
            Changes take effect immediately. Existing contractors are not affected, but new
            registrations will be restricted based on the selected mode.
          </Text>
        </View>

        {/* Save Button */}
        <Button
          title={saving ? 'Saving...' : 'Save Changes'}
          onPress={handleSave}
          isLoading={saving}
          disabled={saving || selectedMode === status?.allowed_provider_types}
          size="large"
          fullWidth
          style={{ marginTop: spacing.lg }}
          icon={<Ionicons name="save" size={20} color="#fff" />}
        />
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
    marginBottom: spacing.lg,
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
    lineHeight: 22,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitle: {
    ...typography.caption.regular,
    color: colors.neutral[600],
    marginBottom: spacing.xs,
  },
  statusMode: {
    ...typography.headings.h4,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.headings.h5,
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
  indicatorsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  indicator: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    gap: spacing.sm,
  },
  indicatorText: {
    ...typography.caption.small,
    color: colors.neutral[600],
    textAlign: 'center',
  },
  optionsContainer: {
    gap: spacing.md,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.neutral[200],
    gap: spacing.md,
  },
  optionCardActive: {
    borderWidth: 2,
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    ...typography.headings.h5,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  optionDescription: {
    ...typography.body.small,
    color: colors.neutral[600],
    lineHeight: 20,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: `${colors.warning.main}10`,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning.main,
    gap: spacing.md,
  },
  warningText: {
    flex: 1,
    ...typography.body.regular,
    color: colors.neutral[700],
    lineHeight: 22,
  },
});
