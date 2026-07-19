import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import useAuthStore from '../store/authStore';

const ROLE_LABEL = { CUSTOMER: '고객', COMPANY: '업체', ADMIN: '관리자' };

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <View className="flex-1 bg-gray-50 px-4 py-6">
      <View className="card flex-row items-center gap-4 mb-6">
        <View className="w-14 h-14 rounded-full bg-blue-100 items-center justify-center">
          <Text className="text-2xl font-bold text-blue-500">{user?.name?.[0] || '?'}</Text>
        </View>
        <View>
          <Text className="font-bold text-gray-900 text-lg">{user?.name}</Text>
          <Text className="text-gray-500 text-sm">{user?.email}</Text>
          {user?.role && <Text className="text-blue-500 text-xs font-semibold mt-0.5">{ROLE_LABEL[user.role] || user.role}</Text>}
        </View>
      </View>

      <Pressable onPress={() => router.push('/settings')} className="flex-row items-center gap-2 card mb-3">
        <Feather name="settings" size={18} color="#6b7280" />
        <Text className="text-gray-700 font-semibold">개인설정</Text>
      </Pressable>

      <Pressable onPress={handleLogout} className="flex-row items-center gap-2 card">
        <Feather name="log-out" size={18} color="#ef4444" />
        <Text className="text-red-500 font-semibold">로그아웃</Text>
      </Pressable>
    </View>
  );
}
