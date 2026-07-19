import { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, ActivityIndicator, Alert, Modal, Linking } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { adminApi } from '../../src/api/admin';

const STATUS_TABS = [
  { value: 'ALL', label: '전체' },
  { value: 'PENDING', label: '⏳ 심사 대기' },
  { value: 'APPROVED', label: '✅ 승인' },
  { value: 'REJECTED', label: '❌ 거절' },
];

const STATUS_BADGE = {
  PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: '심사 대기' },
  APPROVED: { bg: 'bg-green-100', text: 'text-green-700', label: '승인' },
  REJECTED: { bg: 'bg-red-100', text: 'text-red-700', label: '거절' },
};

export default function AdminCompanies() {
  const params = useLocalSearchParams();
  const [status, setStatus] = useState(params.status || 'ALL');
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    if (params.status && params.status !== status) setStatus(params.status);
  }, [params.status]);

  const fetchCompanies = () => {
    setLoading(true);
    adminApi
      .getCompanies(status)
      .then((res) => setCompanies(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCompanies();
  }, [status]);

  const handleApprove = (id) => {
    Alert.alert('확인', '이 업체를 승인하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '확인',
        onPress: async () => {
          await adminApi.approveCompany(id);
          fetchCompanies();
        },
      },
    ]);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return Alert.alert('거절 사유를 입력해주세요.');
    await adminApi.rejectCompany(rejectModal, rejectReason);
    setRejectModal(null);
    setRejectReason('');
    fetchCompanies();
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text className="text-2xl font-bold text-gray-900 mb-1">업체 승인 관리</Text>
        <Text className="text-gray-500 text-sm mb-4">가입 신청한 업체를 검토하고 승인/거절하세요</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          {STATUS_TABS.map((tab) => (
            <Pressable
              key={tab.value}
              onPress={() => setStatus(tab.value)}
              className={`px-4 py-2 rounded-xl mr-2 ${status === tab.value ? 'bg-blue-500' : 'bg-white border border-gray-200'}`}
            >
              <Text className={`text-sm font-medium ${status === tab.value ? 'text-white' : 'text-gray-600'}`}>{tab.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {loading ? (
          <ActivityIndicator />
        ) : companies.length === 0 ? (
          <View className="items-center py-16">
            <Text className="text-4xl mb-3">📋</Text>
            <Text className="text-gray-400">해당 상태의 업체가 없습니다</Text>
          </View>
        ) : (
          <View className="gap-4">
            {companies.map((company) => {
              const badge = STATUS_BADGE[company.approvalStatus];
              return (
                <View key={company.id} className="bg-white rounded-2xl p-5">
                  <View className="flex-row items-center gap-2 mb-1">
                    <Text className="text-lg font-bold text-gray-900">{company.companyName}</Text>
                    <View className={`px-2.5 py-1 rounded-full ${badge?.bg}`}>
                      <Text className={`text-xs font-semibold ${badge?.text}`}>{badge?.label}</Text>
                    </View>
                  </View>
                  <Text className="text-gray-500 text-sm mb-3">대표: {company.ownerName}</Text>

                  <View className="flex-row flex-wrap gap-2 mb-3">
                    <View className="bg-gray-50 rounded-xl p-3" style={{ width: '48%' }}>
                      <Text className="text-gray-400 text-xs mb-1">이메일</Text>
                      <Text className="text-gray-700 text-sm">{company.email}</Text>
                    </View>
                    <View className="bg-gray-50 rounded-xl p-3" style={{ width: '48%' }}>
                      <Text className="text-gray-400 text-xs mb-1">전화번호</Text>
                      <Text className="text-gray-700 text-sm">{company.phone}</Text>
                    </View>
                    <View className="bg-gray-50 rounded-xl p-3" style={{ width: '48%' }}>
                      <Text className="text-gray-400 text-xs mb-1">지역</Text>
                      <Text className="text-gray-700 text-sm">{company.sido} {company.sigungu}</Text>
                    </View>
                    <View className="bg-gray-50 rounded-xl p-3" style={{ width: '48%' }}>
                      <Text className="text-gray-400 text-xs mb-1">사업자등록번호</Text>
                      <Text className="text-gray-700 text-sm">{company.businessNo || '미입력'}</Text>
                    </View>
                  </View>

                  {company.approvalStatus === 'REJECTED' && company.rejectReason && (
                    <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-3">
                      <Text className="text-xs text-red-600 font-semibold mb-1">거절 사유</Text>
                      <Text className="text-sm text-red-700">{company.rejectReason}</Text>
                    </View>
                  )}

                  {company.businessDocUrl && (
                    <Pressable onPress={() => Linking.openURL(company.businessDocUrl)} className="mb-3">
                      <Text className="text-sm text-blue-500 font-medium">📄 사업자등록증 보기</Text>
                    </Pressable>
                  )}

                  {company.approvalStatus === 'PENDING' && (
                    <View className="flex-row gap-3">
                      <Pressable onPress={() => handleApprove(company.id)} className="flex-1 bg-green-600 rounded-xl py-2.5 items-center">
                        <Text className="text-white font-semibold text-sm">✅ 승인</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => { setRejectModal(company.id); setRejectReason(''); }}
                        className="flex-1 bg-red-500 rounded-xl py-2.5 items-center"
                      >
                        <Text className="text-white font-semibold text-sm">❌ 거절</Text>
                      </Pressable>
                    </View>
                  )}
                  {company.approvalStatus === 'APPROVED' && (
                    <Pressable onPress={() => { setRejectModal(company.id); setRejectReason(''); }}>
                      <Text className="text-sm text-red-500">승인 취소 (거절 처리)</Text>
                    </Pressable>
                  )}
                  {company.approvalStatus === 'REJECTED' && (
                    <Pressable onPress={() => handleApprove(company.id)}>
                      <Text className="text-sm text-green-600">재승인</Text>
                    </Pressable>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <Modal visible={!!rejectModal} transparent animationType="fade" onRequestClose={() => setRejectModal(null)}>
        <View className="flex-1 items-center justify-center bg-black/40 px-6">
          <View className="bg-white rounded-2xl p-6 w-full">
            <Text className="text-lg font-bold text-gray-900 mb-4">거절 사유 입력</Text>
            <TextInput
              value={rejectReason}
              onChangeText={setRejectReason}
              placeholder="거절 사유를 입력해주세요."
              multiline
              className="border border-gray-200 rounded-xl p-3 text-sm"
              style={{ textAlignVertical: 'top', height: 100 }}
            />
            <View className="flex-row gap-3 mt-4">
              <Pressable onPress={() => setRejectModal(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 items-center">
                <Text className="text-gray-600 font-medium">취소</Text>
              </Pressable>
              <Pressable onPress={handleReject} className="flex-1 py-2.5 rounded-xl bg-red-500 items-center">
                <Text className="text-white font-semibold">거절 확정</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
