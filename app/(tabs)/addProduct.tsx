import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { decode } from 'base64-arraybuffer';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createSupabaseWithClerk } from '../../lib/supabaseWithClerk';

export default function AddProductScreen() {
  const { getToken, userId } = useAuth();

  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    { id: 'pottery', name: 'Pottery', icon: '🏺' },
    { id: 'paintings', name: 'Paintings', icon: '🖼️' },
    { id: 'textiles', name: 'Textiles', icon: '🧶' },
    { id: 'sculptures', name: 'Sculptures', icon: '🗿' },
    { id: 'jewelry', name: 'Jewelry', icon: '💍' },
  ];

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
        category: category || 'other',
      });

      if (insertError) throw insertError;

      Alert.alert('Success', 'Your product was listed successfully!');
      setProductName('');
      setDescription('');
      setPrice('');
      setCategory('');
      setImage(null);
    } catch (error: any) {
      console.error('Error:', error);
      Alert.alert('Error', error.message || 'Problem listing product.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        {/* Header */}
        <View className="bg-white border-b border-gray-200 px-4 py-4">
          <Text className="text-2xl font-bold text-gray-900">List New Product</Text>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="p-4 space-y-6">
            {/* Image Upload */}
            <View className="space-y-3">
              <Text className="text-lg font-semibold text-gray-900">Product Image</Text>
              <TouchableOpacity
                onPress={pickImage}
                className="bg-white border-2 border-dashed border-gray-300 rounded-2xl h-48 items-center justify-center"
              >
                {image ? (
                  <Image source={{ uri: image.uri }} className="w-full h-full rounded-2xl" />
                ) : (
                  <View className="items-center space-y-3">
                    <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center">
                      <Ionicons name="camera-outline" size={32} color="#3B82F6" />
                    </View>
                    <View className="items-center">
                      <Text className="text-gray-900 font-semibold">Upload Product Image</Text>
                      <Text className="text-gray-500 text-sm">Tap to select from gallery</Text>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Product Name */}
            <View className="space-y-3">
              <Text className="text-lg font-semibold text-gray-900">Product Name</Text>
              <TextInput
                placeholder="e.g., Handcrafted Ceramic Bowl"
                placeholderTextColor="#9CA3AF"
                value={productName}
                onChangeText={setProductName}
                className="bg-white border border-gray-200 text-base text-gray-900 p-4 rounded-xl"
              />
            </View>

            {/* Category */}
            <View className="space-y-3">
              <Text className="text-lg font-semibold text-gray-900">Category</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 4 }}
              >
                <View className="flex-row space-x-3">
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => setCategory(cat.id)}
                      className={`
                        flex-row items-center space-x-2 px-4 py-3 rounded-xl border
                        ${category === cat.id 
                          ? 'bg-blue-100 border-blue-300' 
                          : 'bg-white border-gray-200'
                        }
                      `}
                    >
                      <Text className="text-lg">{cat.icon}</Text>
                      <Text className={`
                        font-medium
                        ${category === cat.id ? 'text-blue-700' : 'text-gray-700'}
                      `}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Description */}
            <View className="space-y-3">
              <Text className="text-lg font-semibold text-gray-900">Description</Text>
              <TextInput
                placeholder="Describe your product in detail..."
                placeholderTextColor="#9CA3AF"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                className="bg-white border border-gray-200 text-base text-gray-900 p-4 h-32 rounded-xl"
                style={{ textAlignVertical: 'top' }}
              />
            </View>

            {/* Price */}
            <View className="space-y-3">
              <Text className="text-lg font-semibold text-gray-900">Price (₹)</Text>
              <TextInput
                placeholder="e.g., 199.00"
                placeholderTextColor="#9CA3AF"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                className="bg-white border border-gray-200 text-base text-gray-900 p-4 rounded-xl"
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleListProduct}
              disabled={isLoading}
              className={`
                rounded-2xl py-4 items-center mt-6
                ${isLoading ? 'bg-gray-300' : 'bg-blue-600'}
              `}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <View className="flex-row items-center space-x-2">
                  <Ionicons name="add-circle-outline" size={20} color="white" />
                  <Text className="text-white font-bold text-lg">List My Product</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
