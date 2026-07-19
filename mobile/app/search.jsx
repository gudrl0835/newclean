import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { companyApi } from '../src/api/company';
import CompanyCard from '../src/components/CompanyCard';

const SORT_OPTIONS = [
  { value: 'rating', label: '⭐ 별점순' },
  { value: 'review', label: '💬 리뷰 많은순' },
  { value: 'price', label: '💰 가격 낮은순' },
];

export default function Search() {
  const { sido, sigungu } = useLocalSearchParams();
  const [sort, setSort] = useState('rating');
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCompanies = useCallback(async () => {
    if (!sido) {
      setCompanies([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await companyApi.searchByRegion(sido, sigungu || '', sort);
      setCompanies(res.data || []);
    } catch (e) {
      setError('업체 목록을 불러오는 데 실패했어요. 잠시 후 다시 시도해주세요.');
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  }, [sido, sigungu, sort]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const mapped = companies.map((c) => ({
    id: c.id,
    name: c.companyName,
    avgRating: c.bayesianRating,
    reviewCount: c.reviewCount,
    sido: c.sido,
    sigungu: c.sigungu,
    priceMin: c.basePrice,
    isVerified: c.verified,
    profileImage: c.profileImage,
  }));

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ padding: 16 }}>
      <Text className="text-gray-500 text-sm mb-1">📍 {sido} {sigungu}</Text>
      <Text className="font-bold text-gray-900 text-lg mb-4">청소 업체 {mapped.length}개</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
        {SORT_OPTIONS.map((opt) => (
          <Pressable
            key={opt.value}
            onPress={() => setSort(opt.value)}
            className={`px-4 py-2 rounded-full mr-2 ${sort === opt.value ? 'bg-blue-500' : 'bg-white border border-gray-200'}`}
          >
            <Text className={`text-sm font-medium ${sort === opt.value ? 'text-white' : 'text-gray-600'}`}>{opt.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator />
      ) : error ? (
        <View className="card items-center py-10">
          <Text className="text-3xl mb-2">😥</Text>
          <Text className="text-gray-600 font-medium">{error}</Text>
        </View>
      ) : mapped.length === 0 ? (
        <View className="card items-center py-12">
          <Text className="text-4xl mb-3">🧹</Text>
          <Text className="font-bold text-gray-800 text-lg mb-1">해당 지역에 업체가 없어요</Text>
          <Text className="text-gray-400 text-sm">다른 지역으로 검색해보세요</Text>
        </View>
      ) : (
        <View className="gap-3">
          {mapped.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}
