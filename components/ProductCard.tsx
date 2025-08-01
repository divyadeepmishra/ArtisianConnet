import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';

// Define a type for your product for better code quality
type Product = {
  id: string;
  name: string;
  price: number;
  image_url: string;
};

export default function ProductCard({ product }: { product: Product }) {
  return (
    <TouchableOpacity className="flex-1 m-1 p-2 bg-white border border-gray-200 rounded-xl">
      {/* Product Image */}
      <Image
        source={{ uri: product.image_url }}
        className="w-full aspect-square rounded-lg"
        resizeMode="cover"
      />
      
      {/* Product Details */}
      <View className="mt-2">
        <Text className="text-sm font-semibold text-gray-800" numberOfLines={1}>
          {product.name}
        </Text>
        <Text className="text-lg font-bold text-gray-900 mt-1">
          ${product.price.toFixed(2)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}