import { Text, View, TouchableOpacity } from 'react-native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function ProfileScreen() {
  const { user } = useUser();
  const { signOut, isSignedIn } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top', 'left', 'right']}>
       <Text className="text-3xl font-extrabold text-gray-900 mx-1 p-5">Account</Text>
      <View className="flex-1 items-center justify-center p-6">
        {isSignedIn ? (
          // Show this if the user is logged in
          <View className="items-center">
            <Text className="text-2xl font-bold">Welcome, {user?.firstName}</Text>
            <Text className="text-base text-gray-600 mt-2">
              {user?.primaryEmailAddress?.emailAddress}
            </Text>
            <TouchableOpacity
              onPress={() => signOut()}
              className="mt-8 bg-black p-4 rounded-lg w-64 items-center"
            >
              <Text className="text-white font-bold">Sign Out</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Show this if the user is not logged in
          <View className="items-center">
            <Text className="text-2xl font-bold text-center mb-4">Log in to manage your profile</Text>
            <Link href="/login" asChild>
              <TouchableOpacity className="bg-blue-500 p-4 rounded-lg w-64 items-center">
                <Text className="text-white font-bold">Login or Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}