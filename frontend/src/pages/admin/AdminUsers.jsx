import { useEffect, useState } from 'react';
import { adminApi } from '../../api/admin';

const ROLE_BADGE = {
  CUSTOMER: 'bg-blue-100 text-blue-700',
  COMPANY:  'bg-purple-100 text-purple-700',
  ADMIN:    'bg-red-100 text-red-700',
};
const ROLE_LABEL = { CUSTOMER: '고객', COMPANY: '업체', ADMIN: '관리자' };

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    adminApi.getUsers()
      .then(res => setUsers(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u =>
    u.name.includes(search) || u.email.includes(search)
  );

  const handleDelete = async (id, name) => {
    if (!window.confirm(`${name} 회원을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) return;
    await adminApi.deleteUser(id);
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">회원 관리</h1>
        <p className="text-gray-500 text-sm mt-1">전체 가입 회원을 관리합니다</p>
      </div>

      {/* 검색 */}
      <input
        type="text"
        placeholder="이름 또는 이메일 검색..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full max-w-sm border border-gray-200 rounded-xl px-4 py-2.5 text-sm mb-6 focus:outline-none focus:border-brand"
      />

      {loading ? (
        <div className="text-center py-20 text-gray-400">불러오는 중...</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-gray-500 font-medium">이름</th>
                <th className="text-left px-6 py-4 text-gray-500 font-medium">이메일</th>
                <th className="text-left px-6 py-4 text-gray-500 font-medium">전화번호</th>
                <th className="text-left px-6 py-4 text-gray-500 font-medium">역할</th>
                <th className="text-left px-6 py-4 text-gray-500 font-medium">가입일</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 text-gray-600">{user.email}</td>
                  <td className="px-6 py-4 text-gray-600">{user.phone || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ROLE_BADGE[user.role]}`}>
                      {ROLE_LABEL[user.role]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-6 py-4">
                    {user.role !== 'ADMIN' && (
                      <button
                        onClick={() => handleDelete(user.id, user.name)}
                        className="text-red-400 hover:text-red-600 text-xs font-medium"
                      >
                        삭제
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">검색 결과가 없습니다</div>
          )}
        </div>
      )}
    </div>
  );
}
