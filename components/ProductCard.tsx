// app/components/ProductCard.tsx

import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, Image, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring
} from 'react-native-reanimated';
import { useCart } from '../app/(context)/CartContext';

type Product = {
  id: number;
  name: string;
  price: number;
  image_url: string;
  seller_id: string;
  original_price?: number;
  category?: string;
  rating?: number;
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
  const likeScale = useSharedValue(1);
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

  const likeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: likeScale.value }]
  }));

  const handleLikePress = () => {
    if (onToggleLike && typeof isLiked !== 'undefined') {
      likeScale.value = withSequence(
        withSpring(1.3, { damping: 8, stiffness: 400 }),
        withSpring(1, { damping: 12, stiffness: 400 })
      );
      onToggleLike(product.id, isLiked);
    }
  };

  const handleAddToCart = () => {
    scale.value = withSequence(
      withSpring(0.95, { damping: 8, stiffness: 400 }),
      withSpring(1, { damping: 12, stiffness: 400 })
    );
    
    if (isProductInCart) {
      removeFromCart(product.id);
    } else {
      addToCart(product);
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
    <Animated.View 
      className="flex-1 bg-white rounded-3xl shadow-xl border border-orange-100 overflow-hidden"
      style={animatedStyle}
    >
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
            className="absolute top-3 right-3 w-12 h-12 bg-white/95 backdrop-blur-sm rounded-full items-center justify-center shadow-lg"
            onPress={handleLikePress}
            style={likeAnimatedStyle}
          >
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={22}
              color={isLiked ? '#FF6B35' : '#6B7280'}
            />
          </AnimatedTouchableOpacity>
        )}

        {/* Discount Badge */}
        {hasDiscount && (
          <View className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-red-500 px-3 py-2 rounded-2xl shadow-lg">
            <Text className="text-white text-xs font-bold">{discountPercentage}% OFF</Text>
          </View>
        )}

        {/* Category Badge */}
        {product.category && (
          <View className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-sm px-3 py-2 rounded-2xl">
            <Text className="text-white text-xs font-semibold capitalize">{product.category}</Text>
          </View>
        )}

        {/* Rating Badge */}
        {product.rating && (
          <View className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-2xl flex-row items-center">
            <Ionicons name="star" size={14} color="#FFB800" />
            <Text className="text-xs font-semibold text-gray-700 ml-1">{product.rating}</Text>
          </View>
        )}
      </View>

      {/* Product Info */}
      <View className="p-5 space-y-4">
        {/* Price */}
        <View className="flex-row items-center space-x-3">
          <Text className="text-xl font-bold text-gray-900">₹{product.price.toFixed(2)}</Text>
          {hasDiscount && (
            <Text className="text-sm text-gray-400 line-through">₹{product.original_price!.toFixed(2)}</Text>
          )}
        </View>

        {/* Product Name */}
        <Text className="text-base font-semibold text-gray-800 leading-tight" numberOfLines={2}>
          {product.name}
        </Text>

        {/* Actions */}
        {showAdminControls ? (
          <TouchableOpacity 
            className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-2xl py-4 flex-row items-center justify-center space-x-2"
            onPress={onDelete}
          >
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
            <Text className="text-red-600 font-semibold text-base">Unlist Product</Text>
          </TouchableOpacity>
        ) : isMyProduct ? (
          <View className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-2xl py-4 flex-row items-center justify-center space-x-2">
            <Ionicons name="person-circle-outline" size={18} color="#10B981" />
            <Text className="text-green-700 font-semibold text-base">Your Listing</Text>
          </View>
        ) : (
          <View className="space-y-3">
            <TouchableOpacity
              className={`
                rounded-2xl py-4 flex-row items-center justify-center space-x-2
                ${isProductInCart 
                  ? 'bg-gradient-to-r from-gray-100 to-gray-200 border border-gray-300' 
                  : 'bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg'
                }
              `}
              onPress={handleAddToCart}
            >
              <Ionicons
                name={isProductInCart ? 'remove-circle-outline' : 'bag-outline'}
                size={18}
                color={isProductInCart ? '#EF4444' : 'white'}
              />
              <Text className={`
                font-semibold text-base
                ${isProductInCart ? 'text-red-600' : 'text-white'}
              `}>
                {isProductInCart ? 'Remove' : 'Add to Cart'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-2xl py-4 flex-row items-center justify-center space-x-2"
              onPress={handleContactSeller}
            >
              <Ionicons name="chatbubble-outline" size={18} color="#6B7280" />
              <Text className="text-gray-700 font-semibold text-base">Contact Seller</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Animated.View>
  );
}
