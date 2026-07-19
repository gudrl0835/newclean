import { Client } from '@stomp/stompjs';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../config/env';

export async function createStompClient() {
  const token = await SecureStore.getItemAsync('accessToken');
  const brokerURL = `${API_BASE_URL.replace(/^http/, 'ws')}/ws/websocket`;

  return new Client({
    brokerURL,
    connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
    reconnectDelay: 5000,
  });
}
