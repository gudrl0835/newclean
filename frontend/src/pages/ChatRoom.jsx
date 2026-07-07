import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiSend, FiPaperclip } from 'react-icons/fi';
import { MdVerified } from 'react-icons/md';

const DUMMY_MESSAGES = [
  { id: 1, sender: 'company', text: '안녕하세요! 의뢰 주셔서 감사합니다 😊', time: '오후 2:00' },
  { id: 2, sender: 'customer', text: '안녕하세요. 5월 15일 입주청소 가능한가요?', time: '오후 2:01' },
  { id: 3, sender: 'company', text: '네, 해당 날짜에 방문 가능합니다! 평수가 몇 평 되시나요?', time: '오후 2:05' },
  { id: 4, sender: 'customer', text: '30평이에요. 아이가 있어서 친환경 세제 사용 가능한가요?', time: '오후 2:06' },
  { id: 5, sender: 'company', text: '물론입니다! 저희는 기본적으로 친환경 세제를 사용하고 있습니다. 견적서를 보내드릴게요.', time: '오후 2:10' },
  { id: 6, type: 'quotation', sender: 'company', price: 150000, visitDate: '2026.05.15', visitTime: '오전 10:00', time: '오후 2:12' },
];

export default function ChatRoom() {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [messages, setMessages] = useState(DUMMY_MESSAGES);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages(prev => [...prev, {
      id: Date.now(), sender: 'customer', text: input.trim(),
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    }]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] max-w-screen-sm mx-auto">

      {/* 채팅 헤더 */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 shadow-sm">
        <button onClick={() => navigate('/chats')} className="p-2 rounded-xl hover:bg-gray-100">
          <FiArrowLeft size={20} />
        </button>
        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-xl">🧹</div>
        <div className="flex-1">
          <div className="flex items-center gap-1">
            <p className="font-bold text-gray-900 text-sm">깨끗한청소㈜</p>
            <MdVerified size={15} className="text-brand" />
          </div>
          <p className="text-xs text-green-500">온라인</p>
        </div>
      </div>

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
        {messages.map(msg => {
          if (msg.type === 'quotation') {
            return (
              <div key={msg.id} className="flex justify-start">
                <div className="max-w-[80%]">
                  <div className="bg-white border-2 border-brand rounded-2xl rounded-tl-none p-4 shadow-sm">
                    <p className="text-xs font-bold text-brand mb-2">📋 견적서 도착</p>
                    <p className="text-xl font-bold text-gray-900 mb-1">{msg.price.toLocaleString()}원</p>
                    <p className="text-xs text-gray-500 mb-3">방문 예정: {msg.visitDate} {msg.visitTime}</p>
                    <div className="flex gap-2">
                      <button className="flex-1 bg-brand text-white text-xs font-bold py-2 rounded-lg hover:bg-brand-dark transition-colors">
                        견적 수락
                      </button>
                      <button className="flex-1 border border-gray-200 text-gray-500 text-xs font-medium py-2 rounded-lg hover:border-red-300 hover:text-red-500 transition-colors">
                        거절
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 ml-1">{msg.time}</p>
                </div>
              </div>
            );
          }

          const isMe = msg.sender === 'customer';
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isMe
                    ? 'bg-brand text-white rounded-tr-none'
                    : 'bg-white text-gray-800 rounded-tl-none shadow-sm border border-gray-100'
                }`}>
                  {msg.text}
                </div>
                <p className="text-xs text-gray-400 mt-1 mx-1">{msg.time}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* 메시지 입력 */}
      <form onSubmit={sendMessage} className="flex items-center gap-2 px-4 py-3 bg-white border-t border-gray-100">
        <button type="button" className="p-2.5 text-gray-400 hover:text-brand hover:bg-blue-50 rounded-xl transition-colors">
          <FiPaperclip size={20} />
        </button>
        <input
          type="text" value={input} onChange={e => setInput(e.target.value)}
          placeholder="메시지를 입력하세요..."
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button type="submit"
          disabled={!input.trim()}
          className="p-2.5 bg-brand text-white rounded-xl hover:bg-brand-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          <FiSend size={18} />
        </button>
      </form>
    </div>
  );
}
