import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { MdCleaningServices, MdDashboard, MdBusiness, MdPeople, MdLogout } from 'react-icons/md';
import useAuthStore from '../../store/authStore';

const NAV_ITEMS = [
  { to: '/admin', label: '대시보드', icon: MdDashboard, end: true },
  { to: '/admin/companies', label: '업체 승인 관리', icon: MdBusiness },
  { to: '/admin/users', label: '회원 관리', icon: MdPeople },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* 사이드바 */}
      <aside className="w-60 bg-gray-900 text-white flex flex-col fixed h-full">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <MdCleaningServices size={24} className="text-brand" />
            <div>
              <p className="font-bold text-white">클린매칭</p>
              <p className="text-xs text-gray-400">관리자 페이지</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors w-full"
          >
            <MdLogout size={20} />
            로그아웃
          </button>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="ml-60 flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
