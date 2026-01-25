// Polyfill for crypto.getRandomValues using expo-crypto - MUST be first
import * as Crypto from 'expo-crypto';

// Polyfill global crypto for uuid library used by react-native-google-places-autocomplete
if (typeof global.crypto !== 'object') {
  (global as any).crypto = {};
}
if (typeof global.crypto.getRandomValues !== 'function') {
  (global as any).crypto.getRandomValues = (array: Uint8Array) => {
    return Crypto.getRandomBytes(array.length);
  };
}

import React from 'react';
import { Slot } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../src/contexts/AuthContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <StatusBar style="auto" />
            <Slot />
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
