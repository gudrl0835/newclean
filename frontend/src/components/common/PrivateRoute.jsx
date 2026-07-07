import { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

export default function PrivateRoute({ children, role }) {
  const { isLoggedIn, user } = useAuthStore();
  const location = useLocation();

  // 로그인 안 된 경우 → 로그인 페이지로 (돌아올 경로 기억)
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // 역할이 맞지 않는 경우 → 경고 페이지
  if (role && user?.role?.toLowerCase() !== role) {
    const message = role === 'customer'
      ? '고객 전용 페이지입니다. 고객 계정으로 로그인해주세요.'
      : '업체 전용 페이지입니다. 업체 계정으로 로그인해주세요.';
    return <AccessDenied message={message} />;
  }

  return children;
}

function AccessDenied({ message }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">접근 권한이 없습니다</h2>
        <p className="text-gray-500 text-sm mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
            뒤로가기
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2.5 rounded-xl bg-brand text-white font-medium hover:bg-brand-dark transition-colors"
          >
            홈으로
          </button>
        </div>
      </div>
    </div>
  );
}
