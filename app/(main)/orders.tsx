import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { Link, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    FadeInUp,
    SlideInDown,
    useSharedValue
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createSupabaseWithClerk } from '../../lib/supabaseWithClerk';

export default function OrdersScreen() {
    const { getToken, userId } = useAuth();
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const isFetching = useRef(false);

    // Animation values
    const headerScale = useSharedValue(1);

    const fetchOrders = useCallback(async () => {
        if (isFetching.current) return;
        if (!userId) return;

        isFetching.current = true;
        if (orders.length === 0) setIsLoading(true);

        try {
            const token = await getToken();
            if (!token) return;

            const supabase = createSupabaseWithClerk(token);
            const { data, error } = await supabase
                .from('orders')
                .select(`
          *,
          order_items (
            *,
            products (
              image_url
            )
          )
        `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            isFetching.current = false;
            setIsLoading(false);
        }
    }, [userId, getToken, orders.length]);

    useFocusEffect(
        useCallback(() => {
            fetchOrders();
        }, [fetchOrders])
    );

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'bg-gradient-to-r from-green-100 to-green-200 text-green-700 border-green-300';
            case 'pending':
                return 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-700 border-orange-300';
            case 'cancelled':
                return 'bg-gradient-to-r from-red-100 to-red-200 text-red-700 border-red-300';
            default:
                return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-gray-300';
        }
    };

    const renderOrderItem = ({ item, index }: { item: any; index: number }) => {
        const firstItemImage = item.order_items?.[0]?.products?.image_url;
        const orderNumber = orders.length - index;
        
        return (
            <Animated.View
                entering={FadeInUp.delay(index * 100)}
            >
                <Link href={{ pathname: "/(main)/order-detail", params: { orderId: item.id } }} asChild>
                    <TouchableOpacity>
                        <View className="bg-white rounded-3xl p-6 mb-4 shadow-xl border border-orange-100">
                            <View className="flex-row items-center justify-between mb-4 pb-4 border-b border-orange-100">
                                <View className="flex-row items-center space-x-3">
                                    <View className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl items-center justify-center">
                                        <Ionicons name="receipt" size={20} color="white" />
                                    </View>
                                    <Text className="text-lg font-bold text-gray-900">Order #{orderNumber}</Text>
                                </View>
                                <Text className="text-sm text-gray-500 font-medium">
                                    {new Date(item.created_at).toLocaleDateString()}
                                </Text>
                            </View>
                            
                            <View className="flex-row items-center space-x-4">
                                {firstItemImage && (
                                    <View className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg">
                                        <Image 
                                            source={{ uri: firstItemImage }} 
                                            className="w-full h-full"
                                            resizeMode="cover"
                                        />
                                    </View>
                                )}
                                <View className="flex-1 space-y-3">
                                    <View className="flex-row justify-between items-center">
                                        <Text className="text-xl font-bold text-gray-900">
                                            ₹{(Number(item.total_amount) + 50).toFixed(2)}
                                        </Text>
                                        <View className={`px-4 py-2 rounded-2xl border ${getStatusColor(item.status)}`}>
                                            <Text className={`text-xs font-bold capitalize`}>
                                                {item.status}
                                            </Text>
                                        </View>
                                    </View>
                                    <View className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-3">
                                        <Text className="text-sm text-gray-600 font-medium">
                                            Payment ID: {item.razorpay_payment_id}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                </Link>
            </Animated.View>
        );
    };

    const renderEmptyList = () => (
        <Animated.View 
            entering={FadeInUp.delay(300)}
            className="flex-1 items-center justify-center py-20"
        >
            <View className="w-24 h-24 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full items-center justify-center mb-6">
                <Ionicons name="receipt-outline" size={48} color="#FF6B35" />
            </View>
            <Text className="text-xl font-bold text-gray-700 mb-2">No Orders Yet</Text>
            <Text className="text-gray-500 text-center">When you buy something, it will show up here</Text>
        </Animated.View>
    );

    return (
        <SafeAreaView className="flex-1 bg-gradient-to-br from-orange-50 via-white to-orange-50" edges={['top']}>
            {/* Header */}
            <Animated.View 
                entering={SlideInDown.delay(100)}
                className="bg-white/95 backdrop-blur-xl border-b border-orange-100 px-4 py-4"
            >
                <View className="flex-row items-center justify-between">
                    <Link href="/(tabs)/profile" asChild>
                        <TouchableOpacity className="w-10 h-10 bg-gradient-to-r from-orange-100 to-orange-200 rounded-full items-center justify-center">
                            <Ionicons name="arrow-back" size={20} color="#FF6B35" />
                        </TouchableOpacity>
                    </Link>
                    <View className="flex-row items-center space-x-2">
                        <Ionicons name="receipt" size={24} color="#FF6B35" />
                        <Text className="text-xl font-bold text-gray-900">My Orders</Text>
                    </View>
                    <View className="w-10" />
                </View>
            </Animated.View>

            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#FF6B35" />
                </View>
            ) : (
                <FlatList
                    data={orders}
                    renderItem={renderOrderItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={
                        orders.length === 0 ? { flex: 1 } : { padding: 16 }
                    }
                    ListEmptyComponent={renderEmptyList}
                    onRefresh={fetchOrders}
                    refreshing={isFetching.current}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
}
