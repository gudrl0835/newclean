import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function SignupType() {
  return (
    <View className="flex-1 bg-white justify-center px-6 py-10">
      <View className="items-center mb-10">
        <Text className="text-4xl mb-2">🧹</Text>
        <Text className="text-2xl font-bold text-gray-900">회원가입</Text>
        <Text className="text-gray-500 text-sm mt-1">어떤 계정으로 가입하시겠어요?</Text>
      </View>

      <View className="gap-4">
        <Pressable
          onPress={() => router.push('/(auth)/signup')}
          className="card flex-row items-center gap-4 border-2 border-transparent"
        >
          <View className="w-12 h-12 rounded-xl bg-blue-100 items-center justify-center">
            <Feather name="user" size={22} color="#1E90FF" />
          </View>
          <View className="flex-1">
            <Text className="font-bold text-gray-900 text-base">고객으로 가입</Text>
            <Text className="text-gray-500 text-sm mt-0.5">청소 업체를 찾고 의뢰하고 싶어요</Text>
          </View>
          <Feather name="chevron-right" size={20} color="#9ca3af" />
        </Pressable>

        <Pressable
          onPress={() => router.push('/(auth)/signup-company')}
          className="card flex-row items-center gap-4 border-2 border-transparent"
        >
          <View className="w-12 h-12 rounded-xl bg-blue-100 items-center justify-center">
            <Feather name="briefcase" size={22} color="#1E90FF" />
          </View>
          <View className="flex-1">
            <Text className="font-bold text-gray-900 text-base">업체로 가입</Text>
            <Text className="text-gray-500 text-sm mt-0.5">청소 업체를 운영하고 있어요</Text>
          </View>
          <Feather name="chevron-right" size={20} color="#9ca3af" />
        </Pressable>
      </View>

      <View className="mt-8 flex-row justify-center">
        <Text className="text-gray-500 text-sm">이미 계정이 있으신가요? </Text>
        <Pressable onPress={() => router.replace('/(auth)/login')}>
          <Text className="text-blue-500 font-semibold text-sm">로그인</Text>
        </Pressable>
      </View>
    </View>
  );
}
