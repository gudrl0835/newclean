import { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Pressable, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '../src/api/axios';

const QUICK_QUESTIONS = ['의뢰는 어떻게 하나요?', '견적은 어떻게 받나요?', '안전번호가 뭔가요?', '업체 인증은 어떻게 되나요?', '리뷰는 언제 쓸 수 있나요?'];

const BOT_INTRO = { id: 'intro', role: 'bot', text: '안녕하세요! 클린매칭 AI 고객지원입니다. 😊\n무엇을 도와드릴까요?' };

export default function Chatbot() {
  const [messages, setMessages] = useState([BOT_INTRO]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [escalated, setEscalated] = useState(false);
  const listRef = useRef(null);

  const sendMessage = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg) return;
    setInput('');
    setMessages((prev) => [...prev, { id: Date.now(), role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await api.post('/api/chatbot/ask', { message: userMsg });
      const answer = res.data.answer;
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: 'bot', text: answer }]);

      if (answer.includes('담당자') || answer.includes('연결')) {
        setTimeout(() => {
          setMessages((prev) => [...prev, { id: Date.now() + 2, role: 'bot', text: '담당자에게 연결하시겠어요?', isEscalate: true }]);
        }, 500);
      }
    } catch {
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: 'bot', text: '일시적인 오류가 발생했어요. 잠시 후 다시 시도해주세요.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleEscalate = () => {
    setEscalated(true);
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role: 'bot', text: '담당자 연결 요청이 접수되었습니다. ✅\n영업시간(평일 09:00~18:00) 내에 이메일 또는 전화로 연락드릴게요.\n📧 support@cleanmatching.com' },
    ]);
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-gray-50" behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={80}>
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => String(m.id)}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item: msg }) => (
          <View style={{ alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <View
              className={`px-4 py-2.5 rounded-2xl ${msg.role === 'user' ? 'bg-blue-500' : 'bg-white border border-gray-100'}`}
              style={{ maxWidth: '80%' }}
            >
              <Text className={`text-sm ${msg.role === 'user' ? 'text-white' : 'text-gray-800'}`}>{msg.text}</Text>
            </View>
            {msg.isEscalate && !escalated && (
              <Pressable onPress={handleEscalate} className="mt-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 flex-row items-center gap-1.5">
                <Feather name="headphones" size={14} color="#1E90FF" />
                <Text className="text-xs text-blue-500 font-semibold">담당자 연결 요청</Text>
              </Pressable>
            )}
          </View>
        )}
        ListFooterComponent={
          loading ? (
            <View className="items-start">
              <View className="bg-white border border-gray-100 rounded-2xl px-4 py-3">
                <ActivityIndicator size="small" />
              </View>
            </View>
          ) : messages.length <= 2 ? (
            <View className="flex-row flex-wrap gap-2 mt-2">
              {QUICK_QUESTIONS.map((q) => (
                <Pressable key={q} onPress={() => sendMessage(q)} className="bg-blue-50 border border-blue-100 rounded-full px-3 py-1.5">
                  <Text className="text-xs text-blue-500">{q}</Text>
                </Pressable>
              ))}
            </View>
          ) : null
        }
      />

      <View className="flex-row items-center gap-2 px-4 py-3 bg-white border-t border-gray-100">
        <TextInput value={input} onChangeText={setInput} placeholder="질문을 입력하세요..." className="flex-1 input-base" />
        <Pressable
          onPress={() => sendMessage()}
          disabled={loading || !input.trim()}
          className="p-3 bg-blue-500 rounded-xl"
          style={{ opacity: loading || !input.trim() ? 0.4 : 1 }}
        >
          <Feather name="send" size={18} color="#fff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
