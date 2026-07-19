import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { getChatRooms } from '../api/chat';

export default function ChatList() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getChatRooms()
      .then(res => setRooms(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return '어제';
    if (diffDays < 7) return `${diffDays}일 전`;
    return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
  };

  if (loading) return (
    <div className="max-w-screen-sm mx-auto px-4 py-6 flex justify-center pt-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
    </div>
  );

  return (
    <div className="max-w-screen-sm mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100">
          <FiArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">채팅</h1>
      </div>

      {rooms.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-4">💬</p>
          <p>채팅방이 없어요.</p>
          <p className="text-sm mt-1">견적을 수락하면 채팅이 시작돼요!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {rooms.map(room => (
            <button
              key={room.id}
              onClick={() => navigate(`/chat/${room.id}`)}
              className="card flex items-center gap-4 text-left hover:shadow-md hover:border-blue-100 transition-all w-full"
            >
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-2xl flex-shrink-0">
                🧹
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="font-bold text-gray-900 text-sm">{room.companyName}</p>
                  <span className="text-gray-400 text-xs flex-shrink-0">{formatTime(room.lastMessageAt)}</span>
                </div>
                <p className="text-gray-500 text-sm truncate">{room.lastMessage || '채팅을 시작해보세요!'}</p>
              </div>
              {room.unreadCount > 0 && (
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">{room.unreadCount}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
