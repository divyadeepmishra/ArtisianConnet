import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { Link, LinkProps } from 'expo-router';
import React from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ProfileMenuItemProps = {
  href: LinkProps['href'];
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  subtitle: string;
  color: string;
};

const ProfileMenuItem: React.FC<ProfileMenuItemProps> = ({ href, icon, title, subtitle, color }) => (
  <Link href={href} asChild>
    <TouchableOpacity className="flex-row items-center py-4 px-4 border-b border-gray-100 last:border-b-0">
      <View className={`w-10 h-10 rounded-xl items-center justify-center mr-4 ${color}`}>
        <Ionicons name={icon} size={20} color="#374151" />
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-gray-900">{title}</Text>
        <Text className="text-sm text-gray-500 mt-1">{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  </Link>
);

export default function ProfileScreen() {
  const { user } = useUser();
  const { signOut } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-white border-b border-gray-200 px-4 py-4">
          <Text className="text-2xl font-bold text-gray-900">Account</Text>
        </View>

        <View className="p-4 space-y-6">
          {/* User Header Section */}
          <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <View className="flex-row items-center space-x-4">
              <Image 
                source={{ uri: user?.imageUrl }} 
                className="w-16 h-16 rounded-full bg-gray-200"
              />
              <View className="flex-1">
                <Text className="text-xl font-bold text-gray-900">
                  Hello, {user?.firstName || 'User'}
                </Text>
                <Text className="text-gray-500 mt-1">
                  {user?.primaryEmailAddress?.emailAddress}
                </Text>
              </View>
            </View>
          </View>

          {/* Menu Section */}
          <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <ProfileMenuItem
              href="/orders"
              icon="cube-outline"
              title="My Orders"
              subtitle="Check your order history"
              color="bg-indigo-100"
            />
            <ProfileMenuItem
              href="/wishlist"
              icon="heart-outline"
              title="My Wishlist"
              subtitle="View your liked items"
              color="bg-red-100"
            />
            <ProfileMenuItem
              href="/(main)/my-product"
              icon="storefront-outline"
              title="My Products"
              subtitle="Manage your product listings"
              color="bg-purple-100"
            />
            <ProfileMenuItem
              href="/help"
              icon="headset-outline"
              title="Help Center"
              subtitle="Get support and assistance"
              color="bg-green-100"
            />
            <ProfileMenuItem
              href="/ai"
              icon="sparkles-outline"
              title="GenAI Playground"
              subtitle="Get creative with AI"
              color="bg-yellow-100"
            />
            <ProfileMenuItem
              href="/(main)/contact"
              icon="mail-outline"
              title="Contact Us"
              subtitle="Send us your feedback or queries"
              color="bg-blue-100"
            />
          </View>

          {/* Sign Out Button */}
          <TouchableOpacity 
            onPress={() => signOut()} 
            className="bg-white border border-red-200 rounded-2xl p-4 flex-row items-center justify-center space-x-2"
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text className="text-red-600 font-semibold text-base">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}