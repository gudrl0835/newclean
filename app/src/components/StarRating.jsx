import { View, Text } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

export default function StarRating({ rating = 0, size = 16, showNumber = true }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);

  return (
    <View className="flex-row items-center gap-1">
      <View className="flex-row items-center">
        {Array(full).fill(0).map((_, i) => (
          <FontAwesome key={`f${i}`} name="star" size={size} color="#facc15" />
        ))}
        {half && <FontAwesome name="star-half-full" size={size} color="#facc15" />}
        {Array(empty).fill(0).map((_, i) => (
          <FontAwesome key={`e${i}`} name="star-o" size={size} color="#facc15" />
        ))}
      </View>
      {showNumber && <Text className="text-gray-600 text-sm font-medium ml-1">{rating.toFixed(1)}</Text>}
    </View>
  );
}
