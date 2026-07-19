import { useNavigate, useLocation } from 'react-router-dom';
import { MdCleaningServices } from 'react-icons/md';

export default function LoginPromptModal({ message, returnTo, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();

  // returnTo가 명시적으로 전달되면 그걸 쓰고, 없으면 현재 페이지로 돌아옴
  const from = returnTo || location.pathname;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* 배경 딤 */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* 모달 */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
        <MdCleaningServices size={36} className="text-brand mx-auto mb-3" />
        <h3 className="text-lg font-bold text-gray-900 mb-1">로그인이 필요해요</h3>
        <p className="text-gray-500 text-sm mb-6 whitespace-pre-line">
          {message || '서비스를 이용하려면 로그인해주세요.'}
        </p>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => navigate('/login', { state: { from } })}
            className="btn-primary"
          >
            로그인하기
          </button>
          <button
            onClick={() => navigate('/signup/customer', { state: { from } })}
            className="w-full border-2 border-brand text-brand font-semibold py-3 px-6 rounded-xl hover:bg-blue-50 transition-colors text-sm"
          >
            회원가입
          </button>
          <button
            onClick={onClose}
            className="text-gray-400 text-sm mt-1 hover:text-gray-600"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
