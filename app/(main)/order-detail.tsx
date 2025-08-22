// app/(main)/order-detail.tsx
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    FadeInUp,
    SlideInDown,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createSupabaseWithClerk } from '../../lib/supabaseWithClerk';

export default function OrderDetailScreen() {
    const { orderId } = useLocalSearchParams<{ orderId: string }>();
    const { getToken } = useAuth();
    const router = useRouter();

    const [order, setOrder] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCancelling, setIsCancelling] = useState(false);

    // Animation values
    const pulseValue = useSharedValue(1);

    useEffect(() => {
        // Pulse animation for status
        pulseValue.value = withRepeat(
            withSequence(
                withSpring(1.05, { duration: 2000 }),
                withSpring(1, { duration: 2000 })
            ),
            -1,
            true
        );
    }, []);

    useEffect(() => {
        let isMounted = true;

        const fetchOrderDetails = async () => {
            if (!orderId) {
                if (isMounted) setIsLoading(false);
                return;
            }
            try {
                setIsLoading(true);
                const token = await getToken();
                if (!token) throw new Error('No token found');

                const supabase = createSupabaseWithClerk(token);

                const { data, error } = await supabase
                    .from('orders')
                    .select(`
                        *,
                        order_items (
                            *,
                            products (*)
                        )
                    `)
                    .eq('id', orderId)
                    .single();

                if (error) throw error;
                if (isMounted) setOrder(data);
            } catch (err) {
                console.error('Error fetching order details:', err);
                if (isMounted) setOrder(null);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchOrderDetails();

        return () => { isMounted = false; };
    }, [orderId]);

    const handleCancelOrder = async () => {
        Alert.alert(
            "Cancel Order",
            "Are you sure you want to cancel this order?",
            [
                { text: "Nevermind", style: "cancel" },
                {
                    text: "Yes, Cancel",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setIsCancelling(true);
                            const token = await getToken();
                            if (!token) throw new Error("Authentication error");

                            const response = await fetch(
                                `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/cancel-order`,
                                {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        Authorization: `Bearer ${token}`
                                    },
                                    body: JSON.stringify({ orderId: order.id })
                                }
                            );

                            const result = await response.json();
                            if (!response.ok || result.error) {
                                throw new Error(result.error || "Unknown error");
                            }

                            setOrder(result.order);
                            Alert.alert("Success", "Your order has been cancelled.");
                        } catch (error) {
                            Alert.alert("Error", "Could not cancel the order. Please try again.");
                            console.error("Cancel order error:", error);
                        } finally {
                            setIsCancelling(false);
                        }
                    }
                }
            ]
        );
    };

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

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-gradient-to-br from-orange-50 via-white to-orange-50">
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#FF6B35" />
                </View>
            </SafeAreaView>
        );
    }

    if (!order) {
        return (
            <SafeAreaView className="flex-1 bg-gradient-to-br from-orange-50 via-white to-orange-50">
                <Animated.View 
                    entering={SlideInDown.delay(100)}
                    className="bg-white/95 backdrop-blur-xl border-b border-orange-100 px-4 py-4"
                >
                    <View className="flex-row items-center justify-between">
                        <TouchableOpacity 
                            onPress={() => router.back()}
                            className="w-10 h-10 bg-gradient-to-r from-orange-100 to-orange-200 rounded-full items-center justify-center"
                        >
                            <Ionicons name="arrow-back" size={20} color="#FF6B35" />
                        </TouchableOpacity>
                        <Text className="text-xl font-bold text-gray-900">Order Not Found</Text>
                        <View className="w-10" />
                    </View>
                </Animated.View>
                <View className="flex-1 justify-center items-center">
                    <Text className="text-gray-600">Could not find the requested order.</Text>
                </View>
            </SafeAreaView>
        );
    }

    const firstItem = order.order_items?.[0];
    const product = firstItem?.products ?? {};

    return (
        <SafeAreaView className="flex-1 bg-gradient-to-br from-orange-50 via-white to-orange-50" edges={['top']}>
            {/* Header */}
            <Animated.View 
                entering={SlideInDown.delay(100)}
                className="bg-white/95 backdrop-blur-xl border-b border-orange-100 px-4 py-4"
            >
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity 
                        onPress={() => router.back()}
                        className="w-10 h-10 bg-gradient-to-r from-orange-100 to-orange-200 rounded-full items-center justify-center"
                    >
                        <Ionicons name="arrow-back" size={20} color="#FF6B35" />
                    </TouchableOpacity>
                    <View className="flex-row items-center space-x-2">
                        <Ionicons name="receipt" size={24} color="#FF6B35" />
                        <Text className="text-xl font-bold text-gray-900">Order Details</Text>
                    </View>
                    <View className="w-10" />
                </View>
            </Animated.View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <View className="p-4 space-y-6">
                    {/* Product Image */}
                    {product.image_url && (
                        <Animated.View entering={FadeInUp.delay(200)}>
                            <View className="w-full h-80 rounded-3xl overflow-hidden shadow-xl">
                                <Image 
                                    source={{ uri: product.image_url }} 
                                    className="w-full h-full"
                                    resizeMode="cover"
                                />
                            </View>
                        </Animated.View>
                    )}

                    {/* Action Buttons */}
                    <Animated.View entering={FadeInUp.delay(300)} className="space-y-3">
                        <TouchableOpacity className="bg-gradient-to-r from-orange-500 to-red-500 p-4 rounded-2xl flex-row items-center justify-center space-x-3 shadow-lg">
                            <Ionicons name="navigate-outline" size={20} color="white" />
                            <Text className="text-white font-bold text-base">Track Package</Text>
                        </TouchableOpacity>

                        {order.status !== 'cancelled' && (
                            <TouchableOpacity
                                className="bg-gradient-to-r from-gray-100 to-gray-200 p-4 rounded-2xl flex-row items-center justify-center space-x-3 border border-gray-300"
                                onPress={handleCancelOrder}
                                disabled={isCancelling}
                            >
                                <Ionicons name="close-circle-outline" size={20} color="#6B7280" />
                                <Text className="text-gray-700 font-bold text-base">
                                    {isCancelling ? "Cancelling..." : "Cancel Order"}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </Animated.View>

                    {/* Order Information */}
                    <Animated.View entering={FadeInUp.delay(400)}>
                        <View className="bg-white rounded-3xl p-6 shadow-xl border border-orange-100">
                            <View className="flex-row items-center space-x-3 mb-6">
                                <View className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl items-center justify-center">
                                    <Ionicons name="information-circle" size={20} color="white" />
                                </View>
                                <Text className="text-xl font-bold text-gray-900">Order Information</Text>
                            </View>
                            
                            <View className="space-y-4">
                                <View className="flex-row justify-between items-center">
                                    <Text className="text-gray-600 font-medium">Order Date</Text>
                                    <Text className="text-gray-900 font-semibold">{new Date(order.created_at).toLocaleDateString()}</Text>
                                </View>
                                
                                <View className="flex-row justify-between items-center">
                                    <Text className="text-gray-600 font-medium">Status</Text>
                                    <Animated.View 
                                        className={`px-4 py-2 rounded-2xl border ${getStatusColor(order.status)}`}
                                        style={{ transform: [{ scale: pulseValue }] }}
                                    >
                                        <Text className="text-xs font-bold capitalize">{order.status}</Text>
                                    </Animated.View>
                                </View>
                                
                                <View className="flex-row justify-between items-center">
                                    <Text className="text-gray-600 font-medium">Total Amount</Text>
                                    <Text className="text-xl font-bold text-gray-900">₹{Number(order.total_amount).toFixed(2)}</Text>
                                </View>
                                
                                <View className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-4">
                                    <Text className="text-gray-600 font-medium mb-1">Payment ID</Text>
                                    <Text className="text-gray-900 font-semibold" numberOfLines={1}>{order.razorpay_payment_id}</Text>
                                </View>
                            </View>
                        </View>
                    </Animated.View>

                    {/* Support Section */}
                    <Animated.View entering={FadeInUp.delay(500)}>
                        <View className="bg-white rounded-3xl p-6 shadow-xl border border-orange-100">
                            <View className="flex-row items-center space-x-3 mb-6">
                                <View className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl items-center justify-center">
                                    <Ionicons name="headset" size={20} color="white" />
                                </View>
                                <Text className="text-xl font-bold text-gray-900">Need Help?</Text>
                            </View>
                            
                            <View className="space-y-4">
                                <TouchableOpacity className="flex-row items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl">
                                    <Ionicons name="sync-circle-outline" size={24} color="#FF6B35" />
                                    <Text className="text-gray-900 font-semibold text-base">Return or Replace</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity className="flex-row items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl">
                                    <Ionicons name="headset-outline" size={24} color="#FF6B35" />
                                    <Text className="text-gray-900 font-semibold text-base">Contact Customer Support</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Animated.View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
