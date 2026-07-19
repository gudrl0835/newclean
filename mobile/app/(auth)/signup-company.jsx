import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { authApi } from '../../src/api/auth';
import { SIDO_LIST } from '../../src/constants/regions';

const STEPS = ['기본 정보', '위치 정보', '서비스 등록', '완료'];
const SERVICE_TAGS = ['가정 기본청소', '입주청소', '이사청소', '사무실청소', '특수청소', '에어컨청소', '욕실청소', '주방청소'];

function formatPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export default function CompanySignup() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', representative: '', businessNo: '', email: '', password: '', phone: '',
    sido: '', sigungu: '', dong: '', addressDetail: '',
    selectedTags: [], priceMin: '', description: '',
  });

  const set = (field) => (value) => setForm((f) => ({ ...f, [field]: value }));
  const setPhone = (value) => setForm((f) => ({ ...f, phone: formatPhone(value) }));
  const toggleTag = (tag) =>
    setForm((f) => ({
      ...f,
      selectedTags: f.selectedTags.includes(tag) ? f.selectedTags.filter((t) => t !== tag) : [...f.selectedTags, tag],
    }));

  const validateStep0 = () => {
    if (!form.name.trim()) return '업체명을 입력해주세요.';
    if (!form.representative.trim()) return '대표자 이름을 입력해주세요.';
    if (!form.email.trim()) return '이메일을 입력해주세요.';
    if (!/^010-\d{4}-\d{4}$/.test(form.phone)) return '전화번호를 올바르게 입력해주세요. (010-0000-0000)';
    if (form.password.length < 8) return '비밀번호는 8자 이상이어야 합니다.';
    return null;
  };

  const validateStep1 = () => {
    if (!form.sido) return '시/도를 선택해주세요.';
    if (!form.sigungu.trim()) return '시/군/구를 입력해주세요.';
    return null;
  };

  const handleNext = (nextStep) => {
    setError('');
    if (nextStep === 1) {
      const err = validateStep0();
      if (err) return setError(err);
    }
    if (nextStep === 2) {
      const err = validateStep1();
      if (err) return setError(err);
    }
    setStep(nextStep);
  };

  const handleSubmit = async () => {
    if (form.selectedTags.length === 0) return setError('서비스 항목을 1개 이상 선택해주세요.');
    setError('');
    setLoading(true);
    try {
      await authApi.signupCompany({
        email: form.email,
        password: form.password,
        name: form.representative,
        phone: form.phone,
        companyName: form.name,
        description: form.description,
        sido: form.sido,
        sigungu: form.sigungu,
        addressDetail: form.addressDetail,
        basePrice: form.priceMin ? parseInt(form.priceMin, 10) : null,
      });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || '가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 24, paddingVertical: 40 }} keyboardShouldPersistTaps="handled">
      <View className="flex-row items-center gap-1.5 mb-8">
        {STEPS.map((s, i) => (
          <View key={s} className="flex-1 items-center gap-1">
            <View className={`w-full rounded-full ${i <= step ? 'bg-blue-500' : 'bg-gray-200'}`} style={{ height: 6 }} />
            <Text className={`text-xs ${i === step ? 'text-blue-500 font-semibold' : 'text-gray-400'}`}>{s}</Text>
          </View>
        ))}
      </View>

      {step === 0 && (
        <View className="gap-4">
          <Text className="text-xl font-bold text-gray-900 mb-1">업체 기본 정보</Text>

          <View className="card bg-blue-50 border-blue-100">
            <Text className="text-xs text-blue-700 font-semibold mb-1">🔒 안전번호 서비스</Text>
            <Text className="text-xs text-blue-600 leading-relaxed">의뢰 체결 시 실제 번호 대신 가상 안전번호로 고객과 연락합니다.</Text>
          </View>

          <TextInput value={form.name} onChangeText={set('name')} placeholder="업체명 *" className="input-base" />
          <TextInput value={form.representative} onChangeText={set('representative')} placeholder="대표자 이름 *" className="input-base" />
          <TextInput value={form.businessNo} onChangeText={set('businessNo')} placeholder="사업자등록번호 (000-00-00000)" className="input-base" />
          <TextInput value={form.email} onChangeText={set('email')} placeholder="이메일 *" autoCapitalize="none" keyboardType="email-address" className="input-base" />
          <TextInput value={form.password} onChangeText={set('password')} placeholder="비밀번호 (8자 이상) *" secureTextEntry className="input-base" />
          <View>
            <TextInput value={form.phone} onChangeText={setPhone} placeholder="전화번호 (010-0000-0000) *" keyboardType="phone-pad" className="input-base" />
            <Text className="text-xs text-gray-400 mt-1 ml-1">🔒 고객에게는 안전번호로 대체 제공됩니다</Text>
          </View>

          {error ? <Text className="text-red-500 text-sm bg-red-50 py-2 px-3 rounded-lg text-center">{error}</Text> : null}
          <Pressable onPress={() => handleNext(1)} className="btn-primary mt-2">
            <Text className="btn-primary-text">다음</Text>
          </Pressable>
        </View>
      )}

      {step === 1 && (
        <View className="gap-4">
          <Text className="text-xl font-bold text-gray-900 mb-1">업체 위치 정보</Text>
          <Text className="text-gray-500 text-sm -mt-2">고객이 검색할 때 사용되는 주요 활동 지역입니다</Text>

          <Text className="text-sm font-semibold text-gray-700">시/도 선택 *</Text>
          <View className="flex-row flex-wrap gap-2">
            {SIDO_LIST.map((s) => (
              <Pressable
                key={s}
                onPress={() => set('sido')(s)}
                className={`px-3.5 py-2 rounded-full ${form.sido === s ? 'bg-blue-500' : 'bg-white border border-gray-200'}`}
              >
                <Text className={`text-sm font-medium ${form.sido === s ? 'text-white' : 'text-gray-600'}`}>{s}</Text>
              </Pressable>
            ))}
          </View>

          <TextInput value={form.sigungu} onChangeText={set('sigungu')} placeholder="시/군/구 *" className="input-base" />
          <TextInput value={form.dong} onChangeText={set('dong')} placeholder="동/읍/면 (선택)" className="input-base" />
          <TextInput value={form.addressDetail} onChangeText={set('addressDetail')} placeholder="상세 주소 (선택)" className="input-base" />

          {error ? <Text className="text-red-500 text-sm bg-red-50 py-2 px-3 rounded-lg text-center">{error}</Text> : null}
          <View className="flex-row gap-2 mt-2">
            <Pressable onPress={() => setStep(0)} className="flex-1 py-3 rounded-xl border-2 border-gray-200 items-center">
              <Text className="text-gray-600 font-semibold">이전</Text>
            </Pressable>
            <Pressable onPress={() => handleNext(2)} className="btn-primary" style={{ flex: 1 }}>
              <Text className="btn-primary-text">다음</Text>
            </Pressable>
          </View>
        </View>
      )}

      {step === 2 && (
        <View className="gap-4">
          <Text className="text-xl font-bold text-gray-900 mb-1">서비스 항목 등록</Text>

          <Text className="text-sm font-medium text-gray-700">제공하는 서비스 선택 * (복수 선택)</Text>
          <View className="flex-row flex-wrap gap-2">
            {SERVICE_TAGS.map((tag) => (
              <Pressable
                key={tag}
                onPress={() => toggleTag(tag)}
                className={`px-3 py-1.5 rounded-full border ${form.selectedTags.includes(tag) ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-200'}`}
              >
                <Text className={`text-sm font-medium ${form.selectedTags.includes(tag) ? 'text-white' : 'text-gray-600'}`}>{tag}</Text>
              </Pressable>
            ))}
          </View>

          <TextInput value={form.priceMin} onChangeText={set('priceMin')} placeholder="최소 가격 (원)" keyboardType="numeric" className="input-base" />
          <TextInput
            value={form.description}
            onChangeText={set('description')}
            placeholder="업체 소개 (청소 경력, 특장점 등)"
            multiline
            className="input-base"
            style={{ textAlignVertical: 'top', height: 100 }}
          />

          {error ? <Text className="text-red-500 text-sm bg-red-50 py-2 px-3 rounded-lg text-center">{error}</Text> : null}
          <View className="flex-row gap-2 mt-2">
            <Pressable onPress={() => setStep(1)} className="flex-1 py-3 rounded-xl border-2 border-gray-200 items-center">
              <Text className="text-gray-600 font-semibold">이전</Text>
            </Pressable>
            <Pressable onPress={handleSubmit} disabled={loading} className="btn-primary" style={{ flex: 1, opacity: loading ? 0.6 : 1 }}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text className="btn-primary-text">가입 완료</Text>}
            </Pressable>
          </View>
        </View>
      )}

      {step === 3 && (
        <View className="items-center gap-4">
          <Text style={{ fontSize: 56 }}>🎉</Text>
          <Text className="text-2xl font-bold text-gray-900">신청 완료!</Text>
          <Text className="text-gray-500 text-sm leading-relaxed text-center">
            업체 등록 신청이 완료되었습니다.{'\n'}관리자 검토 후 <Text className="text-blue-500 font-semibold">1~2 영업일</Text> 내 승인됩니다.
          </Text>
          <View className="card bg-blue-50 border-blue-100 w-full">
            <Text className="text-xs text-blue-700 font-semibold mb-2">🔒 안전번호 서비스 안내</Text>
            <Text className="text-xs text-blue-600 leading-relaxed">
              의뢰가 체결되면 고객에게 실제 전화번호 대신 070 안전번호가 제공됩니다. 안전번호를 통해 통화하면 서로의 실제 번호는 절대 노출되지 않습니다.
            </Text>
          </View>
          <Pressable onPress={() => router.replace('/(auth)/login')} className="btn-primary w-full mt-2">
            <Text className="btn-primary-text">로그인 하러 가기</Text>
          </Pressable>
        </View>
      )}

      {step < 3 && (
        <View className="mt-6 flex-row justify-center">
          <Text className="text-gray-500 text-sm">이미 계정이 있으신가요? </Text>
          <Pressable onPress={() => router.replace('/(auth)/login')}>
            <Text className="text-blue-500 font-semibold text-sm">로그인</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}
