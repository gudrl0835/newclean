import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMessageSquare, FiFileText, FiCheckCircle, FiClock, FiPlay } from 'react-icons/fi';
import { requestApi } from '../../api/request';
import useAuthStore from '../../store/authStore';

const STATUS_LABEL = {
  PENDING:     '새 의뢰',
  QUOTED:      '견적 발송',
  ACCEPTED:    '수락 완료',
  IN_PROGRESS: '진행중',
  COMPLETED:   '완료',
  CANCELLED:   '취소',
};
const STATUS_COLOR = {
  PENDING:     'bg-red-50 text-red-600 border-red-200',
  QUOTED:      'bg-purple-50 text-purple-600 border-purple-200',
  ACCEPTED:    'bg-green-50 text-green-600 border-green-200',
  IN_PROGRESS: 'bg-blue-50 text-blue-600 border-blue-200',
  COMPLETED:   'bg-gray-50 text-gray-500 border-gray-200',
  CANCELLED:   'bg-red-50 text-red-400 border-red-100',
};

const FILTERS = ['ALL', 'PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED'];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('requests');
  const [filter, setFilter] = useState('ALL');
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({ newRequests: 0, inProgress: 0, completedThisMonth: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [reqRes, statsRes] = await Promise.all([
        requestApi.getCompanyRequests(),
        requestApi.getCompanyStats(),
      ]);
      setRequests(reqRes.data || []);
      setStats(statsRes.data || {});
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = filter === 'ALL' ? requests : requests.filter(r => r.status === filter);
  const newCount = requests.filter(r => r.status === 'PENDING').length;

  const handleReject = async (id) => {
    if (!window.confirm('이 의뢰를 거절하시겠어요?')) return;
    setActionLoading(id);
    try {
      await requestApi.reject(id);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || '처리에 실패했어요.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStart = async (id) => {
    setActionLoading(id);
    try {
      await requestApi.start(id);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || '처리에 실패했어요.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = async (id) => {
    if (!window.confirm('청소 완료 처리 하시겠어요?')) return;
    setActionLoading(id);
    try {
      await requestApi.complete(id);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || '처리에 실패했어요.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-screen-lg mx-auto px-4 py-6">

      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">업체 대시보드</h1>
        <p className="text-gray-500 text-sm mt-1">{user?.name || ''} 님 반갑습니다</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <div className="card border border-red-100 bg-red-50 text-center py-4">
          <FiClock size={22} className="text-red-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-gray-900">{stats.newRequests ?? 0}건</p>
          <p className="text-gray-500 text-xs mt-0.5">새 의뢰</p>
        </div>
        <div className="card border border-green-100 bg-green-50 text-center py-4">
          <FiPlay size={22} className="text-green-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-gray-900">{stats.inProgress ?? 0}건</p>
          <p className="text-gray-500 text-xs mt-0.5">진행중</p>
        </div>
        <div className="card border border-blue-100 bg-blue-50 text-center py-4 col-span-2 md:col-span-1">
          <FiCheckCircle size={22} className="text-blue-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-gray-900">{stats.completedThisMonth ?? 0}건</p>
          <p className="text-gray-500 text-xs mt-0.5">총 완료</p>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4">
        {[{ key: 'requests', label: '받은 의뢰' }, { key: 'chat', label: '채팅' }].map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
              activeTab === t.key ? 'bg-white text-brand shadow-sm' : 'text-gray-500'
            }`}
          >
            {t.label}
            {t.key === 'requests' && newCount > 0 && (
              <span className="ml-1.5 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{newCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* 의뢰 목록 */}
      {activeTab === 'requests' && (
        <>
          {/* 필터 */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filter === f ? 'bg-brand text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-brand hover:text-brand'
                }`}
              >
                {f === 'ALL' ? '전체' : STATUS_LABEL[f]}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex flex-col gap-3">
              {[1,2,3].map(i => <div key={i} className="card animate-pulse h-36 bg-gray-100" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="card text-center py-12 text-gray-400">
              <p className="text-3xl mb-2">📋</p>
              <p>{filter === 'ALL' ? '아직 받은 의뢰가 없어요' : '해당 상태의 의뢰가 없어요'}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filtered.map(req => {
                const isActioning = actionLoading === req.id;
                return (
                  <div key={req.id} className="card">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_COLOR[req.status] || ''}`}>
                            {STATUS_LABEL[req.status] || req.status}
                          </span>
                          <span className="font-bold text-gray-900">{req.customerName}</span>
                        </div>
                        <p className="text-brand font-semibold text-sm">{req.service}</p>
                      </div>
                      <p className="text-gray-400 text-xs">{req.scheduledDate}</p>
                    </div>

                    <div className="flex flex-col gap-1 text-sm text-gray-600 mb-3">
                      <p>📍 {req.address} {req.addressDetail}</p>
                      {req.roomSize && <p>📐 {req.roomSize}평</p>}
                      {req.memo && <p className="text-gray-400 text-xs mt-1">💬 {req.memo}</p>}
                      {req.quotationPrice && (
                        <p className="text-gray-900 font-semibold mt-1">
                          견적 금액: <span className="text-brand">{req.quotationPrice.toLocaleString()}원</span>
                        </p>
                      )}
                    </div>

                    {/* 새 의뢰 → 견적서 작성 / 거절 */}
                    {req.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/quotation/${req.id}`)}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-brand text-white font-semibold py-2.5 rounded-xl hover:bg-brand-dark transition-colors text-sm"
                        >
                          <FiFileText size={15} />
                          견적서 작성
                        </button>
                        <button
                          onClick={() => handleReject(req.id)}
                          disabled={isActioning}
                          className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500 transition-colors text-sm disabled:opacity-60"
                        >
                          {isActioning ? '...' : '거절'}
                        </button>
                      </div>
                    )}

                    {/* 수락됨 → 진행중 시작 */}
                    {req.status === 'ACCEPTED' && (
                      <button
                        onClick={() => handleStart(req.id)}
                        disabled={isActioning}
                        className="w-full flex items-center justify-center gap-1.5 bg-green-600 text-white font-semibold py-2.5 rounded-xl hover:bg-green-700 transition-colors text-sm disabled:opacity-60"
                      >
                        <FiPlay size={15} />
                        {isActioning ? '처리 중...' : '청소 시작하기'}
                      </button>
                    )}

                    {/* 진행중 → 완료 */}
                    {req.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => handleComplete(req.id)}
                        disabled={isActioning}
                        className="w-full flex items-center justify-center gap-1.5 bg-blue-600 text-white font-semibold py-2.5 rounded-xl hover:bg-blue-700 transition-colors text-sm disabled:opacity-60"
                      >
                        <FiCheckCircle size={15} />
                        {isActioning ? '처리 중...' : '완료 처리하기'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {activeTab === 'chat' && (
        <div
          onClick={() => navigate('/chats')}
          className="card text-center py-12 text-gray-400 cursor-pointer hover:shadow-md transition-shadow"
        >
          <FiMessageSquare size={40} className="mx-auto mb-3 opacity-50" />
          <p className="font-medium">채팅 목록으로 이동</p>
          <p className="text-sm mt-1">고객과의 1:1 채팅을 확인하세요</p>
        </div>
      )}
    </div>
  );
}
