import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@clerk/clerk-expo';
import { decode } from 'base64-arraybuffer';
import { createSupabaseWithClerk } from '../../lib/supabaseWithClerk';


export default function AddProductScreen() {
  const { getToken, userId } = useAuth();

  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Denied', 'You need to allow photo access to pick an image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const handleListProduct = async () => {
    if (!productName || !price || !image || !userId) {
      Alert.alert('Missing Info', 'Fill all fields and select an image.');
      return;
    }

    setIsLoading(true);
    try {
      const clerkToken = await getToken();
      if (!clerkToken) throw new Error('Failed to get Authenticated token.');

      const supabaseWithClerk = createSupabaseWithClerk(clerkToken);

      const fileExt = image.uri.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const base64 = image.base64;
      if (!base64) throw new Error('No base64 image data.');

      const { data: uploadData, error: uploadError } = await supabaseWithClerk.storage
        .from('product-images')
        .upload(fileName, decode(base64), { contentType: `image/${fileExt}` });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabaseWithClerk.storage
        .from('product-images')
        .getPublicUrl(uploadData.path);

      const imageUrl = urlData.publicUrl;

      const { error: insertError } = await supabaseWithClerk.from('products').insert({
        name: productName,
        description,
        price: parseFloat(price),
        image_url: imageUrl, 
        seller_id: userId,
      });

      if (insertError) throw insertError;

      Alert.alert('Success', 'Your product was listed.');
      setProductName('');
      setDescription('');
      setPrice('');
      setImage(null);
    } catch (error: any) {
      console.error('Error:', error);
      Alert.alert('Error', error.message || 'Problem listing product.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView>
          <View className="p-6">
            <Text className="text-3xl font-extrabold text-gray-900 mb-6">List an Item for Sale</Text>

            <TouchableOpacity
              onPress={pickImage}
              className="bg-gray-100 border border-dashed border-gray-300 rounded-xl h-40 items-center justify-center mb-6"
            >
              {image ? (
                <Image source={{ uri: image.uri }} className="w-full h-full rounded-xl" />
              ) : (
                <View className="items-center">
                  <Ionicons name="cloud-upload-outline" size={40} color="#9CA3AF" />
                  <Text className="text-gray-500 font-medium mt-2">Upload Image</Text>
                </View>
              )}
            </TouchableOpacity>

            <Text className="text-base font-medium text-gray-700 mb-2">Product Name</Text>
            <TextInput
              placeholder="e.g., Handcrafted Bowl"
              placeholderTextColor="#A1A1AA"
              value={productName}
              onChangeText={setProductName}
              className="bg-gray-100 text-base text-gray-900 p-4 mb-4 rounded-xl w-full"
            />

            <Text className="text-base font-medium text-gray-700 mb-2">Description</Text>
            <TextInput
              placeholder="Describe your product..."
              placeholderTextColor="#A1A1AA"
              value={description}
              onChangeText={setDescription}
              multiline
              className="bg-gray-100 text-base text-gray-900 p-4 h-28 mb-4 rounded-xl w-full"
              style={{ textAlignVertical: 'top' }}
            />

            <Text className="text-base font-medium text-gray-700 mb-2">Price (₹)</Text>
            <TextInput
              placeholder="e.g., 199.00"
              placeholderTextColor="#A1A1AA"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              className="bg-gray-100 text-base text-gray-900 p-4 mb-4 rounded-xl w-full"
            />

            <TouchableOpacity
              onPress={handleListProduct}
              disabled={isLoading}
              className="bg-gray-900 p-4 rounded-xl w-full items-center mt-4"
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-bold text-base">List My Item</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
