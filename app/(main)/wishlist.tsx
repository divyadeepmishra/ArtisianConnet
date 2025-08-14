// app/(tabs)/wishlist.tsx
import React, { useState, useCallback } from 'react';
import { FlatList, ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@clerk/clerk-expo';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { createSupabaseWithClerk } from '../../lib/supabaseWithClerk';
import ProductCard from '../../components/ProductCard';

export default function WishlistScreen() {
  const { userId, isLoaded, getToken } = useAuth();
  const navigation = useNavigation();
  const [likedProducts, setLikedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLikedProducts = async () => {
    if (!userId) return;

    try {
      setLoading(true);

      const token = await getToken();
      if (!token) throw new Error('No token found');

      const supabase = createSupabaseWithClerk(token);

      const { data, error } = await supabase
        .from('liked_products')
        .select('products(*)')
        .eq('user_id', userId);

      if (error) throw error;

      const products = data.map((item) => item.products);
      setLikedProducts(products || []);
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      setLikedProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (productId, isCurrentlyLiked) => {
    try {
      const token = await getToken();
      if (!token) throw new Error('No token found');

      const supabase = createSupabaseWithClerk(token);

      if (isCurrentlyLiked) {
        await supabase
          .from('liked_products')
          .delete()
          .eq('user_id', userId)
          .eq('product_id', productId);
      } else {
        await supabase
          .from('liked_products')
          .insert([{ user_id: userId, product_id: productId }]);
      }

      fetchLikedProducts();
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (isLoaded && userId) {
        fetchLikedProducts();
      }
    }, [isLoaded, userId])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
      </SafeAreaView>
    );
  }

  if (!likedProducts.length) {
    return (
      <SafeAreaView style={styles.center}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={{ fontSize: 16, color: '#555' }}>Your wishlist is empty ❤️</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Liked Items</Text>
      </View>

      <FlatList
        data={likedProducts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            isLiked={true}
            onToggleLike={toggleLike}
          />
        )}
        numColumns={2}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 10 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  backButton: {
    padding: 6,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
});
