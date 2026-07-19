import { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, FlatList, ActivityIndicator, Alert } from 'react-native';
import { adminApi } from '../../src/api/admin';

const ROLE_BADGE = {
  CUSTOMER: { bg: 'bg-blue-100', text: 'text-blue-700' },
  COMPANY: { bg: 'bg-purple-100', text: 'text-purple-700' },
  ADMIN: { bg: 'bg-red-100', text: 'text-red-700' },
};
const ROLE_LABEL = { CUSTOMER: '고객', COMPANY: '업체', ADMIN: '관리자' };

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    adminApi
      .getUsers()
      .then((res) => setUsers(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter((u) => u.name.includes(search) || u.email.includes(search));

  const handleDelete = (id, name) => {
    Alert.alert('확인', `${name} 회원을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          await adminApi.deleteUser(id);
          setUsers((prev) => prev.filter((u) => u.id !== id));
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-gray-50 px-4 pt-4">
      <Text className="text-2xl font-bold text-gray-900 mb-1">회원 관리</Text>
      <Text className="text-gray-500 text-sm mb-4">전체 가입 회원을 관리합니다</Text>

      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="이름 또는 이메일 검색..."
        className="input-base mb-4"
      />

      {loading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(u) => String(u.id)}
          contentContainerStyle={{ paddingBottom: 40 }}
          ListEmptyComponent={<Text className="text-center text-gray-400 py-12">검색 결과가 없습니다</Text>}
          renderItem={({ item: user }) => {
            const badge = ROLE_BADGE[user.role];
            return (
              <View className="card mb-3 flex-row items-center justify-between">
                <View className="flex-1">
                  <View className="flex-row items-center gap-2 mb-1">
                    <Text className="font-bold text-gray-900">{user.name}</Text>
                    <View className={`px-2 py-0.5 rounded-full ${badge?.bg}`}>
                      <Text className={`text-xs font-semibold ${badge?.text}`}>{ROLE_LABEL[user.role]}</Text>
                    </View>
                  </View>
                  <Text className="text-gray-600 text-sm">{user.email}</Text>
                  <Text className="text-gray-500 text-sm">{user.phone || '-'}</Text>
                  <Text className="text-gray-400 text-xs mt-1">{new Date(user.createdAt).toLocaleDateString('ko-KR')}</Text>
                </View>
                {user.role !== 'ADMIN' && (
                  <Pressable onPress={() => handleDelete(user.id, user.name)}>
                    <Text className="text-red-400 text-xs font-medium">삭제</Text>
                  </Pressable>
                )}
              </View>
            );
          }}
        />
      )}
    </View>
  );
}
