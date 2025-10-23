// Run this in Expo's debug console or add to your app temporarily
import * as SecureStore from 'expo-secure-store';

async function clearStorage() {
  await SecureStore.deleteItemAsync('accessToken');
  await SecureStore.deleteItemAsync('refreshToken');
  console.log('Storage cleared!');
}

clearStorage();
