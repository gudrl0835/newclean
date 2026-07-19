import { useState, useEffect } from 'react';
import { View, Text, Pressable, FlatList, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { chatApi } from '../../src/api/chat';
import useAuthStore from '../../src/store/authStore';

function formatTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return '어제';
  if (diffDays < 7) return `${diffDays}일 전`;
  return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
}

export default function ChatList() {
  const user = useAuthStore((s) => s.user);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chatApi
      .getChatRooms()
      .then((res) => setRooms(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <FlatList
      className="flex-1 bg-white"
      contentContainerStyle={{ padding: 16 }}
      data={rooms}
      keyExtractor={(r) => String(r.id)}
      ListEmptyComponent={
        <View className="items-center py-20">
          <Text className="text-4xl mb-4">💬</Text>
          <Text className="text-gray-400">채팅방이 없어요.</Text>
          <Text className="text-sm text-gray-400 mt-1">견적을 수락하면 채팅이 시작돼요!</Text>
        </View>
      }
      renderItem={({ item: room }) => {
        const otherName = user?.role === 'COMPANY' ? room.customerName : room.companyName;
        return (
          <Pressable onPress={() => router.push(`/chats/${room.id}`)} className="card flex-row items-center gap-4 mb-2">
            <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center">
              <Text className="text-2xl">🧹</Text>
            </View>
            <View className="flex-1">
              <View className="flex-row items-center justify-between mb-0.5">
                <Text className="font-bold text-gray-900 text-sm">{otherName}</Text>
                <Text className="text-gray-400 text-xs">{formatTime(room.lastMessageAt)}</Text>
              </View>
              <Text className="text-gray-500 text-sm" numberOfLines={1}>{room.lastMessage || '채팅을 시작해보세요!'}</Text>
            </View>
            {room.unreadCount > 0 && (
              <View className="w-5 h-5 bg-red-500 rounded-full items-center justify-center">
                <Text className="text-white text-xs font-bold">{room.unreadCount}</Text>
              </View>
            )}
          </Pressable>
        );
      }}
    />
  );
}
