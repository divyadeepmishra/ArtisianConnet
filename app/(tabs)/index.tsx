// in app/(tabs)/index.tsx

import { Text, View, SafeAreaView, TouchableOpacity } from 'react-native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const { user } = useUser();
  const { isLoaded, signOut } = useAuth();
  const router = useRouter();

  if (!isLoaded) {
    return null;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/login');
    } catch (e) {
      console.error("Error during sign out:", e);
    }
  };

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-white">
      <View className="items-center px-4">
        <Text className="text-2xl font-bold">Welcome, ArtisanConnect User!</Text>
        <Text className="text-base text-gray-600 mt-2 text-center">
          You are signed in as: {user?.primaryEmailAddress?.emailAddress}
        </Text>

        <TouchableOpacity
          onPress={handleSignOut}
          className="mt-8 bg-black p-4 rounded-lg"
        >
          <Text className="text-white font-bold">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}