/**
 * Add Mileage Screen
 *
 * Form to log mileage for tax deduction
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../../src/constants/theme';
import { Button } from '../../../src/components/Button';

export default function AddMileageScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const jobId = params.jobId as string;

  const [miles, setMiles] = useState('');
  const [purpose, setPurpose] = useState('');
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');

  const handleSubmit = () => {
    if (!miles || !purpose) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // TODO: Implement mileage submission API call
    Alert.alert('Success', 'Mileage tracking will be implemented');
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
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
            <Text style={styles.title}>Log Mileage</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.label}>Miles Driven *</Text>
            <TextInput
              style={styles.input}
              value={miles}
              onChangeText={setMiles}
              placeholder="0.0"
              keyboardType="decimal-pad"
            />

            <Text style={styles.label}>Purpose *</Text>
            <TextInput
              style={styles.input}
              value={purpose}
              onChangeText={setPurpose}
              placeholder="Job site visit, supply pickup, etc."
            />

            <Text style={styles.label}>Start Location</Text>
            <TextInput
              style={styles.input}
              value={startLocation}
              onChangeText={setStartLocation}
              placeholder="Starting address"
            />

            <Text style={styles.label}>End Location</Text>
            <TextInput
              style={styles.input}
              value={endLocation}
              onChangeText={setEndLocation}
              placeholder="Destination address"
            />

            <Button
              title="Save Mileage"
              onPress={handleSubmit}
              size="large"
              fullWidth
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['2xl'],
  },
  header: {
    paddingTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    marginTop: spacing.base,
  },
  form: {
    gap: spacing.base,
  },
  label: {
    ...typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  input: {
    ...typography.sizes.base,
    color: colors.neutral[900],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    marginBottom: spacing.base,
  },
});
