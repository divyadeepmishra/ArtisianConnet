import React, { useState } from 'react';
import { View, Text, SafeAreaView, TextInput, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@clerk/clerk-expo';
import { supabase } from '../../supabase'; // Import our base supabase client
import { decode } from 'base64-arraybuffer';

export default function AddProductScreen() {
  const { getToken, userId } = useAuth(); // Get the standard getToken function

  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission Denied", "You've refused to allow this app to access your photos!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
      base64: true, // Crucial for Supabase upload
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const handleListProduct = async () => {
    if (!productName || !price || !image || !userId) {
      Alert.alert("Missing Information", "Please fill in all fields, select an image, and be signed in.");
      return;
    }
    setIsLoading(true);

    try {
      const clerkToken = await getToken(); 
      if (!clerkToken) throw new Error("Could not get Clerk token.");

      const { error: sessionError } = await supabase.auth.setSession({
        access_token: clerkToken,
        refresh_token: clerkToken,
      });

      if (sessionError) throw sessionError;

      const fileExt = image.uri.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const base64 = image.base64;
      if (!base64) throw new Error("Image does not have base64 data.");

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, decode(base64), { contentType: `image/${fileExt}` });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(uploadData.path);

      const imageUrl = urlData.publicUrl;

      const { error: insertError } = await supabase.from('products').insert({
        name: productName,
        description: description,
        price: parseFloat(price),
        imageUrl: imageUrl,
        seller_id: userId, 
      });

      if (insertError) throw insertError;

      Alert.alert("Success!", "Your product has been listed.");
      setProductName('');
      setDescription('');
      setPrice('');
      setImage(null);

    } catch (error: any) {
      console.error("Error listing product:", error);
      Alert.alert("Error", error.message || "There was a problem listing your product.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView>
          <View className="p-6">
            <Text className="text-3xl font-extrabold text-gray-900 mb-6">List a New Item</Text>

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
              placeholder="e.g., Handcrafted Wooden Bowl"
              placeholderTextColor={'#A1A1AA'}
              value={productName}
              onChangeText={setProductName}
              className="bg-gray-100 text-base text-gray-900 p-4 mb-4 rounded-xl w-full"
            />

            <Text className="text-base font-medium text-gray-700 mb-2">Description</Text>
            <TextInput
              placeholder="Describe your product..."
              placeholderTextColor={'#A1A1AA'}
              value={description}
              onChangeText={setDescription}
              multiline
              className="bg-gray-100 text-base text-gray-900 p-4 h-28 mb-4 rounded-xl w-full"
              style={{ textAlignVertical: 'top' }}
            />

            <Text className="text-base font-medium text-gray-700 mb-2">Price ($)</Text>
            <TextInput
              placeholder="e.g., 25.00"
              placeholderTextColor={'#A1A1AA'}
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