import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator, Alert, Linking } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { requestApi } from '../../src/api/request';

const STATUS_MAP = {
  PENDING: { label: '견적 대기중', color: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700' },
  QUOTED: { label: '견적 도착', color: 'bg-purple-50 border-purple-200', text: 'text-purple-700' },
  ACCEPTED: { label: '예약 확정', color: 'bg-green-50 border-green-200', text: 'text-green-700' },
  IN_PROGRESS: { label: '청소 진행중', color: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
  COMPLETED: { label: '완료', color: 'bg-gray-50 border-gray-200', text: 'text-gray-600' },
  CANCELLED: { label: '취소됨', color: 'bg-red-50 border-red-200', text: 'text-red-500' },
};

const FILTERS = ['ALL', 'PENDING', 'QUOTED', 'ACCEPTED', 'COMPLETED'];

export default function MyRequests() {
  const [filter, setFilter] = useState('ALL');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await requestApi.getMyRequests();
      setRequests(res.data || []);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const filtered = filter === 'ALL' ? requests : requests.filter((r) => r.status === filter);

  const confirmAndRun = (message, action, id) => {
    Alert.alert('확인', message, [
      { text: '취소', style: 'cancel' },
      {
        text: '확인',
        onPress: async () => {
          setActionLoading(id);
          try {
            await action(id);
            await fetchRequests();
          } catch (err) {
            Alert.alert(err.response?.data?.message || '처리에 실패했어요.');
          } finally {
            setActionLoading(null);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text className="text-2xl font-bold text-gray-900 mb-5">내 의뢰 현황</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-5">
        {FILTERS.map((f) => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            className={`px-4 py-2 rounded-full mr-2 ${filter === f ? 'bg-blue-500' : 'bg-white border border-gray-200'}`}
          >
            <Text className={`text-sm font-medium ${filter === f ? 'text-white' : 'text-gray-600'}`}>
              {f === 'ALL' ? '전체' : STATUS_MAP[f]?.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator />
      ) : filtered.length === 0 ? (
        <View className="items-center py-16">
          <Text className="text-4xl mb-3">📋</Text>
          <Text className="font-medium text-gray-400">
            {filter === 'ALL' ? '아직 의뢰 내역이 없어요' : '해당 상태의 의뢰가 없어요'}
          </Text>
        </View>
      ) : (
        <View className="gap-3">
          {filtered.map((req) => {
            const statusInfo = STATUS_MAP[req.status] || STATUS_MAP.PENDING;
            const isActioning = actionLoading === req.id;
            return (
              <View key={req.id} className="card">
                <View className={`self-start px-2.5 py-1 rounded-full border mb-2 ${statusInfo.color}`}>
                  <Text className={`text-xs font-semibold ${statusInfo.text}`}>{statusInfo.label}</Text>
                </View>
                <Text className="font-bold text-gray-900">{req.companyName}</Text>
                <Text className="text-blue-500 text-sm font-medium mb-2">{req.service}</Text>

                <Text className="text-sm text-gray-500">📍 {req.address}</Text>
                {req.scheduledDate && <Text className="text-sm text-gray-500">📅 {req.scheduledDate}</Text>}
                {req.quotationPrice && (
                  <Text className="text-gray-900 font-semibold mt-1 text-sm">
                    견적 금액: <Text className="text-blue-500">{req.quotationPrice.toLocaleString()}원</Text>
                  </Text>
                )}

                {req.safeNumber && ['ACCEPTED', 'IN_PROGRESS', 'COMPLETED'].includes(req.status) && (
                  <View className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl flex-row items-center justify-between">
                    <View>
                      <Text className="text-xs text-green-700 font-semibold mb-0.5">🔒 안전번호</Text>
                      <Text className="text-green-800 font-bold">{req.safeNumber}</Text>
                    </View>
                    <Pressable
                      onPress={() => Linking.openURL(`tel:${req.safeNumber}`)}
                      className="bg-green-600 px-4 py-2 rounded-xl"
                    >
                      <Text className="text-white text-sm font-semibold">📞 전화</Text>
                    </Pressable>
                  </View>
                )}

                {req.status === 'QUOTED' && (
                  <View className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-xl">
                    <Text className="text-sm font-semibold text-purple-800 mb-2">
                      견적이 도착했어요! {req.quotationPrice?.toLocaleString()}원
                    </Text>
                    <Pressable
                      onPress={() => confirmAndRun('견적을 수락하시겠어요? 수락 후 안전번호가 발급됩니다.', requestApi.accept, req.id)}
                      disabled={isActioning}
                      className="bg-purple-600 rounded-xl py-2.5 items-center"
                      style={{ opacity: isActioning ? 0.6 : 1 }}
                    >
                      <Text className="text-white font-semibold text-sm">
                        {isActioning ? '처리 중...' : '✅ 견적 수락하기'}
                      </Text>
                    </Pressable>
                  </View>
                )}

                <View className="flex-row gap-2 mt-3">
                  {req.status === 'COMPLETED' && !req.hasReview && (
                    <Pressable
                      onPress={() => router.push(`/review/${req.id}`)}
                      className="flex-1 bg-blue-500 rounded-xl py-2 items-center"
                    >
                      <Text className="text-white text-sm font-semibold">리뷰 작성하기</Text>
                    </Pressable>
                  )}
                  {req.status === 'COMPLETED' && req.hasReview && (
                    <Text className="flex-1 text-center text-sm text-gray-400 py-2">✅ 리뷰 작성 완료</Text>
                  )}

                  {['PENDING', 'QUOTED'].includes(req.status) && (
                    <Pressable
                      onPress={() => confirmAndRun('의뢰를 취소하시겠어요?', requestApi.cancel, req.id)}
                      disabled={isActioning}
                      className="px-4 py-2 rounded-xl border border-gray-200"
                    >
                      <Text className="text-gray-400 text-sm">취소</Text>
                    </Pressable>
                  )}

                  {req.status !== 'CANCELLED' && (
                    <Pressable
                      onPress={() => router.push('/chats')}
                      className="flex-1 border border-gray-200 rounded-xl py-2 items-center flex-row justify-center gap-1.5"
                    >
                      <Feather name="message-square" size={14} color="#6b7280" />
                      <Text className="text-gray-500 text-sm">업체에 문의</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}
