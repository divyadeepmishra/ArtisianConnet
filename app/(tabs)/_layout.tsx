import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import Animated from 'react-native-reanimated';

const AnimatedIcon = Animated.createAnimatedComponent(Ionicons);

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF6B35',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: Platform.OS === 'ios' ? 88 : 70,
          paddingTop: Platform.OS === 'ios' ? 8 : 4,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingHorizontal: 16,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        tabBarBackground: () => (
          <Animated.View 
            className="absolute inset-0 bg-white/95 backdrop-blur-xl border-t border-orange-100"
            style={{
              shadowColor: '#FF6B35',
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.1,
              shadowRadius: 20,
              elevation: 15,
            }}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedIcon 
              name={focused ? 'home' : 'home-outline'} 
              size={size} 
              color={color}
              style={{
                transform: [{ scale: focused ? 1.2 : 1 }],
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="addProduct"
        options={{
          title: 'List Item',
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedIcon 
              name={focused ? 'add-circle' : 'add-circle-outline'} 
              size={size} 
              color={color}
              style={{
                transform: [{ scale: focused ? 1.2 : 1 }],
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedIcon 
              name={focused ? 'bag' : 'bag-outline'} 
              size={size} 
              color={color}
              style={{
                transform: [{ scale: focused ? 1.2 : 1 }],
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedIcon 
              name={focused ? 'person' : 'person-outline'} 
              size={size} 
              color={color}
              style={{
                transform: [{ scale: focused ? 1.2 : 1 }],
              }}
            />
          ),
        }}
      />
    </Tabs>
  );
}