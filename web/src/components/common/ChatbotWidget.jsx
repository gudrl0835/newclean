import { useState, useRef, useEffect } from 'react';
import { FiX, FiSend, FiMessageCircle } from 'react-icons/fi';
import { MdCleaningServices, MdSupportAgent } from 'react-icons/md';
import api from '../../api/axios';

const QUICK_QUESTIONS = [
  '의뢰는 어떻게 하나요?',
  '견적은 어떻게 받나요?',
  '안전번호가 뭔가요?',
  '업체 인증은 어떻게 되나요?',
  '리뷰는 언제 쓸 수 있나요?',
];

const BOT_INTRO = {
  id: 'intro',
  role: 'bot',
  text: '안녕하세요! 클린매칭 AI 고객지원입니다. 😊\n무엇을 도와드릴까요?',
};

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([BOT_INTRO]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [escalated, setEscalated] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg) return;
    setInput('');

    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await api.post('/api/chatbot/ask', { message: userMsg });
      const answer = res.data.answer;

      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'bot', text: answer }]);

      // "담당자 연결" 키워드 감지
      if (answer.includes('담당자') || answer.includes('연결')) {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: Date.now() + 2,
            role: 'bot',
            text: '담당자에게 연결하시겠어요?',
            isEscalate: true,
          }]);
        }, 500);
      }
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'bot',
        text: '일시적인 오류가 발생했어요. 잠시 후 다시 시도해주세요.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleEscalate = () => {
    setEscalated(true);
    setMessages(prev => [...prev, {
      id: Date.now(),
      role: 'bot',
      text: '담당자 연결 요청이 접수되었습니다. ✅\n영업시간(평일 09:00~18:00) 내에 이메일 또는 전화로 연락드릴게요.\n📧 support@cleanmatching.com',
    }]);
  };

  return (
    <>
      {/* 플로팅 버튼 */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-brand text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-brand-dark transition-all hover:scale-110"
        >
          <FiMessageCircle size={26} />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">!</span>
        </button>
      )}

      {/* 챗봇 창 */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100"
             style={{ height: '520px' }}>

          {/* 헤더 */}
          <div className="bg-brand px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <MdCleaningServices size={18} className="text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">클린매칭 AI 지원</p>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                  <p className="text-blue-100 text-xs">24시간 운영</p>
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white">
              <FiX size={20} />
            </button>
          </div>

          {/* 메시지 목록 */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-gray-50">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'bot' && (
                  <div className="w-7 h-7 bg-brand rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                    <MdCleaningServices size={14} className="text-white" />
                  </div>
                )}
                <div>
                  <div className={`rounded-2xl px-4 py-2.5 max-w-[220px] text-sm leading-relaxed whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'bg-brand text-white rounded-tr-sm'
                      : 'bg-white text-gray-800 shadow-sm rounded-tl-sm'
                  }`}>
                    {msg.text}
                  </div>
                  {/* 담당자 연결 버튼 */}
                  {msg.isEscalate && !escalated && (
                    <button
                      onClick={handleEscalate}
                      className="mt-2 flex items-center gap-1.5 text-xs text-brand font-semibold bg-blue-50 border border-blue-200 px-3 py-2 rounded-xl hover:bg-blue-100 transition-colors"
                    >
                      <MdSupportAgent size={16} />
                      담당자 연결 요청
                    </button>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="w-7 h-7 bg-brand rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                  <MdCleaningServices size={14} className="text-white" />
                </div>
                <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* 빠른 질문 */}
          {messages.length <= 2 && (
            <div className="px-3 py-2 border-t border-gray-100 flex gap-2 overflow-x-auto">
              {QUICK_QUESTIONS.map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="flex-shrink-0 text-xs bg-blue-50 text-brand border border-blue-100 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* 입력창 */}
          <div className="p-3 border-t border-gray-100 flex gap-2 bg-white">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !loading && sendMessage()}
              placeholder="질문을 입력하세요..."
              className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-brand"
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="bg-brand text-white w-9 h-9 rounded-xl flex items-center justify-center hover:bg-brand-dark disabled:opacity-40 transition-colors"
            >
              <FiSend size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
