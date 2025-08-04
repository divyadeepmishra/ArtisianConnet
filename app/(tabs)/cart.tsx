// in app/(tabs)/cart.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '../(context)/CartContext';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@clerk/clerk-expo'; // Import useAuth
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';

export default function CartScreen() {
  const { items, incrementQuantity, decrementQuantity, totalPrice, clearCart } = useCart();
  const { getToken } = useAuth(); // Get the getToken function
  const [isPaying, setIsPaying] = useState(false);
  const router = useRouter();

const handleCheckout = async () => {
  setIsPaying(true);
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("You are not logged in. Please log in to continue.");
    }

    const finalAmount = Math.round(totalPrice + 50);
    
    // 1. Create Razorpay Order via backend
    const response = await fetch(
      'https://ugsmjhaztnlhmdgpwvje.supabase.co/functions/v1/create-razorpay-order',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: finalAmount,
          description: 'Payment for your order at ArtisanConnect',
        }),
      }
    );

    const orderData = await response.json();
    if (!response.ok || orderData.error) {
      throw new Error(orderData.error || 'Failed to create order.');
    }

    // 2. Send order to in-app payment screen
    router.push({
      pathname: '/(main)/payment',
      params: { order: JSON.stringify(orderData) }
    });

  } catch (error) {
    Alert.alert('Error', `Could not create order: ${error.message}`);
    console.error("Checkout Error:", error);
  } finally {
    setIsPaying(false);
  }
};

  const renderCartItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Image source={{ uri: item.image_url }} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.itemPrice}>₹{item.price.toFixed(2)}</Text>
      </View>
      <View style={styles.quantityControl}>
        <TouchableOpacity onPress={() => decrementQuantity(item.id)}>
          <Ionicons name="remove-circle-outline" size={28} color="#6B7280" />
        </TouchableOpacity>
        <Text style={styles.quantityText}>{item.quantity}</Text>
        <TouchableOpacity onPress={() => incrementQuantity(item.id)}>
          <Ionicons name="add-circle" size={28} color="#1F2937" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyCart = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="cart-outline" size={80} color="#D1D5DB" />
      <Text style={styles.emptyText}>Your Cart is Empty</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>My Cart</Text>
      </View>
      <FlatList
        data={items}
        renderItem={renderCartItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={renderEmptyCart}
      />
      {items.length > 0 && (
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>₹{totalPrice.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={styles.summaryValue}>₹50.00</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{(totalPrice + 50).toFixed(2)}</Text>
          </View>
          <TouchableOpacity
            style={[styles.checkoutButton, isPaying && { backgroundColor: '#9CA3AF' }]}
            onPress={handleCheckout}
            disabled={isPaying}
          >
            {isPaying ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', backgroundColor: 'white',
  },
  title: { fontSize: 24, fontWeight: '800', textAlign: 'center', color: '#111827' },
  itemContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'white',
    padding: 12, borderRadius: 12, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  itemImage: { width: 60, height: 60, borderRadius: 8 },
  itemDetails: { flex: 1, marginLeft: 12 },
  itemName: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  itemPrice: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  quantityControl: { flexDirection: 'row', alignItems: 'center' },
  quantityText: { fontSize: 18, fontWeight: '600', marginHorizontal: 12 },
  summaryContainer: {
    padding: 20, borderTopWidth: 1, borderTopColor: '#E5E7EB', backgroundColor: 'white',
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 16, color: '#6B7280' },
  summaryValue: { fontSize: 16, fontWeight: '600' },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', marginTop: 12,
    paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB',
  },
  totalLabel: { fontSize: 18, fontWeight: 'bold' },
  totalValue: { fontSize: 18, fontWeight: 'bold' },
  checkoutButton: {
    backgroundColor: '#111827', padding: 16, borderRadius: 12,
    alignItems: 'center', marginTop: 20,
  },
  checkoutButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: '30%' },
  emptyText: { fontSize: 20, fontWeight: 'bold', color: '#374151', marginTop: 16 },
});