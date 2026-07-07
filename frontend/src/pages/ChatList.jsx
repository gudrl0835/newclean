import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

const DUMMY_ROOMS = [
  { id: 1, company: '깨끗한청소㈜', lastMessage: '네, 해당 날짜에 방문 가능합니다!', time: '오후 3:12', unread: 2, service: '입주청소' },
  { id: 2, company: '믿음청소서비스', lastMessage: '견적서를 보내드렸습니다. 확인 부탁드립니다.', time: '어제', unread: 0, service: '가정 기본청소' },
  { id: 3, company: '반짝반짝클리닝', lastMessage: '감사합니다. 좋은 하루 되세요!', time: '5월 8일', unread: 0, service: '이사청소' },
];

export default function ChatList() {
  const navigate = useNavigate();

  return (
    <div className="max-w-screen-sm mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100">
          <FiArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">채팅</h1>
      </div>

      <div className="flex flex-col gap-2">
        {DUMMY_ROOMS.map(room => (
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
                <p className="font-bold text-gray-900 text-sm">{room.company}</p>
                <span className="text-gray-400 text-xs flex-shrink-0">{room.time}</span>
              </div>
              <p className="text-xs text-brand mb-1">{room.service}</p>
              <p className="text-gray-500 text-sm truncate">{room.lastMessage}</p>
            </div>
            {room.unread > 0 && (
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">{room.unread}</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
