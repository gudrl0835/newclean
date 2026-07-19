import { useState, useEffect } from 'react';
import { View, Text, Image, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import StarRating from '../../src/components/StarRating';
import useAuthStore from '../../src/store/authStore';
import { companyApi } from '../../src/api/company';

export default function CompanyProfile() {
  const { id } = useLocalSearchParams();
  const { isLoggedIn, user } = useAuthStore();
  const [tab, setTab] = useState('info');
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    companyApi
      .getCompany(id)
      .then((res) => setCompany(res.data))
      .catch(() => setError('업체 정보를 불러오지 못했어요.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleRequest = () => {
    if (!isLoggedIn) {
      router.push('/(auth)/login');
      return;
    }
    if (user?.role?.toLowerCase() !== 'customer') {
      return;
    }
    router.push(`/request/${id}`);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </View>
    );
  }

  if (error || !company) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-4xl mb-3">😥</Text>
        <Text className="font-bold text-gray-700 text-lg">{error || '업체를 찾을 수 없어요'}</Text>
      </View>
    );
  }

  const reviews = company.reviews || [];

  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="h-44 bg-blue-600 items-center justify-center">
          {company.profileImage ? (
            <Image source={{ uri: company.profileImage }} className="w-full h-full" resizeMode="cover" style={{ opacity: 0.6 }} />
          ) : (
            <Text style={{ fontSize: 72 }}>🧹</Text>
          )}
        </View>

        <View className="px-4 -mt-6">
          <View className="card mb-4">
            <View className="flex-row items-center gap-2 mb-1">
              <Text className="text-xl font-bold text-gray-900">{company.companyName}</Text>
              {company.verified && <MaterialIcons name="verified" size={20} color="#1E90FF" />}
            </View>
            <View className="flex-row items-center gap-2 mb-2">
              <StarRating rating={company.bayesianRating ?? 0} size={15} />
              <Text className="text-gray-400 text-sm">리뷰 {company.reviewCount ?? 0}개</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Feather name="map-pin" size={13} color="#9ca3af" />
              <Text className="text-gray-400 text-sm">{company.sido} {company.sigungu}</Text>
            </View>
            <Text className="text-gray-600 text-sm leading-relaxed mt-2">{company.description}</Text>

            <View className="flex-row gap-4 mt-4 pt-4 border-t border-gray-100">
              {company.serviceRadius != null && (
                <View className="items-center flex-1">
                  <Text className="text-blue-500 font-bold text-lg">{company.serviceRadius}km</Text>
                  <Text className="text-gray-400 text-xs">서비스 반경</Text>
                </View>
              )}
              {company.basePrice != null && (
                <View className="items-center flex-1">
                  <Text className="text-blue-500 font-bold text-lg">{company.basePrice.toLocaleString()}원~</Text>
                  <Text className="text-gray-400 text-xs">기본 요금</Text>
                </View>
              )}
            </View>
          </View>

          <View className="flex-row bg-gray-100 rounded-xl p-1 mb-4">
            {[
              { key: 'info', label: '서비스 정보' },
              { key: 'reviews', label: `리뷰 (${company.reviewCount ?? 0})` },
            ].map((t) => (
              <Pressable
                key={t.key}
                onPress={() => setTab(t.key)}
                className={`flex-1 py-2.5 rounded-lg items-center ${tab === t.key ? 'bg-white' : ''}`}
              >
                <Text className={`text-sm font-semibold ${tab === t.key ? 'text-blue-500' : 'text-gray-500'}`}>{t.label}</Text>
              </Pressable>
            ))}
          </View>

          {tab === 'info' && (
            <View className="card items-center py-10">
              <Text className="text-3xl mb-2">📋</Text>
              <Text className="font-semibold text-gray-700">서비스 항목 준비 중</Text>
              <Text className="text-gray-400 text-sm">업체에 직접 문의해주세요</Text>
            </View>
          )}

          {tab === 'reviews' && (
            <View className="gap-3">
              <View className="flex-row items-center gap-3 card bg-blue-50 border-blue-100">
                <View className="items-center" style={{ minWidth: 70 }}>
                  <Text className="text-4xl font-bold text-blue-500">{(company.bayesianRating ?? 0).toFixed(1)}</Text>
                  <StarRating rating={company.bayesianRating ?? 0} size={14} showNumber={false} />
                </View>
                <View className="flex-1">
                  <Text className="text-sm text-gray-600">총 {company.reviewCount ?? 0}개의 리뷰</Text>
                  <Text className="text-xs text-gray-400 mt-0.5">✅ 실제 완료된 의뢰에만 리뷰 작성 가능</Text>
                </View>
              </View>

              {reviews.length === 0 ? (
                <View className="card items-center py-10">
                  <Text className="text-3xl mb-2">💬</Text>
                  <Text className="text-gray-500 font-medium">아직 리뷰가 없어요</Text>
                </View>
              ) : (
                reviews.map((review) => (
                  <View key={review.id} className="card">
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-row items-center gap-2">
                        <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center">
                          <Text className="text-blue-500 font-bold text-sm">{review.customerName?.[0] || '?'}</Text>
                        </View>
                        <Text className="font-medium text-gray-900 text-sm">{review.customerName}</Text>
                      </View>
                      <StarRating rating={review.score} size={12} showNumber={false} />
                    </View>
                    <Text className="text-gray-700 text-sm leading-relaxed">{review.content}</Text>
                  </View>
                ))
              )}
            </View>
          )}
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4 flex-row gap-3">
        <Pressable
          onPress={() => (isLoggedIn ? router.push('/chats') : router.push('/(auth)/login'))}
          className="border-2 border-blue-500 rounded-xl py-3 px-5 items-center justify-center flex-row gap-2"
          style={{ flex: 1 }}
        >
          <Feather name="message-square" size={18} color="#1E90FF" />
          <Text className="text-blue-500 font-semibold">1:1 문의</Text>
        </Pressable>
        <Pressable onPress={handleRequest} className="bg-blue-500 rounded-xl py-3 items-center justify-center" style={{ flex: 2 }}>
          <Text className="text-white font-bold">의뢰하기</Text>
        </Pressable>
      </View>
    </View>
  );
}
