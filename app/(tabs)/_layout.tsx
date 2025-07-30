import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // Import the icon library

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Hides the header at the top of the screen
      }}
    >
      {/* Home Tab */}
      <Tabs.Screen
        name="index" // This links to your index.tsx file
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Profile Tab */}
      <Tabs.Screen
        name="profile" // This links to your new profile.tsx file
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}