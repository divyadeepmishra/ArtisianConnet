import React, { useState, useRef } from 'react';
import {
  View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@clerk/clerk-expo';
import { Link, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { createSupabaseWithClerk } from '../../lib/supabaseWithClerk';
import ProductCard from '../../components/ProductCard';

export default function WishlistScreen() {
  const { getToken, userId } = useAuth();
  const [likedProducts, setLikedProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // This ref will act as a "lock" to prevent multiple fetches at the same time.
  const isFetching = useRef(false);

  useFocusEffect(
    React.useCallback(() => {
      const fetchLikedProducts = async () => {
        // 1. If a fetch is already in progress, do nothing.
        if (isFetching.current) return;

        // 2. Lock the function to prevent another fetch from starting.
        isFetching.current = true;
        setIsLoading(true);

        try {
          if (!userId) return;

          const token = await getToken();
          if (!token) return;
          
          const supabase = createSupabaseWithClerk(token);

          const { data: likedData, error: likedError } = await supabase
            .from('liked_products')
            .select('product_id')
            .eq('user_id', userId);

          if (likedError) throw likedError;
          
          const productIds = likedData?.map(item => item.product_id);

          if (!productIds || productIds.length === 0) {
            setLikedProducts([]);
            return;
          }

          const { data: productData, error: productError } = await supabase
            .from('products')
            .select('*')
            .in('id', productIds);

          if (productError) throw productError;
          setLikedProducts(productData ?? []);
        } catch (err) {
          console.error('Error fetching liked products:', err);
          setLikedProducts([]);
        } finally {
          // 3. ALWAYS release the lock and stop loading.
          isFetching.current = false;
          setIsLoading(false);
        }
      };

      fetchLikedProducts();
    }, [userId, getToken])
  );

  const handleUnlikeItem = React.useCallback(async (productId: number) => {
    setLikedProducts(prev => prev.filter(p => p.id !== productId));
    
    const token = await getToken({ template: 'supabase' });
    if (!token || !userId) return;

    const supabase = createSupabaseWithClerk(token);
    await supabase
      .from('liked_products')
      .delete()
      .match({ user_id: userId, product_id: productId });
  }, [getToken, userId]);
  
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="heart-outline" size={60} color="#9CA3AF" />
      <Text style={styles.emptyText}>Your Wishlist is Empty</Text>
      <Text style={styles.emptySub}>Tap the heart on any product to save it here.</Text>
    </View>
  );

  const renderItem = React.useCallback(({ item }: { item: any }) => (
    <ProductCard
      product={item}
      isLiked={true}
      onToggleLike={() => handleUnlikeItem(item.id)}
    />
  ), [handleUnlikeItem]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Link href="/profile" asChild>
          <TouchableOpacity>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
        </Link>
        <Text style={styles.title}>My Wishlist</Text>
        <View style={{ width: 24 }} />
      </View>

      {isLoading && likedProducts.length === 0 ? (
         <ActivityIndicator size="large" color="#4B5563" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={likedProducts}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.grid}
          ListEmptyComponent={renderEmptyList}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  grid: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
  },
});