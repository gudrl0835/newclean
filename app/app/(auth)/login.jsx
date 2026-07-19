import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { Link, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { authApi } from '../../src/api/auth';
import useAuthStore from '../../src/store/authStore';

export default function Login() {
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      await login(res.data);
      router.replace('/');
    } catch (err) {
      setError(err.response?.data?.message || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="items-center mb-8">
        <Text className="text-4xl mb-2">🧹</Text>
        <Text className="text-2xl font-bold text-gray-900">로그인</Text>
        <Text className="text-gray-500 text-sm mt-1">클린매칭에 오신 것을 환영합니다</Text>
      </View>

      <View className="gap-4">
        <View className="relative justify-center">
          <Feather name="mail" size={18} color="#9ca3af" style={{ position: 'absolute', left: 14, zIndex: 1 }} />
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="이메일"
            autoCapitalize="none"
            keyboardType="email-address"
            className="input-base pl-10"
          />
        </View>
        <View className="relative justify-center">
          <Feather name="lock" size={18} color="#9ca3af" style={{ position: 'absolute', left: 14, zIndex: 1 }} />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="비밀번호"
            secureTextEntry={!showPw}
            className="input-base pl-10 pr-10"
          />
          <Pressable onPress={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 14 }}>
            <Feather name={showPw ? 'eye-off' : 'eye'} size={18} color="#9ca3af" />
          </Pressable>
        </View>

        {error ? (
          <Text className="text-red-500 text-sm text-center bg-red-50 py-2 px-3 rounded-lg">{error}</Text>
        ) : null}

        <Pressable onPress={handleLogin} disabled={loading} className="btn-primary mt-2" style={{ opacity: loading ? 0.6 : 1 }}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="btn-primary-text">로그인</Text>
          )}
        </Pressable>
      </View>

      <View className="mt-6 flex-row justify-center">
        <Text className="text-gray-500 text-sm">계정이 없으신가요? </Text>
        <Link href="/(auth)/signup-type" className="text-blue-500 font-semibold text-sm">
          회원가입
        </Link>
      </View>
    </ScrollView>
  );
}
