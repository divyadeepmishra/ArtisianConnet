import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingTop: 8,
          paddingBottom: 8,
          height: 88,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? 'home' : 'home-outline'} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="addProduct"
        options={{
          title: 'List Item',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? 'add-circle' : 'add-circle-outline'} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? 'bag' : 'bag-outline'} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? 'person' : 'person-outline'} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}