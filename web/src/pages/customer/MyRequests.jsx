import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight, FiMessageSquare, FiEdit } from 'react-icons/fi';
import { requestApi } from '../../api/request';

const STATUS_MAP = {
  PENDING:     { label: '견적 대기중',  color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  QUOTED:      { label: '견적 도착',    color: 'bg-purple-50 text-purple-700 border-purple-200' },
  ACCEPTED:    { label: '예약 확정',    color: 'bg-green-50 text-green-700 border-green-200' },
  IN_PROGRESS: { label: '청소 진행중',  color: 'bg-blue-50 text-blue-700 border-blue-200' },
  COMPLETED:   { label: '완료',        color: 'bg-gray-50 text-gray-600 border-gray-200' },
  CANCELLED:   { label: '취소됨',      color: 'bg-red-50 text-red-500 border-red-200' },
};

const FILTERS = ['ALL', 'PENDING', 'QUOTED', 'ACCEPTED', 'COMPLETED'];

export default function MyRequests() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('ALL');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // requestId being actioned

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await requestApi.getMyRequests();
      setRequests(res.data || []);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const filtered = filter === 'ALL' ? requests : requests.filter(r => r.status === filter);

  const handleAccept = async (id) => {
    if (!window.confirm('견적을 수락하시겠어요? 수락 후 안전번호가 발급됩니다.')) return;
    setActionLoading(id);
    try {
      await requestApi.accept(id);
      await fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || '수락에 실패했어요.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('의뢰를 취소하시겠어요?')) return;
    setActionLoading(id);
    try {
      await requestApi.cancel(id);
      await fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || '취소에 실패했어요.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-screen-lg mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-5">내 의뢰 현황</h1>

      {/* 필터 탭 */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === f ? 'bg-brand text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-brand hover:text-brand'
            }`}
          >
            {f === 'ALL' ? '전체' : STATUS_MAP[f]?.label}
          </button>
        ))}
      </div>

      {/* 로딩 */}
      {loading && (
        <div className="flex flex-col gap-3">
          {[1,2,3].map(i => <div key={i} className="card animate-pulse h-36 bg-gray-100" />)}
        </div>
      )}

      {/* 빈 상태 */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📋</p>
          <p className="font-medium">
            {filter === 'ALL' ? '아직 의뢰 내역이 없어요' : '해당 상태의 의뢰가 없어요'}
          </p>
          {filter === 'ALL' && (
            <button
              onClick={() => navigate('/')}
              className="mt-4 text-brand text-sm font-semibold hover:underline"
            >
              업체 찾아보기
            </button>
          )}
        </div>
      )}

      {/* 의뢰 목록 */}
      {!loading && filtered.length > 0 && (
        <div className="flex flex-col gap-3">
          {filtered.map(req => {
            const statusInfo = STATUS_MAP[req.status] || STATUS_MAP.PENDING;
            const isActioning = actionLoading === req.id;
            return (
              <div key={req.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border mb-2 ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                    <h3 className="font-bold text-gray-900">{req.companyName}</h3>
                    <p className="text-brand text-sm font-medium">{req.service}</p>
                  </div>
                  {req.companyId && (
                    <button onClick={() => navigate(`/company/${req.companyId}`)}>
                      <FiArrowRight className="text-gray-300 mt-1" />
                    </button>
                  )}
                </div>

                <div className="text-sm text-gray-500 flex flex-col gap-1">
                  <p>📍 {req.address}</p>
                  {req.scheduledDate && <p>📅 {req.scheduledDate}</p>}
                  {req.quotationPrice && (
                    <p className="text-gray-900 font-semibold mt-1">
                      견적 금액: <span className="text-brand">{req.quotationPrice.toLocaleString()}원</span>
                    </p>
                  )}
                </div>

                {/* 안전번호 - 체결/진행/완료 시 표시 */}
                {req.safeNumber && ['ACCEPTED', 'IN_PROGRESS', 'COMPLETED'].includes(req.status) && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs text-green-700 font-semibold mb-0.5">🔒 안전번호</p>
                      <p className="text-green-800 font-bold tracking-wide">{req.safeNumber}</p>
                      <p className="text-xs text-green-600 mt-0.5">실제 번호 대신 이 번호로 통화하세요</p>
                    </div>
                    <a
                      href={`tel:${req.safeNumber}`}
                      className="bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-green-700 transition-colors"
                    >
                      📞 전화
                    </a>
                  </div>
                )}

                {/* 견적 도착 시 수락 버튼 */}
                {req.status === 'QUOTED' && (
                  <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-xl">
                    <p className="text-sm font-semibold text-purple-800 mb-2">
                      견적이 도착했어요! {req.quotationPrice?.toLocaleString()}원
                    </p>
                    <button
                      onClick={() => handleAccept(req.id)}
                      disabled={isActioning}
                      className="w-full bg-purple-600 text-white font-semibold py-2.5 rounded-xl hover:bg-purple-700 transition-colors text-sm disabled:opacity-60"
                    >
                      {isActioning ? '처리 중...' : '✅ 견적 수락하기'}
                    </button>
                  </div>
                )}

                <div className="flex gap-2 mt-3">
                  {/* 완료된 의뢰 → 리뷰 작성 */}
                  {req.status === 'COMPLETED' && !req.hasReview && (
                    <button
                      onClick={() => navigate(`/review/${req.id}`)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-brand text-white text-sm font-semibold py-2 rounded-xl hover:bg-brand-dark transition-colors"
                    >
                      <FiEdit size={14} />
                      리뷰 작성하기
                    </button>
                  )}
                  {req.status === 'COMPLETED' && req.hasReview && (
                    <span className="flex-1 text-center text-sm text-gray-400 py-2">
                      ✅ 리뷰 작성 완료
                    </span>
                  )}

                  {/* 취소 버튼 (대기/견적 상태만) */}
                  {['PENDING', 'QUOTED'].includes(req.status) && (
                    <button
                      onClick={() => handleCancel(req.id)}
                      disabled={isActioning}
                      className="px-4 py-2 rounded-xl border border-gray-200 text-gray-400 text-sm hover:border-red-300 hover:text-red-500 transition-colors disabled:opacity-60"
                    >
                      취소
                    </button>
                  )}

                  {/* 채팅 버튼 (취소 제외 모두) */}
                  {req.status !== 'CANCELLED' && (
                    <button
                      onClick={() => navigate('/chats')}
                      className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 text-gray-500 text-sm py-2 rounded-xl hover:border-brand hover:text-brand transition-colors"
                    >
                      <FiMessageSquare size={14} />
                      업체에 문의
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
