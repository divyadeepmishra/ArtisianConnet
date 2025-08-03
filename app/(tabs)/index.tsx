// app/(tabs)/index.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  TextInput,
  ActivityIndicator,
  Text,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { createSupabaseWithClerk } from '../../lib/supabaseWithClerk';
import ProductCard from '../../components/ProductCard';

export default function HomeScreen() {
  const { getToken, userId } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [likedProductIds, setLikedProductIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  // Debounce logic
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const token = await getToken();
    if (!token) {
      setProducts([]);
      setIsLoading(false);
      return;
    }

    const supabase = createSupabaseWithClerk(token);

    const { data: productData } = await supabase
      .from('products')
      .select('*')
      .ilike('name', `%${debouncedQuery}%`);
    setProducts(productData || []);

    if (userId) {
      const { data: likedData } = await supabase
        .from('liked_products')
        .select('product_id')
        .eq('user_id', userId);
      setLikedProductIds(new Set(likedData?.map(item => item.product_id)));
    }

    setIsLoading(false);
  }, [debouncedQuery, userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleLike = async (productId: number) => {
    const token = await getToken();
    if (!token || !userId) return;
    const supabase = createSupabaseWithClerk(token);

    if (likedProductIds.has(productId)) {
      await supabase
        .from('liked_products')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);
      setLikedProductIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    } else {
      await supabase
        .from('liked_products')
        .insert([{ user_id: userId, product_id: productId }]);
      setLikedProductIds(prev => new Set(prev).add(productId));
    }
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="alert-circle-outline" size={60} color="#9CA3AF" />
      <Text style={styles.emptyText}>No items found.</Text>
      {debouncedQuery && <Text style={styles.emptySub}>Try a different keyword.</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>🛍️ ArtisanConnect</Text>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search handcrafted products..."
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
          />
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#4B5563" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={products}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              isLiked={likedProductIds.has(item.id)}
              onToggleLike={handleToggleLike}
            />
          )}
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
  header: { padding: 16 },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#111827',
  },
  grid: {
    paddingBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    marginTop: 40,
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
  },
});
