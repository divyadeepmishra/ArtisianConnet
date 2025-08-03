// in app/components/ProductCard.tsx

import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useCart } from '@/app/(context)/CartContext';


type Product = {
  id: number;
  name: string;
  price: number;
  image_url: string;
};

type ProductCardProps = {
  product: Product;
  isLiked: boolean;
  onToggleLike: (productId: number, isCurrentlyLiked: boolean) => void;
};

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function ProductCard({ product, isLiked, onToggleLike }: ProductCardProps) {
  const scale = useSharedValue(1);
  // Get all the functions and data we need from the context
  const { addToCart, removeFromCart, items } = useCart();

  // Check if the current product is already in the cart
  const isProductInCart = items.some(item => item.id === product.id);

  const animatedStyle = useAnimatedStyle(() => {
    return { transform: [{ scale: scale.value }] };
  });

  const handleLikePress = () => {
    scale.value = withSpring(1.4, { damping: 10, stiffness: 400 });
    setTimeout(() => {
      scale.value = withSpring(1);
    }, 150);
    onToggleLike(product.id, isLiked);
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
          <Text style={styles.productName} numberOfLines={1}>
            {product.name}
          </Text>
          <Text style={styles.productPrice}>
            ₹{product.price.toFixed(2)}
          </Text>
        </View>

        <AnimatedTouchableOpacity 
          style={[styles.likeButton, animatedStyle]}
          onPress={handleLikePress}
        >
          <Ionicons 
            name={isLiked ? 'heart' : 'heart-outline'} 
            size={24} 
            color={isLiked ? '#EF4444' : '#6B7280'} 
          />
        </AnimatedTouchableOpacity>
      </View>

      {/* This button now toggles between adding and removing */}
      <TouchableOpacity 
        style={[styles.cartButton, isProductInCart && styles.removeFromCartButton]}
        onPress={() => {
          if (isProductInCart) {
            removeFromCart(product.id);
          } else {
            addToCart(product);
          }
        }}
      >
        <Ionicons 
          name={isProductInCart ? 'remove-circle-outline' : 'add-circle-outline'} 
          size={18} 
          color={isProductInCart ? '#EF4444' : 'white'}
        />
        <Text style={[styles.cartButtonText, isProductInCart && styles.removeFromCartButtonText]}>
          {isProductInCart ? 'Remove ' : 'Add to Cart'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1, margin: 8, backgroundColor: 'white', borderRadius: 16,
    shadowColor: '#000000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05, shadowRadius: 15, elevation: 2, paddingBottom: 8,
  },
  image: {
    width: '100%', aspectRatio: 1, borderTopLeftRadius: 16, borderTopRightRadius: 16,
  },
  infoContainer: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 12, paddingTop: 12,
  },
  textContainer: { flex: 1, marginRight: 8 },
  productName: { fontSize: 14, fontWeight: '500', color: '#1F2937' },
  productPrice: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginTop: 4 },
  likeButton: { padding: 8 },
  cartButton: {
    backgroundColor: '#111827', borderRadius: 12, paddingVertical: 10,
    marginHorizontal: 12, marginTop: 8, alignItems: 'center',
    flexDirection: 'row', justifyContent: 'center',
  },
  cartButtonText: {
    color: 'white', fontWeight: '600', fontSize: 14, marginLeft: 8,
  },
  // New styles for the "Remove" button state
  removeFromCartButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  removeFromCartButtonText: {
    color: '#EF4444',
  },
});