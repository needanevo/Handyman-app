import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="contractors/index" />
      <Stack.Screen name="customers/index" />
      <Stack.Screen name="jobs/index" />
    </Stack>
  );
}
