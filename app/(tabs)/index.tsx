// app/(tabs)/index.tsx
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  FadeInRight,
  FadeInUp,
  SlideInDown,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import CategoryFilter from '../../components/CategoryFilter';
import HeroSection from '../../components/HeroSection';
import ProductCard from '../../components/ProductCard';
import SearchBar from '../../components/SearchBar';
import { createSupabaseWithClerk } from '../../lib/supabaseWithClerk';

const categories = [
  { id: 'all', name: 'All', icon: '🎨', count: 0 },
  { id: 'pottery', name: 'Pottery', icon: '🏺', count: 45 },
  { id: 'paintings', name: 'Paintings', icon: '🖼️', count: 78 },
  { id: 'textiles', name: 'Textiles', icon: '🧶', count: 32 },
  { id: 'sculptures', name: 'Sculptures', icon: '🗿', count: 23 },
  { id: 'jewelry', name: 'Jewelry', icon: '💍', count: 56 },
];

const filterTabs = [
  { id: 'all', name: 'All', icon: null },
  { id: 'deals', name: 'Deals', icon: '⚡' },
  { id: 'new', name: 'New', icon: null },
  { id: 'bestsellers', name: 'Best Sellers', icon: null },
];

export default function HomeScreen() {
  const { getToken, userId } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [likedProductIds, setLikedProductIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFilter, setSelectedFilter] = useState('deals');

  // Animation values
  const countdownValue = useSharedValue(0);

  // Debounce logic
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  // Countdown animation
  useEffect(() => {
    countdownValue.value = withRepeat(
      withSequence(
        withSpring(1, { duration: 1000 }),
        withSpring(0, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const token = await getToken();
    if (!token) {
      setProducts([]);
      setIsLoading(false);
      return;
    }

    const supabase = createSupabaseWithClerk(token);

    let query = supabase.from('products').select('*');
    
    if (debouncedQuery) {
      query = query.ilike('name', `%${debouncedQuery}%`);
    }
    
    if (selectedCategory !== 'all') {
      query = query.eq('category', selectedCategory);
    }

    const { data: productData } = await query;
    setProducts(productData || []);

    if (userId) {
      const { data: likedData } = await supabase
        .from('liked_products')
        .select('product_id')
        .eq('user_id', userId);
      setLikedProductIds(new Set(likedData?.map(item => item.product_id)));
    }

    setIsLoading(false);
  }, [debouncedQuery, selectedCategory, userId]);

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
    <Animated.View 
      entering={FadeInUp.delay(300)}
      className="flex-1 items-center justify-center py-20"
    >
      <View className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full items-center justify-center mb-6">
        <Ionicons name="bag-outline" size={48} color="#9CA3AF" />
      </View>
      <Text className="text-xl font-bold text-gray-700 mb-2">No products found</Text>
      <Text className="text-gray-500 text-center">Try adjusting your search or filters</Text>
    </Animated.View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-gray-50 to-white" edges={['top']}>
      {/* Header */}
      <Animated.View 
        entering={SlideInDown.delay(100)}
        className="bg-white/95 backdrop-blur-xl border-b border-gray-100 px-4 py-4"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center space-x-3">
            <View className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl items-center justify-center shadow-lg">
              <Text className="text-white font-bold text-sm">AC</Text>
            </View>
            <Text className="font-bold text-xl text-gray-900">ArtsCrafts</Text>
          </View>
          <TouchableOpacity className="flex-row items-center space-x-2 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl px-4 py-2 shadow-sm">
            <Ionicons name="bag-outline" size={20} color="#374151" />
            <Text className="font-semibold text-gray-700">Cart</Text>
            <View className="bg-gradient-to-r from-red-500 to-red-600 rounded-full w-6 h-6 items-center justify-center">
              <Text className="text-white text-xs font-bold">3</Text>
            </View>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 py-6 space-y-8">
          {/* Hero Section */}
          <Animated.View entering={FadeInUp.delay(200)}>
            <HeroSection />
          </Animated.View>

          {/* Search and Filters */}
          <Animated.View entering={FadeInUp.delay(300)} className="space-y-6">
            <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
            <CategoryFilter 
              categories={categories} 
              selectedCategory={selectedCategory} 
              onCategoryChange={setSelectedCategory} 
            />
          </Animated.View>

          {/* Filter Tabs */}
          <Animated.View entering={FadeInUp.delay(400)} className="space-y-4">
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 4 }}
            >
              <View className="flex-row space-x-3">
                {filterTabs.map((tab, index) => (
                  <Animated.View
                    key={tab.id}
                    entering={FadeInRight.delay(500 + index * 100)}
                  >
                    <TouchableOpacity
                      onPress={() => setSelectedFilter(tab.id)}
                      className={`
                        flex-row items-center space-x-2 px-5 py-3 rounded-2xl shadow-sm
                        ${selectedFilter === tab.id 
                          ? 'bg-gradient-to-r from-gray-900 to-gray-800 shadow-lg' 
                          : 'bg-white border border-gray-200'
                        }
                      `}
                    >
                      {tab.icon && <Text className="text-sm">{tab.icon}</Text>}
                      <Text className={`
                        text-sm font-semibold
                        ${selectedFilter === tab.id ? 'text-white' : 'text-gray-700'}
                      `}>
                        {tab.name}
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </View>
            </ScrollView>
          </Animated.View>

          {/* Holiday Sales Section */}
          <Animated.View entering={FadeInUp.delay(500)} className="space-y-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-2xl font-bold text-gray-900">Holiday Sales</Text>
              <View className="flex-row items-center space-x-2 bg-gradient-to-r from-red-100 to-red-200 px-4 py-2 rounded-2xl">
                <Ionicons name="flame" size={16} color="#DC2626" />
                <Text className="text-red-700 font-semibold text-sm">Hot Deals</Text>
              </View>
              <Animated.View 
                className="flex-row items-center space-x-1"
                style={{ opacity: countdownValue }}
              >
                <Text className="text-sm text-gray-500">Closing in:</Text>
                <Text className="text-sm font-semibold text-gray-700">2d 14h 30m</Text>
              </Animated.View>
            </View>

            {isLoading ? (
              <View className="py-12">
                <ActivityIndicator size="large" color="#3B82F6" />
              </View>
            ) : (
              <FlatList
                data={products}
                renderItem={({ item, index }) => (
                  <Animated.View
                    entering={FadeInUp.delay(600 + index * 100)}
                    className="flex-1"
                  >
                    <ProductCard
                      product={item}
                      isLiked={likedProductIds.has(item.id)}
                      onToggleLike={handleToggleLike}
                    />
                  </Animated.View>
                )}
                keyExtractor={item => item.id.toString()}
                numColumns={2}
                scrollEnabled={false}
                contentContainerStyle={{ gap: 16 }}
                ListEmptyComponent={renderEmptyList}
              />
            )}
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
