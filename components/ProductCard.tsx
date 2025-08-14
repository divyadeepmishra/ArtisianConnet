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
  // Optional props for different contexts
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
  const isProductInCart = items.some(item => item.id === product.id);

  const animatedStyle = useAnimatedStyle(() => {
    return { transform: [{ scale: scale.value }] };
  });

  const handleLikePress = () => {
    if (onToggleLike && typeof isLiked !== 'undefined') {
        scale.value = withSpring(1.4, { damping: 10, stiffness: 400 });
        setTimeout(() => { scale.value = withSpring(1); }, 150);
        onToggleLike(product.id, isLiked);
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
        
        {/* Only show the Like button if it's NOT the admin view */}
        {!showAdminControls && (
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
        )}
      </View>

      {/* Show the correct button based on the context */}
      {showAdminControls ? (
        <TouchableOpacity style={styles.unlistButton} onPress={onDelete}>
            <Ionicons name="trash-outline" size={16} color="#EF4444" />
            <Text style={styles.unlistButtonText}>Unlist </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity 
            style={[styles.cartButton, isProductInCart && styles.removeFromCartButton]}
            onPress={() => isProductInCart ? removeFromCart(product.id) : addToCart(product)}
        >
            <Ionicons 
                name={isProductInCart ? 'remove-circle-outline' : 'add-circle-outline'} 
                size={18} 
                color={isProductInCart ? '#EF4444' : 'white'}
            />
            <Text style={[styles.cartButtonText, isProductInCart && styles.removeFromCartButtonText]}>
                {isProductInCart ? 'Remove from Cart' : 'Add to Cart'}
            </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1, margin: 8, backgroundColor: 'white', borderRadius: 16,
    shadowColor: '#000000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05, shadowRadius: 15, elevation: 2,
    paddingBottom: 8,
  },
  image: {
    width: '100%', aspectRatio: 1, borderTopLeftRadius: 16, borderTopRightRadius: 16,
  },
  adminOverlay: {
    position: 'absolute', top: 12, left: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 4, paddingHorizontal: 8, borderRadius: 20,
  },
  adminText: { color: 'white', fontSize: 12, fontWeight: '600', marginLeft: 4 },
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
  removeFromCartButton: {
    backgroundColor: 'white', borderWidth: 1, borderColor: '#D1D5DB',
  },
  removeFromCartButtonText: { color: '#EF4444' },
  unlistButton: {
    backgroundColor: '#FEF2F2', borderRadius: 12, paddingVertical: 10,
    marginHorizontal: 12, marginTop: 8, alignItems: 'center',
    flexDirection: 'row', justifyContent: 'center', borderWidth: 1, borderColor: '#FEE2E2',
  },
  unlistButtonText: {
    color: '#EF4444', fontWeight: '600', fontSize: 14, marginLeft: 8,
  },
});