import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableWithoutFeedback,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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

export default function ProductCard({ product, isLiked, onToggleLike }: ProductCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    // Trigger the animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    // Toggle like state
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
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={styles.productPrice}>
            ₹{product.price.toFixed(2)}
          </Text>
        </View>

        <TouchableWithoutFeedback onPress={handlePress}>
          <Animated.View style={[styles.likeButton, { transform: [{ scale: scaleAnim }] }]}>
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={24}
              color={isLiked ? '#EF4444' : '#6B7280'}
            />
          </Animated.View>
        </TouchableWithoutFeedback>
      </View>
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
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 4,
  },
  likeButton: {
    padding: 8,
    borderRadius: 20,
  },
});
