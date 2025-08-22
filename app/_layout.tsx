import { ClerkProvider } from "@clerk/clerk-expo";
import { Slot } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { Text, View } from "react-native";
import "../global.css";
import { CartProvider } from "./(context)/CartContext";

const tokenCache = {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

export default function RootLayout() {
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    // Return a fallback UI instead of throwing an error
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
          Configuration Required
        </Text>
        <Text style={{ textAlign: 'center', color: '#666' }}>
          Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env file to use authentication features.
        </Text>
      </View>
    );
  }

  return (
    <ClerkProvider
      tokenCache={tokenCache}
      publishableKey={publishableKey}
    >
      {/* 2. Wrap the Slot with the CartProvider */}
      <CartProvider>
        {/* The Slot will render the current page */}
        <Slot />
      </CartProvider>
    </ClerkProvider>
  );
}