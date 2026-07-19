import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { requestApi } from '../../src/api/request';
import useAuthStore from '../../src/store/authStore';

const STATUS_LABEL = {
  PENDING: '새 의뢰',
  QUOTED: '견적 발송',
  ACCEPTED: '수락 완료',
  IN_PROGRESS: '진행중',
  COMPLETED: '완료',
  CANCELLED: '취소',
};
const STATUS_COLOR = {
  PENDING: 'bg-red-50 border-red-200',
  QUOTED: 'bg-purple-50 border-purple-200',
  ACCEPTED: 'bg-green-50 border-green-200',
  IN_PROGRESS: 'bg-blue-50 border-blue-200',
  COMPLETED: 'bg-gray-50 border-gray-200',
  CANCELLED: 'bg-red-50 border-red-100',
};
const STATUS_TEXT_COLOR = {
  PENDING: 'text-red-600',
  QUOTED: 'text-purple-600',
  ACCEPTED: 'text-green-600',
  IN_PROGRESS: 'text-blue-600',
  COMPLETED: 'text-gray-500',
  CANCELLED: 'text-red-400',
};

const FILTERS = ['ALL', 'PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED'];

export default function Dashboard() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState('requests');
  const [filter, setFilter] = useState('ALL');
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({ newRequests: 0, inProgress: 0, completedThisMonth: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [reqRes, statsRes] = await Promise.all([requestApi.getCompanyRequests(), requestApi.getCompanyStats()]);
      setRequests(reqRes.data || []);
      setStats(statsRes.data || {});
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = filter === 'ALL' ? requests : requests.filter((r) => r.status === filter);
  const newCount = requests.filter((r) => r.status === 'PENDING').length;

  const runAction = async (id, action, confirmMsg) => {
    const run = async () => {
      setActionLoading(id);
      try {
        await action(id);
        await fetchData();
      } catch (err) {
        Alert.alert(err.response?.data?.message || '처리에 실패했어요.');
      } finally {
        setActionLoading(null);
      }
    };
    if (confirmMsg) {
      Alert.alert('확인', confirmMsg, [
        { text: '취소', style: 'cancel' },
        { text: '확인', onPress: run },
      ]);
    } else {
      run();
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: insets.top + 16, paddingBottom: 40 }}>
      <View className="mb-6">
        <Text className="text-2xl font-bold text-gray-900">업체 대시보드</Text>
        <Text className="text-gray-500 text-sm mt-1">{user?.name || ''} 님 반갑습니다</Text>
      </View>

      <View className="flex-row gap-3 mb-6">
        <View className="card bg-red-50 border-red-100 items-center py-4 flex-1">
          <Feather name="clock" size={22} color="#ef4444" />
          <Text className="text-2xl font-bold text-gray-900 mt-1">{stats.newRequests ?? 0}건</Text>
          <Text className="text-gray-500 text-xs mt-0.5">새 의뢰</Text>
        </View>
        <View className="card bg-green-50 border-green-100 items-center py-4 flex-1">
          <Feather name="play" size={22} color="#22c55e" />
          <Text className="text-2xl font-bold text-gray-900 mt-1">{stats.inProgress ?? 0}건</Text>
          <Text className="text-gray-500 text-xs mt-0.5">진행중</Text>
        </View>
        <View className="card bg-blue-50 border-blue-100 items-center py-4 flex-1">
          <Feather name="check-circle" size={22} color="#1E90FF" />
          <Text className="text-2xl font-bold text-gray-900 mt-1">{stats.completedThisMonth ?? 0}건</Text>
          <Text className="text-gray-500 text-xs mt-0.5">총 완료</Text>
        </View>
      </View>

      <View className="flex-row bg-gray-100 rounded-xl p-1 mb-4">
        {[
          { key: 'requests', label: '받은 의뢰' },
          { key: 'chat', label: '채팅' },
        ].map((t) => (
          <Pressable
            key={t.key}
            onPress={() => setActiveTab(t.key)}
            className={`flex-1 py-2.5 rounded-lg flex-row items-center justify-center gap-1.5 ${activeTab === t.key ? 'bg-white' : ''}`}
          >
            <Text className={`text-sm font-semibold ${activeTab === t.key ? 'text-blue-500' : 'text-gray-500'}`}>{t.label}</Text>
            {t.key === 'requests' && newCount > 0 && (
              <View className="bg-red-500 rounded-full px-1.5 py-0.5">
                <Text className="text-white text-xs font-bold">{newCount}</Text>
              </View>
            )}
          </Pressable>
        ))}
      </View>

      {activeTab === 'requests' && (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            {FILTERS.map((f) => (
              <Pressable
                key={f}
                onPress={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full mr-2 ${filter === f ? 'bg-blue-500' : 'bg-white border border-gray-200'}`}
              >
                <Text className={`text-xs font-medium ${filter === f ? 'text-white' : 'text-gray-600'}`}>
                  {f === 'ALL' ? '전체' : STATUS_LABEL[f]}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {loading ? (
            <ActivityIndicator />
          ) : filtered.length === 0 ? (
            <View className="card items-center py-12">
              <Text className="text-3xl mb-2">📋</Text>
              <Text className="text-gray-400">{filter === 'ALL' ? '아직 받은 의뢰가 없어요' : '해당 상태의 의뢰가 없어요'}</Text>
            </View>
          ) : (
            <View className="gap-3">
              {filtered.map((req) => {
                const isActioning = actionLoading === req.id;
                return (
                  <View key={req.id} className="card">
                    <View className="flex-row items-center justify-between mb-1">
                      <View className="flex-row items-center gap-2">
                        <View className={`px-2.5 py-1 rounded-full border ${STATUS_COLOR[req.status] || ''}`}>
                          <Text className={`text-xs font-semibold ${STATUS_TEXT_COLOR[req.status] || ''}`}>
                            {STATUS_LABEL[req.status] || req.status}
                          </Text>
                        </View>
                        <Text className="font-bold text-gray-900">{req.customerName}</Text>
                      </View>
                      <Text className="text-gray-400 text-xs">{req.scheduledDate}</Text>
                    </View>
                    <Text className="text-blue-500 font-semibold text-sm mb-2">{req.service}</Text>

                    <Text className="text-sm text-gray-600">📍 {req.address} {req.addressDetail}</Text>
                    {req.roomSize ? <Text className="text-sm text-gray-600">📐 {req.roomSize}평</Text> : null}
                    {req.memo ? <Text className="text-gray-400 text-xs mt-1">💬 {req.memo}</Text> : null}
                    {req.quotationPrice ? (
                      <Text className="text-gray-900 font-semibold mt-1 text-sm">
                        견적 금액: <Text className="text-blue-500">{req.quotationPrice.toLocaleString()}원</Text>
                      </Text>
                    ) : null}

                    {req.status === 'PENDING' && (
                      <View className="flex-row gap-2 mt-3">
                        <Pressable
                          onPress={() => router.push(`/quotation/${req.id}`)}
                          className="flex-1 bg-blue-500 rounded-xl py-2.5 items-center flex-row justify-center gap-1.5"
                        >
                          <Feather name="file-text" size={15} color="#fff" />
                          <Text className="text-white font-semibold text-sm">견적서 작성</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => runAction(req.id, requestApi.reject, '이 의뢰를 거절하시겠어요?')}
                          disabled={isActioning}
                          className="px-4 py-2.5 rounded-xl border border-gray-200"
                        >
                          <Text className="text-gray-500 text-sm">{isActioning ? '...' : '거절'}</Text>
                        </Pressable>
                      </View>
                    )}

                    {req.status === 'ACCEPTED' && (
                      <Pressable
                        onPress={() => runAction(req.id, requestApi.start)}
                        disabled={isActioning}
                        className="mt-3 bg-green-600 rounded-xl py-2.5 items-center flex-row justify-center gap-1.5"
                        style={{ opacity: isActioning ? 0.6 : 1 }}
                      >
                        <Feather name="play" size={15} color="#fff" />
                        <Text className="text-white font-semibold text-sm">{isActioning ? '처리 중...' : '청소 시작하기'}</Text>
                      </Pressable>
                    )}

                    {req.status === 'IN_PROGRESS' && (
                      <Pressable
                        onPress={() => runAction(req.id, requestApi.complete, '청소 완료 처리 하시겠어요?')}
                        disabled={isActioning}
                        className="mt-3 bg-blue-600 rounded-xl py-2.5 items-center flex-row justify-center gap-1.5"
                        style={{ opacity: isActioning ? 0.6 : 1 }}
                      >
                        <Feather name="check-circle" size={15} color="#fff" />
                        <Text className="text-white font-semibold text-sm">{isActioning ? '처리 중...' : '완료 처리하기'}</Text>
                      </Pressable>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </>
      )}

      {activeTab === 'chat' && (
        <Pressable onPress={() => router.push('/chats')} className="card items-center py-12">
          <Feather name="message-square" size={40} color="#9ca3af" />
          <Text className="font-medium text-gray-500 mt-3">채팅 목록으로 이동</Text>
          <Text className="text-sm text-gray-400 mt-1">고객과의 1:1 채팅을 확인하세요</Text>
        </Pressable>
      )}
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
