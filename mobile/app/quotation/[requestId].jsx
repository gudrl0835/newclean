import { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { requestApi } from '../../src/api/request';

const TIMES = ['오전 9:00', '오전 10:00', '오전 11:00', '오후 12:00', '오후 1:00', '오후 2:00', '오후 3:00', '오후 4:00', '오후 5:00'];

export default function QuotationForm() {
  const { requestId } = useLocalSearchParams();
  const [request, setRequest] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [items, setItems] = useState([{ id: 1, name: '기본 청소', price: '' }]);
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('');
  const [validDays, setValidDays] = useState('3');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!requestId) return;
    requestApi
      .getCompanyRequests()
      .then((res) => {
        const found = (res.data || []).find((r) => String(r.id) === String(requestId));
        if (found) setRequest(found);
      })
      .catch(() => {});
  }, [requestId]);

  const total = items.reduce((sum, i) => sum + (Number(i.price) || 0), 0);

  const addItem = () => setItems((prev) => [...prev, { id: Date.now(), name: '', price: '' }]);
  const removeItem = (id) => setItems((prev) => prev.filter((i) => i.id !== id));
  const updateItem = (id, field, val) => setItems((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: val } : i)));

  const handleSubmit = async () => {
    if (items.some((i) => !i.name || !i.price)) return Alert.alert('모든 항목의 이름과 금액을 입력해주세요.');
    if (!visitDate || !visitTime) return Alert.alert('방문 예정일과 시간을 입력해주세요. (예: 2026-08-01)');

    setSubmitting(true);
    try {
      await requestApi.sendQuotation(requestId, { totalPrice: total, note, visitDate, visitTime });
      setSubmitted(true);
    } catch (err) {
      Alert.alert(err.response?.data?.message || '견적서 발송에 실패했어요.');
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
        <Text className="text-2xl font-bold text-gray-900 mb-2">견적서 발송 완료!</Text>
        <Text className="text-gray-500 text-sm mb-6 text-center">
          {request?.customerName || '고객'}님께 견적서를 발송했습니다.{'\n'}고객이 수락하면 예약이 확정됩니다.
        </Text>
        <View className="card bg-blue-50 border-blue-100 mb-6 w-full">
          <Text className="text-xs text-blue-600 font-semibold mb-2">발송된 견적 요약</Text>
          <Text className="text-sm text-gray-700 font-bold">총 금액: {total.toLocaleString()}원</Text>
          <Text className="text-sm text-gray-700">방문 예정: {visitDate} {visitTime}</Text>
          <Text className="text-sm text-gray-700">유효기간: {validDays}일</Text>
        </View>
        <Pressable onPress={() => router.replace('/(company)/dashboard')} className="btn-primary">
          <Text className="btn-primary-text">대시보드로 돌아가기</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      {request && (
        <View className="card bg-gray-50 mb-6">
          <Text className="text-xs font-semibold text-gray-500 mb-2">의뢰 정보</Text>
          <Text className="font-bold text-gray-900">{request.customerName} 고객 · {request.service}</Text>
          <Text className="text-sm text-gray-600 mt-1">📍 {request.address} {request.addressDetail}</Text>
          {request.roomSize ? <Text className="text-sm text-gray-600">📐 {request.roomSize}평</Text> : null}
          {request.scheduledDate ? <Text className="text-sm text-gray-600">📅 {request.scheduledDate}</Text> : null}
          {request.memo ? <Text className="text-xs text-gray-400 mt-1.5 bg-white rounded-lg px-3 py-2">💬 {request.memo}</Text> : null}
        </View>
      )}

      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-sm font-semibold text-gray-700">세부 항목 및 금액 *</Text>
        <Pressable onPress={addItem} className="flex-row items-center gap-1">
          <Feather name="plus" size={15} color="#1E90FF" />
          <Text className="text-blue-500 text-sm font-semibold">항목 추가</Text>
        </Pressable>
      </View>
      <View className="gap-2 mb-2">
        {items.map((item) => (
          <View key={item.id} className="flex-row gap-2 items-center">
            <TextInput
              value={item.name}
              onChangeText={(v) => updateItem(item.id, 'name', v)}
              placeholder="항목명 (예: 기본 청소)"
              className="input-base"
              style={{ flex: 2 }}
            />
            <TextInput
              value={item.price}
              onChangeText={(v) => updateItem(item.id, 'price', v)}
              placeholder="금액"
              keyboardType="numeric"
              className="input-base"
              style={{ flex: 1 }}
            />
            {items.length > 1 && (
              <Pressable onPress={() => removeItem(item.id)} className="p-2.5">
                <Feather name="trash-2" size={16} color="#f87171" />
              </Pressable>
            )}
          </View>
        ))}
      </View>
      <View className="flex-row items-center justify-between mb-5 pt-3 border-t border-gray-200">
        <Text className="font-semibold text-gray-700">견적 총액</Text>
        <Text className="text-xl font-bold text-blue-500">{total.toLocaleString()}원</Text>
      </View>

      <View className="flex-row gap-3 mb-5">
        <View className="flex-1">
          <Text className="text-sm font-semibold text-gray-700 mb-2">방문 예정일 *</Text>
          <TextInput value={visitDate} onChangeText={setVisitDate} placeholder="YYYY-MM-DD" className="input-base" />
        </View>
      </View>

      <Text className="text-sm font-semibold text-gray-700 mb-2">방문 시간 *</Text>
      <View className="flex-row flex-wrap gap-2 mb-5">
        {TIMES.map((t) => (
          <Pressable
            key={t}
            onPress={() => setVisitTime(t)}
            className={`px-3 py-2.5 rounded-xl border-2 ${visitTime === t ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
            style={{ width: '31%' }}
          >
            <Text className={`text-sm font-medium text-center ${visitTime === t ? 'text-blue-500' : 'text-gray-600'}`}>{t}</Text>
          </Pressable>
        ))}
      </View>

      <Text className="text-sm font-semibold text-gray-700 mb-2">견적 유효기간</Text>
      <View className="flex-row gap-2 mb-5">
        {['1', '3', '5', '7'].map((d) => (
          <Pressable
            key={d}
            onPress={() => setValidDays(d)}
            className={`flex-1 py-2.5 rounded-xl border-2 items-center ${validDays === d ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
          >
            <Text className={`text-sm font-medium ${validDays === d ? 'text-blue-500' : 'text-gray-600'}`}>{d}일</Text>
          </Pressable>
        ))}
      </View>

      <Text className="text-sm font-semibold text-gray-700 mb-2">추가 안내 (선택)</Text>
      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder="고객에게 전달할 추가 안내사항을 입력해주세요"
        multiline
        className="input-base mb-5"
        style={{ textAlignVertical: 'top', height: 90 }}
      />

      <Pressable onPress={handleSubmit} disabled={submitting} className="btn-primary" style={{ opacity: submitting ? 0.6 : 1 }}>
        {submitting ? <ActivityIndicator color="#fff" /> : <Text className="btn-primary-text">견적서 발송하기</Text>}
      </Pressable>
    </ScrollView>
  );
}
