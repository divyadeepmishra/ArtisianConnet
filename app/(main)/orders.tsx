import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { Link, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createSupabaseWithClerk } from '../../lib/supabaseWithClerk';

export default function OrdersScreen() {
    const { getToken, userId } = useAuth();
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const isFetching = useRef(false);

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
                return 'text-green-600 bg-green-100';
            case 'pending':
                return 'text-yellow-600 bg-yellow-100';
            case 'cancelled':
                return 'text-red-600 bg-red-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const renderOrderItem = ({ item, index }: { item: any; index: number }) => {
        const firstItemImage = item.order_items?.[0]?.products?.image_url;
        const orderNumber = orders.length - index;
        return (
            <Link href={{ pathname: "/(main)/order-detail", params: { orderId: item.id } }} asChild>
                <TouchableOpacity>
                    <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100">
                        <View className="flex-row items-center justify-between mb-3 pb-3 border-b border-gray-100">
                            <Text className="text-lg font-semibold text-gray-900">Order #{orderNumber}</Text>
                            <Text className="text-sm text-gray-500">
                                {new Date(item.created_at).toLocaleDateString()}
                            </Text>
                        </View>
                        
                        <View className="flex-row items-center space-x-4">
                            {firstItemImage && (
                                <Image 
                                    source={{ uri: firstItemImage }} 
                                    className="w-16 h-16 rounded-xl bg-gray-100"
                                />
                            )}
                            <View className="flex-1 space-y-2">
                                <View className="flex-row justify-between items-center">
                                    <Text className="text-base font-semibold text-gray-900">
                                        ₹{(Number(item.total_amount) + 50).toFixed(2)}
                                    </Text>
                                    <View className={`px-3 py-1 rounded-full ${getStatusColor(item.status)}`}>
                                        <Text className={`text-xs font-medium capitalize`}>
                                            {item.status}
                                        </Text>
                                    </View>
                                </View>
                                <Text className="text-sm text-gray-500">
                                    Payment ID: {item.razorpay_payment_id}
                                </Text>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            </Link>
        );
    };

    const renderEmptyList = () => (
        <View className="flex-1 items-center justify-center py-20">
            <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-6">
                <Ionicons name="receipt-outline" size={48} color="#9CA3AF" />
            </View>
            <Text className="text-xl font-bold text-gray-700 mb-2">No Orders Yet</Text>
            <Text className="text-gray-500 text-center">When you buy something, it will show up here</Text>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
            {/* Header */}
            <View className="bg-white border-b border-gray-200 px-4 py-4">
                <View className="flex-row items-center justify-between">
                    <Link href="/(tabs)/profile" asChild>
                        <TouchableOpacity className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
                            <Ionicons name="arrow-back" size={20} color="#374151" />
                        </TouchableOpacity>
                    </Link>
                    <Text className="text-xl font-bold text-gray-900">My Orders</Text>
                    <View className="w-10" />
                </View>
            </View>

            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#3B82F6" />
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
