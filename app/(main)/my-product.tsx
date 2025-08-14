// app/(main)/my-products.tsx
import React, { useState, useCallback, useRef } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@clerk/clerk-expo';
import { Link, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { createSupabaseWithClerk } from '../../lib/supabaseWithClerk';
import ProductCard from '../../components/ProductCard';

export default function MyProductsScreen() {
  const { getToken, userId } = useAuth();
  const [myProducts, setMyProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true); // First load only
  const [refreshing, setRefreshing] = useState(false); // For pull-to-refresh
  const hasLoadedOnce = useRef(false); // Track first load

  const fetchMyProducts = useCallback(async (showLoader = false) => {
    if (!userId) return;

    if (showLoader) setIsLoading(true);
    else setRefreshing(true);

    const token = await getToken();
    if (!token) return;

    const supabase = createSupabaseWithClerk(token);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching user's products:", error);
    } else {
      setMyProducts(data || []);
    }

    if (showLoader) {
      setIsLoading(false);
      hasLoadedOnce.current = true;
    } else {
      setRefreshing(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      // On first visit, show loader
      if (!hasLoadedOnce.current) {
        fetchMyProducts(true);
      } else {
        // On returning, just refresh silently without flicker
        fetchMyProducts(false);
      }
    }, [fetchMyProducts])
  );

  const handleDeleteProduct = async (productId: number) => {
    Alert.alert(
      "Unlist Product",
      "Are you sure you want to permanently remove this listing?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Unlist",
          style: "destructive",
          onPress: async () => {
            setMyProducts(prev => prev.filter(p => p.id !== productId));

            const token = await getToken();
            if (!token) return;
            const supabase = createSupabaseWithClerk(token);
            await supabase.from('products').delete().eq('id', productId);
          }
        }
      ]
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="storefront-outline" size={60} color="#9CA3AF" />
      <Text style={styles.emptyText}>You haven't listed any products</Text>
      <Text style={styles.emptySub}>Tap the 'List Item' tab to get started.</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Link href="/(tabs)/profile" asChild>
          <TouchableOpacity>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
        </Link>
        <Text style={styles.title}>My Products</Text>
        <View style={{ width: 24 }} />
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#4B5563" style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={myProducts}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              showAdminControls={true}
              onDelete={() => handleDeleteProduct(item.id)}
            />
          )}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          contentContainerStyle={{ padding: 8, flexGrow: 1 }}
          ListEmptyComponent={renderEmptyList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => fetchMyProducts(false)} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', backgroundColor: 'white',
  },
  title: { fontSize: 20, fontWeight: '700', color: '#1F2937' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#6B7280', marginTop: 12 },
  emptySub: { fontSize: 14, color: '#9CA3AF', marginTop: 4, textAlign: 'center' },
});
