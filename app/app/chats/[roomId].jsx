import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TextInput, Pressable, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { chatApi } from '../../src/api/chat';
import { createStompClient } from '../../src/lib/stomp';
import useAuthStore from '../../src/store/authStore';

function formatTime(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
}

export default function ChatRoom() {
  const { roomId } = useLocalSearchParams();
  const user = useAuthStore((s) => s.user);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const clientRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    chatApi
      .getMessages(roomId)
      .then((res) => setMessages(res.data || []))
      .catch(() => {});
  }, [roomId]);

  useEffect(() => {
    let client;
    let cancelled = false;

    createStompClient().then((c) => {
      if (cancelled) return;
      client = c;
      client.onConnect = () => {
        setConnected(true);
        client.subscribe(`/topic/chat/${roomId}`, (msg) => {
          const newMsg = JSON.parse(msg.body);
          setMessages((prev) => [...prev, newMsg]);
        });
      };
      client.onDisconnect = () => setConnected(false);
      client.activate();
      clientRef.current = client;
    });

    return () => {
      cancelled = true;
      client?.deactivate();
    };
  }, [roomId]);

  const sendMessage = useCallback(() => {
    if (!input.trim() || !connected || !clientRef.current) return;
    clientRef.current.publish({
      destination: `/app/chat/${roomId}`,
      body: JSON.stringify({ content: input.trim() }),
    });
    setInput('');
  }, [input, connected, roomId]);

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <View className="px-4 py-2 bg-white border-b border-gray-100">
        <Text className={`text-xs ${connected ? 'text-green-500' : 'text-gray-400'}`}>
          {connected ? '연결됨' : '연결 중...'}
        </Text>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m, i) => String(m.id ?? i)}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item: msg }) => {
          const isMe = msg.senderId === user?.id;
          return (
            <View style={{ alignItems: isMe ? 'flex-end' : 'flex-start' }}>
              {!isMe && <Text className="text-xs text-gray-500 mb-1 ml-1">{msg.senderName}</Text>}
              <View
                className={`px-4 py-2.5 rounded-2xl ${isMe ? 'bg-blue-500' : 'bg-white border border-gray-100'}`}
                style={{ maxWidth: '75%' }}
              >
                <Text className={`text-sm ${isMe ? 'text-white' : 'text-gray-800'}`}>{msg.content}</Text>
              </View>
              <Text className="text-xs text-gray-400 mt-1 mx-1">{formatTime(msg.createdAt)}</Text>
            </View>
          );
        }}
      />

      <View className="flex-row items-center gap-2 px-4 py-3 bg-white border-t border-gray-100">
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="메시지를 입력하세요..."
          className="flex-1 input-base"
        />
        <Pressable
          onPress={sendMessage}
          disabled={!input.trim() || !connected}
          className="p-3 bg-blue-500 rounded-xl"
          style={{ opacity: !input.trim() || !connected ? 0.4 : 1 }}
        >
          <Feather name="send" size={18} color="#fff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
