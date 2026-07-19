import { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { adminApi } from '../../src/api/admin';

function StatCard({ label, value, borderColor, onPress, wide }) {
  const Wrapper = onPress ? Pressable : View;
  return (
    <Wrapper
      onPress={onPress}
      className="bg-white rounded-2xl p-5 flex-1"
      style={{ borderLeftWidth: 4, borderLeftColor: borderColor, minWidth: wide ? '45%' : undefined }}
    >
      <Text className="text-gray-500 text-sm mb-1">{label}</Text>
      <Text className="text-3xl font-bold text-gray-900">{value ?? '-'}</Text>
    </Wrapper>
  );
}

export default function AdminDashboard() {
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .getStats()
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const goToCompanies = (status) => router.push({ pathname: '/(admin)/companies', params: { status } });

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ padding: 16, paddingTop: insets.top + 16, paddingBottom: 40 }}>
      <View className="mb-6">
        <Text className="text-2xl font-bold text-gray-900">대시보드</Text>
        <Text className="text-gray-500 text-sm mt-1">클린매칭 서비스 현황</Text>
      </View>

      <View className="flex-row flex-wrap gap-3 mb-6">
        <StatCard label="전체 회원" value={stats?.totalUsers} borderColor="#60a5fa" wide />
        <StatCard label="고객" value={stats?.totalCustomers} borderColor="#4ade80" wide />
        <StatCard label="업체" value={stats?.totalCompanies} borderColor="#c084fc" wide />
        <StatCard label="전체 의뢰" value={stats?.totalRequests} borderColor="#fb923c" wide />
      </View>

      <Text className="text-lg font-bold text-gray-900 mb-3">업체 승인 현황</Text>
      <View className="flex-row gap-3 mb-6">
        <StatCard label="⏳ 심사 대기" value={stats?.pendingCompanies} borderColor="#facc15" onPress={() => goToCompanies('PENDING')} />
        <StatCard label="✅ 승인 완료" value={stats?.approvedCompanies} borderColor="#4ade80" onPress={() => goToCompanies('APPROVED')} />
        <StatCard label="❌ 거절" value={stats?.rejectedCompanies} borderColor="#f87171" onPress={() => goToCompanies('REJECTED')} />
      </View>

      {stats?.pendingCompanies > 0 && (
        <Pressable onPress={() => goToCompanies('PENDING')} className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
          <Text className="font-bold text-yellow-800">⚠️ 승인 대기 업체가 있습니다</Text>
          <Text className="text-yellow-700 text-sm mt-1">{stats.pendingCompanies}개 업체가 승인을 기다리고 있습니다.</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}
