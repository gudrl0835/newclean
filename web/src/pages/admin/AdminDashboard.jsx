import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/admin';

const StatCard = ({ label, value, color, onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-2xl p-6 shadow-sm border-l-4 ${color} ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
  >
    <p className="text-gray-500 text-sm mb-1">{label}</p>
    <p className="text-3xl font-bold text-gray-900">{value ?? '-'}</p>
  </div>
);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getStats()
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-400 text-center py-20">불러오는 중...</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <p className="text-gray-500 text-sm mt-1">클린매칭 서비스 현황</p>
      </div>

      {/* 주요 통계 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="전체 회원" value={stats?.totalUsers} color="border-blue-400" />
        <StatCard label="고객" value={stats?.totalCustomers} color="border-green-400" />
        <StatCard label="업체" value={stats?.totalCompanies} color="border-purple-400" />
        <StatCard label="전체 의뢰" value={stats?.totalRequests} color="border-orange-400" />
      </div>

      {/* 업체 승인 현황 */}
      <h2 className="text-lg font-bold text-gray-900 mb-4">업체 승인 현황</h2>
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard
          label="⏳ 심사 대기"
          value={stats?.pendingCompanies}
          color="border-yellow-400"
          onClick={() => navigate('/admin/companies?status=PENDING')}
        />
        <StatCard
          label="✅ 승인 완료"
          value={stats?.approvedCompanies}
          color="border-green-400"
          onClick={() => navigate('/admin/companies?status=APPROVED')}
        />
        <StatCard
          label="❌ 거절"
          value={stats?.rejectedCompanies}
          color="border-red-400"
          onClick={() => navigate('/admin/companies?status=REJECTED')}
        />
      </div>

      {/* 대기중 알림 */}
      {stats?.pendingCompanies > 0 && (
        <div
          className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 flex items-center justify-between cursor-pointer hover:bg-yellow-100 transition-colors"
          onClick={() => navigate('/admin/companies?status=PENDING')}
        >
          <div>
            <p className="font-bold text-yellow-800">⚠️ 승인 대기 업체가 있습니다</p>
            <p className="text-yellow-700 text-sm mt-1">
              {stats.pendingCompanies}개 업체가 승인을 기다리고 있습니다.
            </p>
          </div>
          <span className="text-yellow-600 font-semibold text-sm">바로 가기 →</span>
        </div>
      )}
    </div>
  );
}
