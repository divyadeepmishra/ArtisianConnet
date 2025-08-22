import {LinearGradient} from 'expo-linear-gradient';
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HeroSection() {
  return (
    <View className="relative rounded-2xl overflow-hidden">
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop' }}
        className="w-full h-48" 
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
          style={StyleSheet.absoluteFillObject} // ✅ FIXED
        />
        <View className="flex-1 justify-center p-6">
          <Text className="text-white text-2xl font-bold mb-2">
            Check Out New Collections
          </Text>
          <Text className="text-white text-base mb-4 opacity-90">
            50% Discount for any first transaction
          </Text>
          <TouchableOpacity className="bg-white rounded-lg px-6 py-3 self-start">
            <Text className="text-gray-900 font-semibold">Shop Now</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}
