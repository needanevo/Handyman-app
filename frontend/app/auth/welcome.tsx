import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '../../src/components/Button';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  const features = [
    {
      icon: 'construct-outline' as const,
      title: 'Professional Service',
      description: 'Quality handyman work done right the first time',
    },
    {
      icon: 'time-outline' as const,
      title: 'Quick Estimates',
      description: 'Get AI-powered quotes in minutes, not days',
    },
    {
      icon: 'card-outline' as const,
      title: 'Easy Payments',
      description: 'Secure payment processing with receipts',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image 
              source={{ uri: 'https://customer-assets.emergentagent.com/job_fixitright-2/artifacts/l18wndlz_handyman.png' }}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>The Real Johnson</Text>
          <Text style={styles.subtitle}>Handyman Services</Text>
          <Text style={styles.tagline}>"Small fixes. Done right. First time."</Text>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <View key={index} style={styles.feature}>
              <View style={styles.featureIcon}>
                <Ionicons name={feature.icon} size={24} color="#FF6B35" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Get Started"
            onPress={() => router.push('/auth/role-selection')}
            size="large"
            fullWidth
          />

          <Button
            title="Register as a Contractor"
            onPress={() => router.push('/auth/contractor/onboarding-intro')}
            variant="secondary"
            size="large"
            fullWidth
            style={{ marginTop: 16 }}
          />

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <Button
              title="Sign In"
              onPress={() => router.push('/auth/login')}
              variant="outline"
              size="small"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 40,
  },
  logoContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  logoImage: {
    width: 120,
    height: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#FF6B35',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  featuresContainer: {
    paddingVertical: 32,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF4F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
  },
  actions: {
    paddingTop: 32,
    paddingBottom: 24,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  loginText: {
    fontSize: 16,
    color: '#7F8C8D',
    marginRight: 8,
  },
});
