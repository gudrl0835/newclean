import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiBell, FiUser, FiMenu, FiX, FiMessageSquare, FiLogOut } from 'react-icons/fi';
import { MdCleaningServices } from 'react-icons/md';
import useAuthStore from '../../store/authStore';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuthStore();

  const userRole = user?.role?.toLowerCase();

  const isActive = (path) => location.pathname === path
    ? 'text-brand font-semibold'
    : 'text-gray-600 hover:text-brand';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-screen-lg mx-auto px-4 h-16 flex items-center justify-between">

        {/* 로고 */}
        <Link to="/" className="flex items-center gap-2 text-brand font-bold text-xl">
          <MdCleaningServices size={28} />
          <span>클린매칭</span>
        </Link>

        {/* 데스크탑 메뉴 */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link to="/search" className={`transition-colors ${isActive('/search')}`}>업체 찾기</Link>
          {isLoggedIn && userRole === 'customer' && <>
            <Link to="/my-requests" className={`transition-colors ${isActive('/my-requests')}`}>내 의뢰</Link>
            <Link to="/chats" className={`transition-colors ${isActive('/chats')}`}>채팅</Link>
          </>}
          {isLoggedIn && userRole === 'company' && <>
            <Link to="/dashboard" className={`transition-colors ${isActive('/dashboard')}`}>대시보드</Link>
            <Link to="/chats" className={`transition-colors ${isActive('/chats')}`}>채팅</Link>
          </>}
        </nav>

        {/* 우측 버튼 */}
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <>
              <Link to="/chats" className="p-2 rounded-full hover:bg-gray-100 text-gray-500 relative">
                <FiMessageSquare size={20} />
              </Link>
              <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
                <FiBell size={20} />
              </button>
              <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                <span className="text-sm text-gray-600 hidden md:block">{user?.name}</span>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
                  title="로그아웃"
                >
                  <FiLogOut size={20} />
                </button>
              </div>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link
                to="/login"
                className="text-sm font-medium text-gray-600 hover:text-brand px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                로그인
              </Link>
              <Link
                to="/signup/customer"
                className="text-sm font-semibold bg-brand text-white px-4 py-2 rounded-xl hover:bg-brand-dark transition-colors"
              >
                회원가입
              </Link>
            </div>
          )}

          {/* 모바일 햄버거 */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* 모바일 드롭다운 메뉴 */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-2 text-sm font-medium shadow-lg">
          <Link to="/search" className="text-gray-700 py-2.5 px-3 rounded-xl hover:bg-gray-50" onClick={() => setMenuOpen(false)}>🔍 업체 찾기</Link>
          {isLoggedIn && userRole === 'customer' && <Link to="/my-requests" className="text-gray-700 py-2.5 px-3 rounded-xl hover:bg-gray-50" onClick={() => setMenuOpen(false)}>📋 내 의뢰</Link>}
          {isLoggedIn && <Link to="/chats" className="text-gray-700 py-2.5 px-3 rounded-xl hover:bg-gray-50" onClick={() => setMenuOpen(false)}>💬 채팅</Link>}
          {isLoggedIn && userRole === 'company' && <Link to="/dashboard" className="text-gray-700 py-2.5 px-3 rounded-xl hover:bg-gray-50" onClick={() => setMenuOpen(false)}>📊 대시보드</Link>}
          <div className="border-t border-gray-100 pt-2 mt-1 flex flex-col gap-2">
            {isLoggedIn
              ? <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="text-gray-700 py-2.5 px-3 rounded-xl hover:bg-gray-50 text-left">🚪 로그아웃</button>
              : <>
                  <Link to="/login" className="text-gray-700 py-2.5 px-3 rounded-xl hover:bg-gray-50 text-center" onClick={() => setMenuOpen(false)}>로그인</Link>
                  <Link to="/signup/customer" className="btn-primary text-center" onClick={() => setMenuOpen(false)}>회원가입</Link>
                </>
            }
          </div>
        </div>
      )}
    </header>
  );
}
