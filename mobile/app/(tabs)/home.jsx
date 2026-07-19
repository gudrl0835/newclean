import { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { companyApi } from '../../src/api/company';
import CompanyCard from '../../src/components/CompanyCard';

const SIDO_LIST = ['서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'];

const SIGUNGU_MAP = {
  '서울': ['강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'],
  '경기': ['수원시', '성남시', '고양시', '용인시', '부천시', '안산시', '안양시', '남양주시', '화성시', '평택시'],
  '인천': ['계양구', '남동구', '동구', '미추홀구', '부평구', '서구', '연수구', '중구'],
  '부산': ['강서구', '금정구', '남구', '동구', '동래구', '부산진구', '북구', '사상구', '사하구', '서구', '수영구', '연제구', '영도구', '중구', '해운대구'],
};

function Chip({ label, selected, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      className={`px-4 py-2 rounded-full mr-2 ${selected ? 'bg-blue-500' : 'bg-white border border-gray-200'}`}
    >
      <Text className={`text-sm font-medium ${selected ? 'text-white' : 'text-gray-600'}`}>{label}</Text>
    </Pressable>
  );
}

export default function Home() {
  const [sido, setSido] = useState('');
  const [sigungu, setSigungu] = useState('');
  const [topCompanies, setTopCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);

  const sigunguList = SIGUNGU_MAP[sido] || [];

  useEffect(() => {
    companyApi
      .getTopCompanies()
      .then((res) => setTopCompanies(res.data || []))
      .catch(() => setTopCompanies([]))
      .finally(() => setLoadingCompanies(false));
  }, []);

  const handleSearch = () => {
    if (!sido) return;
    router.push({ pathname: '/search', params: { sido, sigungu } });
  };

  const mappedTop = topCompanies.map((c) => ({
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
    <View className="flex-1 bg-gray-50">
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <View className="items-center py-6">
        <Text className="text-blue-500 font-semibold text-sm mb-2">투명한 청소 서비스 플랫폼</Text>
        <Text className="text-2xl font-bold text-gray-900 text-center leading-snug">
          믿을 수 있는 청소 업체를{'\n'}
          <Text className="text-blue-500">지금 바로 찾아보세요</Text>
        </Text>
      </View>

      <View className="card">
        <Text className="text-sm font-semibold text-gray-700 mb-2">시/도 선택</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          {SIDO_LIST.map((s) => (
            <Chip key={s} label={s} selected={sido === s} onPress={() => { setSido(s); setSigungu(''); }} />
          ))}
        </ScrollView>

        {sido ? (
          <>
            <Text className="text-sm font-semibold text-gray-700 mb-2">시/군/구 선택 (선택)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              {sigunguList.map((s) => (
                <Chip key={s} label={s} selected={sigungu === s} onPress={() => setSigungu(s)} />
              ))}
            </ScrollView>
          </>
        ) : null}

        <Pressable
          onPress={handleSearch}
          disabled={!sido}
          className="flex-row items-center justify-center gap-2 border-2 border-blue-500 rounded-xl py-3"
          style={{ opacity: sido ? 1 : 0.5 }}
        >
          <Feather name="search" size={18} color="#1E90FF" />
          <Text className="text-blue-500 font-semibold ml-2">업체 검색</Text>
        </Pressable>
      </View>

      <View className="mt-8">
        <Text className="text-xl font-bold text-gray-900 mb-4">⭐ 인기 업체 TOP</Text>

        {loadingCompanies ? (
          <ActivityIndicator />
        ) : mappedTop.length === 0 ? (
          <View className="card items-center py-10">
            <Text className="text-3xl mb-2">🧹</Text>
            <Text className="text-gray-500 font-medium">아직 등록된 업체가 없어요</Text>
          </View>
        ) : (
          <View className="gap-3">
            {mappedTop.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </View>
        )}
      </View>
    </ScrollView>

      <Pressable
        onPress={() => router.push('/chatbot')}
        className="bg-blue-500 rounded-full items-center justify-center"
        style={{ position: 'absolute', bottom: 24, right: 20, width: 56, height: 56, elevation: 4 }}
      >
        <Feather name="message-circle" size={26} color="#fff" />
      </Pressable>
    </View>
  );
}
