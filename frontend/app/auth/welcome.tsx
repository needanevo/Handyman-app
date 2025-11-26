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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Logo & Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/images/logos/color/Handyman_logo_color.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>The Real Johnson</Text>
          <Text style={styles.subtitle}>Handyman Services</Text>
        </View>

        {/* Main Action Buttons */}
        <View style={styles.actions}>
          <Button
            title="I need a handyman"
            onPress={() => router.push('/auth/register?role=customer')}
            size="large"
            fullWidth
            icon={<Ionicons name="home" size={24} color="#fff" />}
          />

          <Button
            title="I am a handyman or a licensed contractor"
            onPress={() => router.push('/auth/provider-type')}
            variant="secondary"
            size="large"
            fullWidth
            style={{ marginTop: 16 }}
            icon={<Ionicons name="construct" size={24} color="#FF6B35" />}
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
    paddingTop: 60,
    paddingBottom: 80,
  },
  logoContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  logoImage: {
    width: 140,
    height: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  actions: {
    paddingTop: 0,
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
