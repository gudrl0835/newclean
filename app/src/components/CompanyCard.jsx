import { View, Text, Image, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import StarRating from './StarRating';

export default function CompanyCard({ company }) {
  const { id, name, profileImage, avgRating, reviewCount, sido, sigungu, priceMin, isVerified } = company;

  return (
    <Pressable onPress={() => router.push(`/company/${id}`)} className="card flex-row gap-4">
      <View className="w-20 h-20 rounded-xl overflow-hidden bg-blue-50 items-center justify-center">
        {profileImage ? (
          <Image source={{ uri: profileImage }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <Text className="text-3xl">🧹</Text>
        )}
      </View>

      <View className="flex-1">
        <View className="flex-row items-center gap-1.5 mb-1">
          <Text className="font-bold text-gray-900 text-base flex-shrink" numberOfLines={1}>{name}</Text>
          {isVerified && <MaterialIcons name="verified" size={16} color="#1E90FF" />}
        </View>

        <View className="flex-row items-center gap-2 mb-2">
          <StarRating rating={avgRating ?? 0} size={13} />
          <Text className="text-gray-400 text-xs">리뷰 {(reviewCount ?? 0).toLocaleString()}개</Text>
        </View>

        <View className="flex-row items-center gap-1 mb-2">
          <Feather name="map-pin" size={11} color="#9ca3af" />
          <Text className="text-gray-400 text-xs">{sido} {sigungu}</Text>
        </View>

        <Text className="text-blue-500 font-semibold text-sm">
          {(priceMin ?? 0).toLocaleString()}원~ 부터
        </Text>
      </View>
    </Pressable>
  );
}
