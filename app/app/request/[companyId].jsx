import { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { companyApi } from '../../src/api/company';
import { requestApi } from '../../src/api/request';

const TIMES = ['오전 9:00', '오전 10:00', '오전 11:00', '오후 12:00', '오후 1:00', '오후 2:00', '오후 3:00', '오후 4:00', '오후 5:00'];

const SERVICE_TYPES = [
  { value: 'HOUSE', label: '가정청소' },
  { value: 'MOVE_IN', label: '입주청소' },
  { value: 'MOVE_OUT', label: '이사청소' },
  { value: 'OFFICE', label: '사무실청소' },
  { value: 'SPECIAL', label: '특수청소' },
  { value: 'WINDOW', label: '창문청소' },
];

export default function RequestForm() {
  const { companyId } = useLocalSearchParams();
  const [company, setCompany] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ serviceType: '', address: '', addressDetail: '', area: '', date: '', time: '', memo: '' });

  useEffect(() => {
    if (companyId) {
      companyApi.getCompany(companyId).then((res) => setCompany(res.data)).catch(() => {});
    }
  }, [companyId]);

  const set = (field) => (value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async () => {
    if (!form.serviceType) return Alert.alert('서비스 항목을 선택해주세요.');
    if (!form.address) return Alert.alert('청소 장소를 입력해주세요.');
    if (!form.area) return Alert.alert('면적을 입력해주세요.');
    if (!form.date || !form.time) return Alert.alert('희망 날짜와 시간을 선택해주세요. (예: 2026-08-01)');

    setSubmitting(true);
    try {
      await requestApi.create({
        companyId: Number(companyId),
        serviceType: form.serviceType,
        address: form.address,
        addressDetail: form.addressDetail,
        roomSize: Number(form.area),
        scheduledDate: form.date,
        scheduledTime: form.time,
        memo: form.memo,
      });
      setSubmitted(true);
    } catch (err) {
      Alert.alert(err.response?.data?.message || '의뢰 전송에 실패했어요. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-5">
          <Feather name="check-circle" size={40} color="#22c55e" />
        </View>
        <Text className="text-2xl font-bold text-gray-900 mb-2">의뢰 전송 완료!</Text>
        <Text className="text-gray-500 text-sm mb-8 text-center">
          {company?.companyName || '업체'}에 의뢰를 보냈어요.{'\n'}업체에서 견적서를 보내면 알림으로 알려드립니다.
        </Text>
        <Pressable onPress={() => router.replace('/(tabs)/my-requests')} className="btn-primary">
          <Text className="btn-primary-text">내 의뢰 확인하기</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      {company && <Text className="text-sm text-gray-500 mb-4">{company.companyName}</Text>}

      <Text className="text-sm font-semibold text-gray-700 mb-2">서비스 선택 *</Text>
      <View className="flex-row flex-wrap gap-2 mb-5">
        {SERVICE_TYPES.map((opt) => (
          <Pressable
            key={opt.value}
            onPress={() => set('serviceType')(opt.value)}
            className={`px-3.5 py-3 rounded-xl border-2 ${form.serviceType === opt.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
            style={{ width: '48%' }}
          >
            <Text className={`font-medium text-sm ${form.serviceType === opt.value ? 'text-blue-500' : 'text-gray-700'}`}>{opt.label}</Text>
          </Pressable>
        ))}
      </View>

      <Text className="text-sm font-semibold text-gray-700 mb-2">청소 장소 주소 *</Text>
      <TextInput value={form.address} onChangeText={set('address')} placeholder="도로명 주소 입력" className="input-base mb-2" />
      <TextInput value={form.addressDetail} onChangeText={set('addressDetail')} placeholder="상세 주소 (동/호수)" className="input-base mb-5" />

      <Text className="text-sm font-semibold text-gray-700 mb-2">면적 (평수) *</Text>
      <TextInput value={form.area} onChangeText={set('area')} placeholder="예: 25" keyboardType="numeric" className="input-base mb-5" />

      <Text className="text-sm font-semibold text-gray-700 mb-2">희망 날짜 *</Text>
      <TextInput value={form.date} onChangeText={set('date')} placeholder="YYYY-MM-DD (예: 2026-08-01)" className="input-base mb-5" />

      <Text className="text-sm font-semibold text-gray-700 mb-2">희망 시간 *</Text>
      <View className="flex-row flex-wrap gap-2 mb-5">
        {TIMES.map((t) => (
          <Pressable
            key={t}
            onPress={() => set('time')(t)}
            className={`px-3 py-2.5 rounded-xl border-2 ${form.time === t ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
            style={{ width: '31%' }}
          >
            <Text className={`text-sm font-medium text-center ${form.time === t ? 'text-blue-500' : 'text-gray-600'}`}>{t}</Text>
          </Pressable>
        ))}
      </View>

      <Text className="text-sm font-semibold text-gray-700 mb-2">요청 사항 (선택)</Text>
      <TextInput
        value={form.memo}
        onChangeText={set('memo')}
        placeholder="특별 요청사항을 입력해주세요"
        multiline
        numberOfLines={4}
        className="input-base mb-5"
        style={{ textAlignVertical: 'top', height: 100 }}
      />

      <Pressable onPress={handleSubmit} disabled={submitting} className="btn-primary" style={{ opacity: submitting ? 0.6 : 1 }}>
        {submitting ? <ActivityIndicator color="#fff" /> : <Text className="btn-primary-text">의뢰 보내기</Text>}
      </Pressable>
    </ScrollView>
  );
}
