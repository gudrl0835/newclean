import '../global.css';
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import useAuthStore from '../src/store/authStore';

export default function RootLayout() {
  const [hydrated, setHydrated] = useState(useAuthStore.persist.hasHydrated());

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, []);

  if (!hydrated) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(company)" />
          <Stack.Screen name="(admin)" />
          <Stack.Screen name="search" options={{ headerShown: true, title: '업체 검색' }} />
          <Stack.Screen name="company/[id]" options={{ headerShown: true, title: '업체 정보' }} />
          <Stack.Screen name="request/[companyId]" options={{ headerShown: true, title: '의뢰 보내기' }} />
          <Stack.Screen name="review/[requestId]" options={{ headerShown: true, title: '리뷰 작성' }} />
          <Stack.Screen name="quotation/[requestId]" options={{ headerShown: true, title: '견적서 작성' }} />
          <Stack.Screen name="chats/index" options={{ headerShown: true, title: '채팅' }} />
          <Stack.Screen name="chats/[roomId]" options={{ headerShown: true, title: '채팅방' }} />
          <Stack.Screen name="chatbot" options={{ presentation: 'modal', headerShown: true, title: '클린매칭 AI 지원' }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
