import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function CategoryFilter({ 
  categories, 
  selectedCategory, 
  onCategoryChange 
}: CategoryFilterProps) {
  return (
    <View className="space-y-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-bold text-gray-900">Categories</Text>
        <TouchableOpacity>
          <Text className="text-blue-600 font-medium">View All</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 4 }}
      >
        <View className="flex-row space-x-4">
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => onCategoryChange(category.id)}
              className="items-center space-y-2"
            >
              <View className={`
                w-16 h-16 rounded-full items-center justify-center
                ${selectedCategory === category.id 
                  ? 'bg-blue-100 border-2 border-blue-300' 
                  : 'bg-gray-100'
                }
              `}>
                <Text className="text-2xl">{category.icon}</Text>
              </View>
              <Text className="text-xs font-medium text-gray-700 text-center">
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
} 