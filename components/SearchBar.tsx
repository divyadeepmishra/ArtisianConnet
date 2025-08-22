import { Ionicons } from '@expo/vector-icons';
import { TextInput, TouchableOpacity, View } from 'react-native';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
}

export default function SearchBar({ 
  searchQuery, 
  onSearchChange, 
  placeholder = "Search for your choice..." 
}: SearchBarProps) {
  return (
    <View className="relative">
      <View className="flex-row items-center bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-sm">
        <Ionicons name="search" size={20} color="#6B7280" />
        <TextInput
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          className="flex-1 ml-3 text-base text-gray-900"
        />
        <TouchableOpacity className="ml-2">
          <Ionicons name="filter" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>
    </View>
  );
} 