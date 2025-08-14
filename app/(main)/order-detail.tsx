// app/(main)/order-detail.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { createSupabaseWithClerk } from '../../lib/supabaseWithClerk';

export default function OrderDetailScreen() {
    const { orderId } = useLocalSearchParams<{ orderId: string }>();
    const { getToken } = useAuth();
    const router = useRouter();

    const [order, setOrder] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCancelling, setIsCancelling] = useState(false);

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

                            // Edge Function returns { order: {...} }
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

    if (isLoading) {
        return (
            <SafeAreaView style={styles.center}>
                <ActivityIndicator size="large" color="#1F2937" />
            </SafeAreaView>
        );
    }

    if (!order) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#1F2937" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Order Not Found</Text>
                    <View style={{ width: 24 }} />
                </View>
                <View style={styles.center}>
                    <Text>Could not find the requested order.</Text>
                </View>
            </SafeAreaView>
        );
    }

    const firstItem = order.order_items?.[0];
    const product = firstItem?.products ?? {};

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.title}>Order Details</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {product.image_url && (
                    <Image source={{ uri: product.image_url }} style={styles.productImage} />
                )}

                <View style={styles.actionSection}>
                    <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="navigate-outline" size={20} color="white" />
                        <Text style={styles.actionButtonText}>Track Package</Text>
                    </TouchableOpacity>

                    {order.status !== 'cancelled' && (
                        <TouchableOpacity
                            style={[styles.actionButton, styles.secondaryButton]}
                            onPress={handleCancelOrder}
                            disabled={isCancelling}
                        >
                            <Ionicons name="close-circle-outline" size={20} color="#4B5563" />
                            <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
                                {isCancelling ? "Cancelling..." : "Cancel Order"}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Order Information</Text>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Order Date</Text>
                        <Text style={styles.detailValue}>{new Date(order.created_at).toLocaleDateString()}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Status</Text>
                        <Text style={[styles.detailValue, { color: '#16A34A', textTransform: 'capitalize' }]}>{order.status}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Total Amount</Text>
                        <Text style={styles.detailValue}>₹{Number(order.total_amount).toFixed(2)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Payment ID</Text>
                        <Text style={styles.detailValue} numberOfLines={1}>{order.razorpay_payment_id}</Text>
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Need Help?</Text>
                    <TouchableOpacity style={styles.supportRow}>
                        <Ionicons name="sync-circle-outline" size={22} color="#4B5563" />
                        <Text style={styles.supportText}>Return or Replace</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.supportRow}>
                        <Ionicons name="headset-outline" size={22} color="#4B5563" />
                        <Text style={styles.supportText}>Contact Customer Support</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', backgroundColor: 'white',
    },
    title: { fontSize: 20, fontWeight: 'bold' },
    scrollContainer: { padding: 16 },
    productImage: { width: '100%', height: 300, borderRadius: 16, marginBottom: 16, backgroundColor: '#E5E7EB' },
    card: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#111827' },
    actionSection: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, gap: 16 },
    actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1F2937', padding: 14, borderRadius: 12 },
    actionButtonText: { color: 'white', fontWeight: 'bold', marginLeft: 8 },
    secondaryButton: { backgroundColor: '#E5E7EB' },
    secondaryButtonText: { color: '#4B5563' },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    detailLabel: { fontSize: 16, color: 'gray' },
    detailValue: { fontSize: 16, fontWeight: '500', flex: 1, textAlign: 'right' },
    supportRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
    supportText: { fontSize: 16, color: '#1F2937', marginLeft: 12 },
});
