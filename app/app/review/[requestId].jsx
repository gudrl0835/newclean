import { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { requestApi } from '../../src/api/request';
import { reviewApi } from '../../src/api/review';

const CRITERIA = [
  { key: 'scorePunctuality', label: '시간 준수' },
  { key: 'scoreQuality', label: '청소 품질' },
  { key: 'scoreKindness', label: '친절도' },
];

export default function ReviewForm() {
  const { requestId } = useLocalSearchParams();
  const [request, setRequest] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [criteria, setCriteria] = useState({ scorePunctuality: 0, scoreQuality: 0, scoreKindness: 0 });
  const [content, setContent] = useState('');

  useEffect(() => {
    if (!requestId) return;
    requestApi
      .getMyRequests()
      .then((res) => {
        const found = (res.data || []).find((r) => String(r.id) === String(requestId));
        if (found) setRequest(found);
      })
      .catch(() => {});
  }, [requestId]);

  const setCriterion = (key, val) => setCriteria((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async () => {
    if (rating === 0) return Alert.alert('별점을 선택해주세요.');
    if (content.length < 10) return Alert.alert('리뷰 내용을 10자 이상 입력해주세요.');

    setSubmitting(true);
    try {
      await reviewApi.create(requestId, {
        score: rating,
        scoreKindness: criteria.scoreKindness || null,
        scorePunctuality: criteria.scorePunctuality || null,
        scoreQuality: criteria.scoreQuality || null,
        content,
      });
      setSubmitted(true);
    } catch (err) {
      Alert.alert(err.response?.data?.message || '리뷰 등록에 실패했어요. 다시 시도해주세요.');
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
        <Text className="text-2xl font-bold text-gray-900 mb-2">리뷰 작성 완료!</Text>
        <Text className="text-gray-500 text-sm mb-8 text-center">소중한 리뷰 감사합니다. 🙏</Text>
        <Pressable onPress={() => router.replace('/(tabs)/my-requests')} className="btn-primary">
          <Text className="btn-primary-text">내 의뢰 목록으로</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <View className="card flex-row items-center gap-4 mb-6">
        <View className="w-12 h-12 rounded-xl bg-blue-100 items-center justify-center">
          <Text className="text-2xl">🧹</Text>
        </View>
        <View>
          <Text className="font-bold text-gray-900">{request?.companyName || '업체'}</Text>
          <Text className="text-sm text-blue-500">{request?.service || '청소 서비스'} · {request?.scheduledDate || ''} 완료</Text>
        </View>
      </View>

      <Text className="text-sm font-semibold text-gray-700 mb-3 text-center">전체 만족도 *</Text>
      <View className="flex-row justify-center gap-2 mb-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <Pressable key={star} onPress={() => setRating(star)}>
            <FontAwesome name={star <= rating ? 'star' : 'star-o'} size={40} color="#facc15" />
          </Pressable>
        ))}
      </View>
      <Text className="text-sm font-medium text-gray-600 text-center mb-6">
        {rating === 0
          ? '별점을 선택해주세요'
          : rating === 1
          ? '😞 매우 불만족'
          : rating === 2
          ? '😕 불만족'
          : rating === 3
          ? '😐 보통'
          : rating === 4
          ? '😊 만족'
          : '😍 매우 만족'}
      </Text>

      <Text className="text-sm font-semibold text-gray-700 mb-3">항목별 평가 (선택)</Text>
      <View className="gap-3 mb-6">
        {CRITERIA.map((c) => (
          <View key={c.key} className="flex-row items-center justify-between">
            <Text className="text-sm text-gray-600" style={{ width: 90 }}>{c.label}</Text>
            <View className="flex-row gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Pressable key={s} onPress={() => setCriterion(c.key, s)}>
                  <FontAwesome name={s <= criteria[c.key] ? 'star' : 'star-o'} size={22} color="#facc15" />
                </Pressable>
              ))}
            </View>
          </View>
        ))}
      </View>

      <Text className="text-sm font-semibold text-gray-700 mb-2">리뷰 내용 * (10자 이상)</Text>
      <TextInput
        value={content}
        onChangeText={setContent}
        placeholder="청소 서비스는 어떠셨나요? 솔직한 후기를 남겨주세요."
        multiline
        numberOfLines={5}
        className="input-base mb-1"
        style={{ textAlignVertical: 'top', height: 120 }}
      />
      <Text className={`text-right text-xs mb-5 ${content.length < 10 ? 'text-gray-400' : 'text-green-500'}`}>
        {content.length}자 {content.length < 10 ? '(최소 10자)' : ''}
      </Text>

      <Pressable onPress={handleSubmit} disabled={submitting} className="btn-primary" style={{ opacity: submitting ? 0.6 : 1 }}>
        {submitting ? <ActivityIndicator color="#fff" /> : <Text className="btn-primary-text">리뷰 등록하기</Text>}
      </Pressable>
    </ScrollView>
  );
}
