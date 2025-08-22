// app/components/ProductCard.tsx

import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, Image, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useCart } from '../app/(context)/CartContext';

type Product = {
  id: number;
  name: string;
  price: number;
  image_url: string;
  seller_id: string;
  original_price?: number;
  category?: string;
};

type ProductCardProps = {
  product: Product;
  isLiked?: boolean;
  onToggleLike?: (productId: number, isCurrentlyLiked: boolean) => void;
  showAdminControls?: boolean;
  onDelete?: () => void;
};

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function ProductCard({
  product,
  isLiked,
  onToggleLike,
  showAdminControls = false,
  onDelete
}: ProductCardProps) {
  const scale = useSharedValue(1);
  const { addToCart, removeFromCart, items } = useCart();
  const { userId, getToken } = useAuth();
  const router = useRouter();

  const isProductInCart = items.some(item => item.id === product.id);
  const isMyProduct = product.seller_id === userId;
  const hasDiscount = product.original_price && product.original_price > product.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.original_price! - product.price) / product.original_price!) * 100)
    : 0;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const handleLikePress = () => {
    if (onToggleLike && typeof isLiked !== 'undefined') {
      scale.value = withSpring(1.4, { damping: 10, stiffness: 400 });
      setTimeout(() => { scale.value = withSpring(1); }, 150);
      onToggleLike(product.id, isLiked);
    }
  };

  const handleContactSeller = async () => {
    try {
      const token = await getToken();
      if (!token) throw new Error('Authentication failed');

      const response = await fetch(
        'https://ugsmjhaztnlhmdgpwvje.supabase.co/functions/v1/get-or-create-chat',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ seller_id: product.seller_id })
        }
      );

      const result = await response.json();
      if (result.error) throw new Error(result.error);

      router.push({
        pathname: '/(main)/chat-room',
        params: { chatId: result.chatId }
      });
    } catch (error: any) {
      Alert.alert('Error', `Could not start chat: ${error.message}`);
    }
  };

  return (
    <View className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Image Container */}
      <View className="relative">
        <Image
          source={{ uri: product.image_url }}
          className="w-full aspect-square"
          resizeMode="cover"
        />
        
        {/* Like Button */}
        {!showAdminControls && (
          <AnimatedTouchableOpacity
            className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full items-center justify-center"
            onPress={handleLikePress}
            style={animatedStyle}
          >
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={18}
              color={isLiked ? '#EF4444' : '#6B7280'}
            />
          </AnimatedTouchableOpacity>
        )}

        {/* Discount Badge */}
        {hasDiscount && (
          <View className="absolute top-3 left-3 bg-red-500 px-2 py-1 rounded-lg">
            <Text className="text-white text-xs font-bold">{discountPercentage}% Off</Text>
          </View>
        )}

        {/* Category Badge */}
        {product.category && (
          <View className="absolute bottom-3 left-3 bg-black/70 px-2 py-1 rounded-lg">
            <Text className="text-white text-xs font-medium capitalize">{product.category}</Text>
          </View>
        )}
      </View>

      {/* Product Info */}
      <View className="p-3 space-y-2">
        {/* Price */}
        <View className="flex-row items-center space-x-2">
          <Text className="text-lg font-bold text-gray-900">₹{product.price.toFixed(2)}</Text>
          {hasDiscount && (
            <Text className="text-sm text-gray-500 line-through">₹{product.original_price!.toFixed(2)}</Text>
          )}
        </View>

        {/* Product Name */}
        <Text className="text-sm font-medium text-gray-700 leading-tight" numberOfLines={2}>
          {product.name}
        </Text>

        {/* Actions */}
        {showAdminControls ? (
          <TouchableOpacity 
            className="bg-red-50 border border-red-200 rounded-lg py-2 flex-row items-center justify-center space-x-2"
            onPress={onDelete}
          >
            <Ionicons name="trash-outline" size={16} color="#EF4444" />
            <Text className="text-red-600 font-medium text-sm">Unlist Product</Text>
          </TouchableOpacity>
        ) : isMyProduct ? (
          <View className="bg-green-50 border border-green-200 rounded-lg py-2 flex-row items-center justify-center space-x-2">
            <Ionicons name="person-circle-outline" size={16} color="#10B981" />
            <Text className="text-green-700 font-medium text-sm">Your Listing</Text>
          </View>
        ) : (
          <View className="space-y-2">
            <TouchableOpacity
              className={`
                rounded-lg py-2 flex-row items-center justify-center space-x-2
                ${isProductInCart 
                  ? 'bg-gray-100 border border-gray-200' 
                  : 'bg-blue-600'
                }
              `}
              onPress={() =>
                isProductInCart ? removeFromCart(product.id) : addToCart(product)
              }
            >
              <Ionicons
                name={isProductInCart ? 'remove-circle-outline' : 'bag-outline'}
                size={16}
                color={isProductInCart ? '#EF4444' : 'white'}
              />
              <Text className={`
                font-medium text-sm
                ${isProductInCart ? 'text-red-600' : 'text-white'}
              `}>
                {isProductInCart ? 'Remove' : 'Add'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-gray-100 border border-gray-200 rounded-lg py-2 flex-row items-center justify-center space-x-2"
              onPress={handleContactSeller}
            >
              <Ionicons name="chatbubble-outline" size={16} color="#6B7280" />
              <Text className="text-gray-700 font-medium text-sm">Contact</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}
