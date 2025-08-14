import React, { useState, useCallback, useRef } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@clerk/clerk-expo';
import { Link, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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
        if (orders.length === 0) setIsLoading(true); // ✅ only show loader if empty

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

    const renderOrderItem = ({ item, index }) => {
        const firstItemImage = item.order_items?.[0]?.products?.image_url;
        const orderNumber = orders.length - index;
        return (
            <Link href={{ pathname: "/(main)/order-detail", params: { orderId: item.id } }} asChild>
                <TouchableOpacity>
                    <View style={styles.orderCard}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.orderId}>Order #{orderNumber}</Text>
                            <Text style={styles.orderDate}>
                                {new Date(item.created_at).toLocaleDateString()}
                            </Text>
                        </View>
                        <View style={styles.cardBody}>
                            {firstItemImage && (
                                <Image source={{ uri: firstItemImage }} style={styles.productImage} />
                            )}
                            <Text style={styles.detailText}>
                                Total Amount:{' '}
                                <Text style={styles.amountText}>
                                    ₹{(Number(item.total_amount) + 50).toFixed(2)}
                                </Text>
                            </Text>
                            <Text style={styles.detailText}>
                                Status: <Text style={styles.statusText}>{item.status}</Text>
                            </Text>
                            <Text style={styles.detailText}>
                                Payment ID: {item.razorpay_payment_id}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </Link>
        );
    };

    const renderEmptyList = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={60} color="#9CA3AF" />
            <Text style={styles.emptyText}>No Orders Yet</Text>
            <Text style={styles.emptySub}>
                When you buy something, it will show up here.
            </Text>
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
                <Text style={styles.title}>My Orders</Text>
                <View style={{ width: 24 }} />
            </View>

            {isLoading ? (
                <ActivityIndicator size="large" color="#4B5563" style={{ flex: 1 }} />
            ) : (
                <FlatList
                    data={orders}
                    renderItem={renderOrderItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={
                        orders.length === 0 ? { flex: 1 } : styles.listContainer
                    }
                    ListEmptyComponent={renderEmptyList}
                    onRefresh={fetchOrders} // ✅ pull to refresh
                    refreshing={isFetching.current}
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
    listContainer: { padding: 16 },
    orderCard: {
        backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16,
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6', paddingBottom: 12, marginBottom: 12,
    },
    orderId: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
    orderDate: { fontSize: 14, color: '#6B7280' },
    cardBody: {},
    productImage: { width: 60, height: 60, borderRadius: 8, marginBottom: 12 },
    detailText: { fontSize: 14, color: '#6B7280', marginBottom: 4, flexWrap: 'wrap' },
    amountText: { fontWeight: '600', color: '#111827' },
    statusText: { fontWeight: '600', color: '#16A34A', textTransform: 'capitalize' },
    emptyContainer: {
        flex: 1, alignItems: 'center', justifyContent: 'center',
        padding: 20, paddingTop: '30%',
    },
    emptyText: { fontSize: 18, fontWeight: '600', color: '#6B7280', marginTop: 12 },
    emptySub: { fontSize: 14, color: '#9CA3AF', marginTop: 4, textAlign: 'center' },
});
