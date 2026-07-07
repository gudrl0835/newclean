import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiSend } from 'react-icons/fi';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getMessages } from '../api/chat';
import useAuthStore from '../store/authStore';

export default function ChatRoom() {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const { user } = useAuthStore();
  const token = useAuthStore(s => s.accessToken) || localStorage.getItem('accessToken');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const [roomInfo, setRoomInfo] = useState(null);
  const bottomRef = useRef(null);
  const clientRef = useRef(null);

  // 메시지 이력 불러오기
  useEffect(() => {
    getMessages(roomId)
      .then(res => setMessages(res.data))
      .catch(console.error);
  }, [roomId]);

  // WebSocket 연결
  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true);
        client.subscribe(`/topic/chat/${roomId}`, (msg) => {
          const newMsg = JSON.parse(msg.body);
          setMessages(prev => [...prev, newMsg]);
        });
      },
      onDisconnect: () => setConnected(false),
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [roomId, token]);

  // 스크롤 하단 고정
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback((e) => {
    e.preventDefault();
    if (!input.trim() || !connected || !clientRef.current) return;

    clientRef.current.publish({
      destination: `/app/chat/${roomId}`,
      body: JSON.stringify({ content: input.trim() }),
    });
    setInput('');
  }, [input, connected, roomId]);

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] max-w-screen-sm mx-auto">

      {/* 헤더 */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 shadow-sm">
        <button onClick={() => navigate('/chats')} className="p-2 rounded-xl hover:bg-gray-100">
          <FiArrowLeft size={20} />
        </button>
        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-xl">🧹</div>
        <div className="flex-1">
          <p className="font-bold text-gray-900 text-sm">채팅</p>
          <p className={`text-xs ${connected ? 'text-green-500' : 'text-gray-400'}`}>
            {connected ? '연결됨' : '연결 중...'}
          </p>
        </div>
      </div>

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
        {messages.map(msg => {
          const isMe = msg.senderId === user?.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                {!isMe && (
                  <p className="text-xs text-gray-500 mb-1 ml-1">{msg.senderName}</p>
                )}
                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isMe
                    ? 'bg-brand text-white rounded-tr-none'
                    : 'bg-white text-gray-800 rounded-tl-none shadow-sm border border-gray-100'
                }`}>
                  {msg.content}
                </div>
                <p className="text-xs text-gray-400 mt-1 mx-1">{formatTime(msg.createdAt)}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* 입력창 */}
      <form onSubmit={sendMessage} className="flex items-center gap-2 px-4 py-3 bg-white border-t border-gray-100">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="메시지를 입력하세요..."
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          disabled={!input.trim() || !connected}
          className="p-2.5 bg-brand text-white rounded-xl hover:bg-brand-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <FiSend size={18} />
        </button>
      </form>
    </div>
  );
}
