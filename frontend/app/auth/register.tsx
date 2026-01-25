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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { Button } from '../../src/components/Button';
import { Ionicons } from '@expo/vector-icons';
import { GooglePlacesAddressInput, StructuredAddress } from '../../src/components/GooglePlacesAddressInput';
import { useForm, Controller } from 'react-hook-form';

interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
};

export default function RegisterScreen() {
  const { register, isHydrated, isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<StructuredAddress | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterForm>();

  const password = watch('password');

  // Fix 5.11: Explicit redirect after registration hydration
  useEffect(() => {
    if (!registrationSuccess) return;
    if (!isHydrated) {
      console.log('Registration successful - waiting for hydration...');
      return;
    }
    if (!isAuthenticated || !user || !user.role) {
      console.log('Registration successful - waiting for user auth...');
      return;
    }

    console.log('Registration hydrated - redirecting to dashboard for role:', user.role);

    // Explicit role-based redirect
    if (user.role === 'customer') {
      router.replace('/(customer)/dashboard');
    } else if (user.role === 'contractor') {
      router.replace('/(contractor)/dashboard');
    } else if (user.role === 'handyman') {
      router.replace('/(handyman)/dashboard');
    } else if (user.role === 'admin') {
      router.replace('/admin');
    } else {
      // Unknown role - go to welcome
      router.replace('/auth/welcome');
    }
  }, [registrationSuccess, isHydrated, isAuthenticated, user, router]);

  const onSubmit = async (data: RegisterForm) => {
    if (data.password !== data.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (!selectedAddress || !selectedAddress.street) {
      Alert.alert('Error', 'Please enter and select your service address');
      return;
    }

    try {
      setIsLoading(true);
      await register({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: 'customer',
        address: {
          street: selectedAddress.street,
          city: selectedAddress.city,
          state: selectedAddress.state,
          zipCode: selectedAddress.zipCode,
          unitNumber: selectedAddress.line2,
        },
      });

      // Fix 5.11: Signal registration success, useEffect will handle redirect
      console.log('Registration API call successful - waiting for hydration');
      setRegistrationSuccess(true);
    } catch (error: any) {
      console.error('Registration error details:', error);
      
      let errorMessage = 'Please try again';
      
      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          // Handle Pydantic validation errors
          errorMessage = error.response.data.detail.map((err: any) => err.msg).join(', ');
        } else {
          errorMessage = error.response.data.detail;
        }
      }
      
      Alert.alert('Registration Failed', errorMessage);
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
          {/* Header */}
          <View style={styles.header}>
            <Button
              title=""
              onPress={() => router.back()}
              variant="outline"
              size="small"
              icon={<Ionicons name="arrow-back" size={20} color="#FF6B35" />}
            />
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join The Real Johnson Services</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>First Name</Text>
                <Controller
                  control={control}
                  name="firstName"
                  rules={{ required: 'First name is required' }}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={[styles.input, errors.firstName && styles.inputError]}
                      onChangeText={onChange}
                      value={value}
                      placeholder="John"
                      autoCapitalize="words"
                      autoComplete="name-given"
                      textContentType="givenName"
                    />
                  )}
                />
                {errors.firstName && (
                  <Text style={styles.errorText}>{errors.firstName.message}</Text>
                )}
              </View>
              
              <View style={styles.halfInput}>
                <Text style={styles.label}>Last Name</Text>
                <Controller
                  control={control}
                  name="lastName"
                  rules={{ required: 'Last name is required' }}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={[styles.input, errors.lastName && styles.inputError]}
                      onChangeText={onChange}
                      value={value}
                      placeholder="Doe"
                      autoCapitalize="words"
                      autoComplete="name-family"
                      textContentType="familyName"
                    />
                  )}
                />
                {errors.lastName && (
                  <Text style={styles.errorText}>{errors.lastName.message}</Text>
                )}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <Controller
                control={control}
                name="email"
                rules={{
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.input, errors.email && styles.inputError]}
                    onChangeText={onChange}
                    value={value}
                    placeholder="john@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                )}
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email.message}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone</Text>
              <Controller
                control={control}
                name="phone"
                rules={{ required: 'Phone number is required' }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.phone && styles.inputError]}
                    placeholder="(410) 555-1234"
                    keyboardType="phone-pad"
                    value={formatPhone(value || "")}
                    onChangeText={(text) => onChange(formatPhone(text))}
                    onBlur={onBlur}
                    autoComplete="tel"
                    textContentType="telephoneNumber"
                  />
                )}
              />
              {errors.phone && (
                <Text style={styles.errorText}>{errors.phone.message}</Text>
              )}
            </View>

            {/* Address Fields */}
            <View style={styles.addressSection}>
              <Text style={styles.sectionTitle}>Service Address</Text>
              <GooglePlacesAddressInput
                label=""
                required
                onAddressSelected={setSelectedAddress}
                placeholder="Start typing your address..."
                zipFirst={true}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <Controller
                control={control}
                name="password"
                rules={{
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.input, errors.password && styles.inputError]}
                    onChangeText={onChange}
                    value={value}
                    placeholder="••••••••"
                    secureTextEntry
                  />
                )}
              />
              {errors.password && (
                <Text style={styles.errorText}>{errors.password.message}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <Controller
                control={control}
                name="confirmPassword"
                rules={{
                  required: 'Please confirm your password',
                  validate: (value) =>
                    value === password || 'Passwords do not match',
                }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.input, errors.confirmPassword && styles.inputError]}
                    onChangeText={onChange}
                    value={value}
                    placeholder="••••••••"
                    secureTextEntry
                  />
                )}
              />
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>
              )}
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              title="Create Account"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              fullWidth
              size="large"
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
  },
  header: {
    paddingTop: 16,
    paddingBottom: 32,
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
    paddingBottom: 32,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
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
  inputError: {
    borderColor: '#E74C3C',
  },
  errorText: {
    fontSize: 14,
    color: '#E74C3C',
    marginTop: 4,
  },
  actions: {
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
  addressSection: {
    marginVertical: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
});
