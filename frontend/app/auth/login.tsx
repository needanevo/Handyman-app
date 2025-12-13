import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const { login, isAuthenticated, isLoading: authLoading, user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('User authenticated, role:', user.role);

      // Check for redirect parameter first
      const redirectPath = params.redirect as string;
      if (redirectPath) {
        console.log('Redirecting to requested path:', redirectPath);
        router.replace(redirectPath as any);
        return;
      }

      // Role-based routing - explicit routing for each role
      if (user.role === 'contractor') {
        console.log('Contractor detected, redirecting to contractor dashboard...');
        router.replace('/(contractor)/dashboard');
      } else if (user.role === 'handyman') {
        console.log('Handyman detected, redirecting to handyman dashboard...');
        router.replace('/(handyman)/dashboard');
      } else if (user.role === 'customer') {
        console.log('Customer detected, redirecting to customer dashboard...');
        router.replace('/(customer)/dashboard');
      } else if (user.role === 'admin') {
        console.log('Admin detected, redirecting to admin dashboard...');
        router.replace('/admin');
      } else {
        console.log('Unknown role, redirecting to welcome...');
        router.replace('/auth/welcome');
      }
    }
  }, [isAuthenticated, user, params.redirect]);

  // Cross-platform alert helper
  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      // Use browser alert for web
      window.alert(`${title}\n\n${message}`);
    } else {
      // Use React Native Alert for mobile
      Alert.alert(title, message, [{ text: 'OK', style: 'cancel' }]);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showAlert('Error', 'Please enter email and password');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Attempting login with:', email);
      await login(email, password);
      console.log('Login successful!');
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle 401 Unauthorized specifically
      if (error.response?.status === 401) {
        showAlert(
          'Login Failed',
          'Invalid email or password. Please check your credentials and try again.'
        );
      } else if (error.message?.includes('Network Error') || error.message?.includes('Failed to fetch')) {
        showAlert(
          'Connection Error',
          'Unable to connect to the server. Please check your internet connection and try again.'
        );
      } else {
        showAlert(
          'Login Failed',
          error.response?.data?.detail || error.message || 'An unexpected error occurred. Please try again.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#FF6B35" />
            </TouchableOpacity>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                onChangeText={setEmail}
                value={email}
                placeholder="your@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                editable={!isLoading && !authLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                onChangeText={setPassword}
                value={password}
                placeholder="••••••••"
                secureTextEntry
                editable={!isLoading && !authLoading}
                autoComplete="password"
                textContentType="password"
              />
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.loginButton, (isLoading || authLoading) && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading || authLoading}
            >
              <Text style={styles.loginButtonText}>
                {isLoading || authLoading ? 'Signing In...' : 'Sign In'}
              </Text>
            </TouchableOpacity>
            
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/auth/role-selection')}>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    paddingBottom: 32,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: 4,
  },
  form: {
    paddingBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  actions: {
    paddingBottom: 24,
  },
  loginButton: {
    backgroundColor: '#FF6B35',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  signupLink: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: '600',
  },
});
