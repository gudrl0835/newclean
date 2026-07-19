import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="text-8xl mb-6">🧹</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
        <p className="text-gray-500 text-lg mb-2">페이지를 찾을 수 없어요</p>
        <p className="text-gray-400 text-sm mb-8">요청하신 페이지가 존재하지 않거나 이동되었습니다.</p>
        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          <button onClick={() => navigate('/')} className="btn-primary">홈으로 돌아가기</button>
          <button onClick={() => navigate(-1)} className="btn-outline">이전 페이지</button>
        </div>
      </div>
    </div>
  );
}
