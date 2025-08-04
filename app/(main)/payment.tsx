// in app/(main)/payment.tsx

import React from 'react';
import { View, StyleSheet, Alert, Text, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { useCart } from '../(context)/CartContext';

export default function PaymentScreen() {
    const params = useLocalSearchParams<{ order: string, items: string }>();
    const router = useRouter();
    const { getToken } = useAuth();
    const { clearCart, totalPrice, items } = useCart(); // Get items and totalPrice

    const order = params.order ? JSON.parse(params.order) : null;

    const generatePaymentHtml = (orderData: any) => {
        return `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
        </head>
        <body>
          <script>
            var options = {
              "key": "${process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID}",
              "amount": "${orderData.amount}",
              "currency": "INR",
              "name": "ArtisanConnect",
              "description": "Payment for your order",
              "order_id": "${orderData.id}",
              "handler": function (response){
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  status: 'success',
                  paymentId: response.razorpay_payment_id,
                  orderId: response.razorpay_order_id,
                  signature: response.razorpay_signature
                }));
              },
              "modal": {
                "ondismiss": function(){
                  window.ReactNativeWebView.postMessage(JSON.stringify({ status: 'cancelled' }));
                }
              },
              "theme": { "color": "#111827" }
            };
            var rzp1 = new Razorpay(options);
            rzp1.on('payment.failed', function (response){
              window.ReactNativeWebView.postMessage(JSON.stringify({
                status: 'failed',
                error_description: response.error.description,
              }));
            });
            rzp1.open();
          </script>
        </body>
      </html>
    `;
    };

    const handleWebViewMessage = async (event: any) => {
        const data = JSON.parse(event.nativeEvent.data);

        switch (data.status) {
            case 'success':
                // Payment successful on the app, now verify it on the backend
                try {
                    const token = await getToken();
                    if (!token) throw new Error("Authentication failed.");

                    const response = await fetch('https://ugsmjhaztnlhmdgpwvje.supabase.co/functions/v1/verify-payment', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            razorpay_payment_id: data.paymentId,
                            razorpay_order_id: data.orderId,
                            razorpay_signature: data.signature, 
                            items: items,
                            totalAmount: totalPrice + 50,
                        }),
                    });

                    const result = await response.json();

                    if (!response.ok || result.error) {
                        throw new Error(result.error || 'Payment verification failed on server.');
                    }

                    Alert.alert('Payment Verified!', 'Your order has been successfully placed.');
                    clearCart();
                    router.replace('/(main)/orders'); // Navigate to orders page

                } catch (error) {
                    Alert.alert('Verification Failed', error.message);
                    router.replace('/(tabs)/cart');
                }
                break;

            case 'failed':
                Alert.alert('Payment Failed', data.error_description || 'Something went wrong.');
                router.back();
                break;

            case 'cancelled':
                router.back();
                break;
        }
    };

    if (!order) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
                <Text>Loading Payment...</Text>
            </View>
        );
    }

    return (
        <WebView
            source={{ html: generatePaymentHtml(order) }}
            style={styles.container}
            onMessage={handleWebViewMessage}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});