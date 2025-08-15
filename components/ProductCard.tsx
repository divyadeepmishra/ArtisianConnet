// app/components/ProductCard.tsx

import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useCart } from '@/app/(context)/CartContext';
import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';

type Product = {
  id: number;
  name: string;
  price: number;
  image_url: string;
  seller_id: string;
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
    <View style={styles.cardContainer}>
      <Image
        source={{ uri: product.image_url }}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.infoContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={styles.productPrice}>
            ₹{product.price.toFixed(2)}
          </Text>
        </View>

        {!showAdminControls && (
          <AnimatedTouchableOpacity
            style={[styles.likeButton, animatedStyle]}
            onPress={handleLikePress}
          >
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={22}
              color={isLiked ? '#EF4444' : '#6B7280'}
            />
          </AnimatedTouchableOpacity>
        )}
      </View>

      {/* ACTIONS */}
      {showAdminControls ? (
        <TouchableOpacity style={styles.unlistButton} onPress={onDelete}>
          <Ionicons name="trash-outline" size={16} color="#EF4444" />
          <Text style={styles.unlistButtonText}>Unlist Product</Text>
        </TouchableOpacity>
      ) : isMyProduct ? (
        <View style={styles.myProductIndicator}>
          <Ionicons name="person-circle-outline" size={16} color="#10B981" />
          <Text style={styles.myProductText}>Your Listing</Text>
        </View>
      ) : (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[
              styles.cartButton,
              isProductInCart && styles.removeFromCartButton
            ]}
            onPress={() =>
              isProductInCart ? removeFromCart(product.id) : addToCart(product)
            }
          >
            <Ionicons
              name={isProductInCart ? 'remove-circle-outline' : 'cart-outline'}
              size={18}
              color={isProductInCart ? '#EF4444' : 'white'}
            />
            <Text
              style={[
                styles.cartButtonText,
                isProductInCart && styles.removeFromCartButtonText
              ]}
            >
              {isProductInCart ? 'Remove' : 'Add to Cart'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactButton}
            onPress={handleContactSeller}
          >
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={16}
              color="white"
            />
            <Text style={styles.contactButtonText}>Contact Seller</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    margin: 8,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
    paddingBottom: 8
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 12
  },
  textContainer: { flex: 1, marginRight: 8 },
  productName: { fontSize: 14, fontWeight: '500', color: '#1F2937' },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 4
  },
  likeButton: { padding: 8 },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 12,
    marginTop: 8,
    gap: 8
  },
  cartButton: {
    flex: 1,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  cartButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6
  },
  removeFromCartButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#D1D5DB'
  },
  removeFromCartButtonText: { color: '#EF4444' },
  contactButton: {
    flex: 1,
    backgroundColor: '#059669',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  contactButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6
  },
  myProductIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    paddingVertical: 10,
    marginHorizontal: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#D1FAE5'
  },
  myProductText: {
    color: '#065F46',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 8
  },
  unlistButton: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    paddingVertical: 10,
    marginHorizontal: 12,
    marginTop: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FEE2E2'
  },
  unlistButtonText: {
    color: '#EF4444',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 8
  }
});
