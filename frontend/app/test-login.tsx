import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../src/contexts/AuthContext';

export default function TestLoginScreen() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleTestLogin = async () => {
    console.log('TEST LOGIN BUTTON CLICKED!');
    Alert.alert('Test', 'Button clicked successfully!');
    
    try {
      setIsLoading(true);
      console.log('About to call login...');
      await login('demo@therealjohnson.com', 'demo123');
      console.log('Login completed successfully');
      Alert.alert('Success', 'Login worked!');
    } catch (error) {
      console.error('Login failed:', error);
      Alert.alert('Error', 'Login failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Login Test Page</Text>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => {
          console.log('Simple button test clicked');
          Alert.alert('Test', 'Simple button works');
        }}
      >
        <Text style={styles.buttonText}>Simple Test</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, styles.loginButton]} 
        onPress={handleTestLogin}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Logging in...' : 'Test Login'}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#FF6B35',
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
  },
  loginButton: {
    backgroundColor: '#2ECC71',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});