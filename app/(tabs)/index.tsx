// // in app/(tabs)/index.tsx

// import { Text, View, SafeAreaView, TouchableOpacity } from 'react-native';
// import { useAuth, useUser } from '@clerk/clerk-expo';
// import { useRouter } from 'expo-router';

// export default function HomeScreen() {
//   const { user } = useUser();
//   const { isLoaded, signOut } = useAuth();
//   const router = useRouter();

//   if (!isLoaded) {
//     return null;
//   }

//   const handleSignOut = async () => {
//     try {
//       await signOut();
//       router.replace('/login');
//     } catch (e) {
//       console.error("Error during sign out:", e);
//     }
//   };

//   return (
//     <SafeAreaView className="flex-1 items-center justify-center bg-white">
//       <View className="items-center px-4">
//         <Text className="text-2xl font-bold">Welcome, ArtisanConnect User!</Text>
//         <Text className="text-base text-gray-600 mt-2 text-center">
//           You are signed in as: {user?.primaryEmailAddress?.emailAddress}
//         </Text>

//         <TouchableOpacity
//           onPress={handleSignOut}
//           className="mt-8 bg-black p-4 rounded-lg"
//         >
//           <Text className="text-white font-bold">Sign Out</Text>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// }


// in app/(tabs)/index.tsx

import { Text, View, SafeAreaView, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-white p-4">
      <Text className="text-2xl font-bold mb-8">Development Hub</Text>
      
      <Text className="text-base text-gray-600 mb-4">
        Use the links below to navigate to the page you are working on.
      </Text>

      {/* Add links to new pages here as you create them */}
      <Link href="/profile" asChild>
        <TouchableOpacity className="mt-4 bg-gray-200 p-3 rounded-lg w-full items-center">
            <Text>Go to Profile Screen</Text>
        </TouchableOpacity>
      </Link>

      {/* Example for a future page */}
      {/* <Link href="/settings" asChild>
        <TouchableOpacity className="mt-4 bg-gray-200 p-3 rounded-lg w-full items-center">
            <Text>Go to Settings</Text>
        </TouchableOpacity>
      </Link> */}
    </SafeAreaView>
  );
}