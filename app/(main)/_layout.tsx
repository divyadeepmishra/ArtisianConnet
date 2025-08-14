// in app/(main)/_layout.tsx

import { Stack } from 'expo-router';

export default function MainLayout() {
  return (
    <Stack 
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right', // This provides the iOS-style animation
      }}
    >
      <Stack.Screen name="orders" />
      <Stack.Screen name="order-detail" />
      <Stack.Screen name="wishlist" />
      <Stack.Screen name="ai" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="help" />
      <Stack.Screen name="payment" options={{ presentation: 'modal' }} />
      <Stack.Screen name="contact" />
    </Stack>
  );
}