import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { Link, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { authApi } from '../../src/api/auth';
import useAuthStore from '../../src/store/authStore';

function formatPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export default function Signup() {
  const login = useAuthStore((s) => s.login);
  const [form, setForm] = useState({ name: '', nickname: '', email: '', password: '', passwordConfirm: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (field) => (value) => setForm((f) => ({ ...f, [field]: value }));
  const setPhone = (value) => setForm((f) => ({ ...f, phone: formatPhone(value) }));

  const validate = () => {
    if (!form.name.trim()) return '이름을 입력해주세요.';
    if (!form.nickname.trim()) return '닉네임을 입력해주세요.';
    if (!form.email.trim()) return '이메일을 입력해주세요.';
    if (!/^010-\d{4}-\d{4}$/.test(form.phone)) return '전화번호를 올바르게 입력해주세요. (010-0000-0000)';
    if (form.password.length < 8) return '비밀번호는 8자 이상이어야 합니다.';
    if (form.password !== form.passwordConfirm) return '비밀번호가 일치하지 않습니다.';
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) return setError(validationError);
    setError('');
    setLoading(true);
    try {
      await authApi.signupCustomer({
        email: form.email,
        password: form.password,
        name: form.name,
        nickname: form.nickname,
        phone: form.phone,
      });
      const loginRes = await authApi.login({ email: form.email, password: form.password });
      await login(loginRes.data);
      router.replace('/(tabs)/home');
    } catch (err) {
      setError(err.response?.data?.message || '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text className="text-2xl font-bold text-gray-900 mb-1">고객 회원가입</Text>
      <Text className="text-gray-500 text-sm mb-6">기본 정보를 입력해주세요</Text>

      <View className="card bg-blue-50 border-blue-100 mb-5">
        <Text className="text-xs text-blue-700 font-semibold mb-1">🔒 안전번호 서비스</Text>
        <Text className="text-xs text-blue-600 leading-relaxed">
          의뢰가 체결되면 실제 전화번호 대신 가상 안전번호로만 연락하여 개인정보를 안전하게 보호합니다.
        </Text>
      </View>

      <View className="gap-4">
        <View className="relative justify-center">
          <Feather name="user" size={18} color="#9ca3af" style={{ position: 'absolute', left: 14, zIndex: 1 }} />
          <TextInput value={form.name} onChangeText={set('name')} placeholder="이름" className="input-base pl-10" />
        </View>
        <View>
          <View className="relative justify-center">
            <Feather name="smile" size={18} color="#9ca3af" style={{ position: 'absolute', left: 14, zIndex: 1 }} />
            <TextInput value={form.nickname} onChangeText={set('nickname')} placeholder="닉네임" className="input-base pl-10" />
          </View>
          <Text className="text-xs text-gray-400 mt-1 ml-1">리뷰/채팅에서 실명 대신 보여줄 이름이에요</Text>
        </View>
        <View className="relative justify-center">
          <Feather name="mail" size={18} color="#9ca3af" style={{ position: 'absolute', left: 14, zIndex: 1 }} />
          <TextInput
            value={form.email}
            onChangeText={set('email')}
            placeholder="이메일"
            autoCapitalize="none"
            keyboardType="email-address"
            className="input-base pl-10"
          />
        </View>
        <View>
          <View className="relative justify-center">
            <Feather name="phone" size={18} color="#9ca3af" style={{ position: 'absolute', left: 14, zIndex: 1 }} />
            <TextInput
              value={form.phone}
              onChangeText={setPhone}
              placeholder="전화번호 (010-0000-0000)"
              keyboardType="phone-pad"
              className="input-base pl-10"
            />
          </View>
          <Text className="text-xs text-gray-400 mt-1 ml-1">
            🔒 실제 번호는 의뢰 체결 후 안전번호로 대체됩니다
          </Text>
        </View>
        <View className="relative justify-center">
          <Feather name="lock" size={18} color="#9ca3af" style={{ position: 'absolute', left: 14, zIndex: 1 }} />
          <TextInput
            value={form.password}
            onChangeText={set('password')}
            placeholder="비밀번호 (8자 이상)"
            secureTextEntry
            className="input-base pl-10"
          />
        </View>
        <View className="relative justify-center">
          <Feather name="lock" size={18} color="#9ca3af" style={{ position: 'absolute', left: 14, zIndex: 1 }} />
          <TextInput
            value={form.passwordConfirm}
            onChangeText={set('passwordConfirm')}
            placeholder="비밀번호 확인"
            secureTextEntry
            className="input-base pl-10"
          />
        </View>

        {error ? (
          <Text className="text-red-500 text-sm text-center bg-red-50 py-2 px-3 rounded-lg">{error}</Text>
        ) : null}

        <Pressable onPress={handleSubmit} disabled={loading} className="btn-primary mt-2" style={{ opacity: loading ? 0.6 : 1 }}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text className="btn-primary-text">가입하기</Text>}
        </Pressable>
      </View>

      <View className="mt-6 flex-row justify-center">
        <Text className="text-gray-500 text-sm">이미 계정이 있으신가요? </Text>
        <Link href="/(auth)/login" className="text-blue-500 font-semibold text-sm">
          로그인
        </Link>
      </View>
    </ScrollView>
  );
}
