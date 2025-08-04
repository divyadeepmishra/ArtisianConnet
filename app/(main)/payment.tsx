import React from 'react';
import { View, StyleSheet, Alert, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function PaymentScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const order = params.order ? JSON.parse(params.order) : null;

  const generatePaymentHtml = (orderData) => {
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
                error_code: response.error.code,
                error_description: response.error.description,
              }));
            });
            rzp1.open();
          </script>
        </body>
      </html>
    `;
  };

  const handleWebViewMessage = (event) => {
    const data = JSON.parse(event.nativeEvent.data);
    switch (data.status) {
      case 'success':
        Alert.alert('Payment Successful!', 'Thank you for your order.');
        router.replace('/profile');
        break;
      case 'failed':
        Alert.alert('Payment Failed', data.error_description || 'Something went wrong.');
        router.back();
        break;
      case 'cancelled':
        Alert.alert('Payment Cancelled', 'You can complete your purchase anytime.');
        router.back();
        break;
    }
  };

  if (!order) {
    return <View><Text>Error: Order details not found.</Text></View>;
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
