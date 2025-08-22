// in app/(tabs)/cart.tsx

import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '../(context)/CartContext';

export default function CartScreen() {
  const { items, incrementQuantity, decrementQuantity, totalPrice, clearCart } = useCart();
  const { getToken } = useAuth();
  const [isPaying, setIsPaying] = useState(false);
  const router = useRouter();

  const handleCheckout = async () => {
    setIsPaying(true);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("You are not logged in. Please log in to continue.");
      }

      const finalAmount = Math.round(totalPrice + 50);
      
      const response = await fetch(
        'https://ugsmjhaztnlhmdgpwvje.supabase.co/functions/v1/create-razorpay-order',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount: finalAmount,
            description: 'Payment for your order at ArtisanConnect',
          }),
        }
      );

      const orderData = await response.json();
      if (!response.ok || orderData.error) {
        throw new Error(orderData.error || 'Failed to create order.');
      }

      router.push({
        pathname: '/(main)/payment',
        params: { order: JSON.stringify(orderData) }
      });

    } catch (error) {
      Alert.alert('Error', `Could not create order: ${error.message}`);
      console.error("Checkout Error:", error);
    } finally {
      setIsPaying(false);
    }
  };

  const renderCartItem = ({ item }: { item: any }) => (
    <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100">
      <View className="flex-row items-center space-x-4">
        <Image 
          source={{ uri: item.image_url }} 
          className="w-16 h-16 rounded-xl"
        />
        <View className="flex-1 space-y-1">
          <Text className="text-base font-semibold text-gray-900" numberOfLines={2}>
            {item.name}
          </Text>
          <Text className="text-lg font-bold text-gray-900">
            ₹{item.price.toFixed(2)}
          </Text>
        </View>
        <View className="flex-row items-center space-x-3">
          <TouchableOpacity 
            onPress={() => decrementQuantity(item.id)}
            className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
          >
            <Ionicons name="remove" size={20} color="#6B7280" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900 min-w-[24px] text-center">
            {item.quantity}
          </Text>
          <TouchableOpacity 
            onPress={() => incrementQuantity(item.id)}
            className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center"
          >
            <Ionicons name="add" size={20} color="#3B82F6" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderEmptyCart = () => (
    <View className="flex-1 items-center justify-center py-20">
      <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-6">
        <Ionicons name="bag-outline" size={48} color="#9CA3AF" />
      </View>
      <Text className="text-xl font-bold text-gray-700 mb-2">Your Cart is Empty</Text>
      <Text className="text-gray-500 text-center">Add some beautiful handcrafted items to get started</Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-gray-900">Shopping Cart</Text>
          {items.length > 0 && (
            <TouchableOpacity 
              onPress={clearCart}
              className="flex-row items-center space-x-1"
            >
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
              <Text className="text-red-500 font-medium">Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Cart Items */}
      <FlatList
        data={items}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        ListEmptyComponent={renderEmptyCart}
        showsVerticalScrollIndicator={false}
      />

      {/* Summary */}
      {items.length > 0 && (
        <View className="bg-white border-t border-gray-200 p-6 space-y-4">
          <View className="space-y-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600">Subtotal</Text>
              <Text className="text-gray-900 font-semibold">₹{totalPrice.toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600">Shipping</Text>
              <Text className="text-gray-900 font-semibold">₹50.00</Text>
            </View>
            <View className="border-t border-gray-200 pt-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-lg font-bold text-gray-900">Total</Text>
                <Text className="text-lg font-bold text-gray-900">₹{(totalPrice + 50).toFixed(2)}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            className={`
              rounded-2xl py-4 items-center
              ${isPaying ? 'bg-gray-300' : 'bg-blue-600'}
            `}
            onPress={handleCheckout}
            disabled={isPaying}
          >
            {isPaying ? (
              <ActivityIndicator color="white" />
            ) : (
              <View className="flex-row items-center space-x-2">
                <Ionicons name="card-outline" size={20} color="white" />
                <Text className="text-white font-bold text-lg">Proceed to Checkout</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}