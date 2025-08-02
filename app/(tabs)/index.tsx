import {
  View,
  FlatList,
  TextInput,
  ActivityIndicator,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import { createSupabaseWithClerk } from '../../lib/supabaseWithClerk';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import ProductCard from '../../components/ProductCard'; 
 

export default function HomeScreen() {
  const { getToken } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState<string>(''); 

  useEffect(() => {
    const handler= setTimeout(async() => {
      if (!searchQuery){      // If search is empty, load all products
        const token = await getToken();
        if (!token) {
          console.error('No auth token found');
          setIsLoading(false);
          return;
        }
        const supabase = createSupabaseWithClerk(token);

        const { data, error } = await supabase.from('products').select('*');

        if (error) {
          console.error('Error fetching products:', error);
        } else {
          setProducts(data || []);
        }
        setIsLoading(false);
        return;
      } else {    // If search query is present, filter products
        setIsLoading(true);
        const token = await getToken();
        if (!token) {
          console.error('No auth token found');
          setIsLoading(false);
          return;
        }
        const supabase = createSupabaseWithClerk(token);

        const { data, error } = await supabase
          .from('products')
          .select('*')
          .ilike('name', `%${searchQuery}%`); // Case-insensitive search

        if (error) {
          console.error('Error fetching products:', error);
        } else {
          setProducts(data || []);
        }
        setIsLoading(false);  
      }
    }, 300);
      return () => {
        clearTimeout(handler); // Cleanup 
      }; 
  }, [searchQuery, getToken]); // Re-run effect when searchQuery changes

  const renderEmptyList = () => (
    <View className="flex-1 items-center justify-center mt-20">
      <Ionicons name="alert-circle-outline" size={60} color="#9CA3AF" />
      <Text className="text-lg text-gray-500 mt-4">No items found.</Text>
      <Text className="text-sm text-gray-400">Try a different search term.</Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top', 'left', 'right']}>
      <View className="p-4">
        <Text className="text-3xl font-extrabold text-gray-900">ArtisianConnet</Text>
        
        {/* Modern Search Bar */}
        <View className="flex-row items-center bg-white border border-gray-200 rounded-xl p-3 mt-4 mb-2">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            placeholder="Search for handcrafted items..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 ml-3 text-base"
          />
        </View>
      </View>

      {/* Show a loading spinner while fetching data */}
      {isLoading ? (
        <ActivityIndicator size="large" color="#000" className="mt-16" />
      ) : (
        <FlatList
          data={products}
          renderItem={({ item }) => <ProductCard product={item} />}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2} // This creates the two-column grid
          contentContainerStyle={{ paddingHorizontal: 8 }}
          ListEmptyComponent={renderEmptyList} // Show this when there are no products
        />
      )}
    </SafeAreaView>
  );
}