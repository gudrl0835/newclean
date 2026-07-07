import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminApi } from '../../api/admin';

const STATUS_TABS = [
  { value: 'ALL', label: '전체' },
  { value: 'PENDING', label: '⏳ 심사 대기' },
  { value: 'APPROVED', label: '✅ 승인' },
  { value: 'REJECTED', label: '❌ 거절' },
];

const STATUS_BADGE = {
  PENDING:  'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
};

export default function AdminCompanies() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const status = searchParams.get('status') || 'ALL';

  const fetchCompanies = () => {
    setLoading(true);
    adminApi.getCompanies(status)
      .then(res => setCompanies(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCompanies(); }, [status]);

  const handleApprove = async (id) => {
    if (!window.confirm('이 업체를 승인하시겠습니까?')) return;
    await adminApi.approveCompany(id);
    fetchCompanies();
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return alert('거절 사유를 입력해주세요.');
    await adminApi.rejectCompany(rejectModal, rejectReason);
    setRejectModal(null);
    setRejectReason('');
    fetchCompanies();
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">업체 승인 관리</h1>
        <p className="text-gray-500 text-sm mt-1">가입 신청한 업체를 검토하고 승인/거절하세요</p>
      </div>

      {/* 탭 */}
      <div className="flex gap-2 mb-6">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setSearchParams({ status: tab.value })}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              status === tab.value
                ? 'bg-brand text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-brand hover:text-brand'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">불러오는 중...</div>
      ) : companies.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">📋</p>
          <p>해당 상태의 업체가 없습니다</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {companies.map(company => (
            <div key={company.id} className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-bold text-gray-900">{company.companyName}</h3>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_BADGE[company.approvalStatus]}`}>
                      {company.approvalStatus === 'PENDING' ? '심사 대기' : company.approvalStatus === 'APPROVED' ? '승인' : '거절'}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm">대표: {company.ownerName}</p>
                </div>
                <p className="text-gray-400 text-xs">
                  {new Date(company.createdAt).toLocaleDateString('ko-KR')}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-gray-400 text-xs mb-1">이메일</p>
                  <p className="text-gray-700">{company.email}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-gray-400 text-xs mb-1">전화번호</p>
                  <p className="text-gray-700">{company.phone}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-gray-400 text-xs mb-1">지역</p>
                  <p className="text-gray-700">{company.sido} {company.sigungu}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-gray-400 text-xs mb-1">사업자등록번호</p>
                  <p className="text-gray-700">{company.businessNo || '미입력'}</p>
                </div>
              </div>

              {/* 거절 사유 */}
              {company.approvalStatus === 'REJECTED' && company.rejectReason && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                  <p className="text-xs text-red-600 font-semibold mb-1">거절 사유</p>
                  <p className="text-sm text-red-700">{company.rejectReason}</p>
                </div>
              )}

              {/* 사업자등록증 */}
              {company.businessDocUrl && (
                <a
                  href={company.businessDocUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block text-sm text-brand font-medium hover:underline mb-4"
                >
                  📄 사업자등록증 보기
                </a>
              )}

              {/* 액션 버튼 */}
              {company.approvalStatus === 'PENDING' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(company.id)}
                    className="flex-1 bg-green-600 text-white font-semibold py-2.5 rounded-xl hover:bg-green-700 transition-colors text-sm"
                  >
                    ✅ 승인
                  </button>
                  <button
                    onClick={() => { setRejectModal(company.id); setRejectReason(''); }}
                    className="flex-1 bg-red-500 text-white font-semibold py-2.5 rounded-xl hover:bg-red-600 transition-colors text-sm"
                  >
                    ❌ 거절
                  </button>
                </div>
              )}
              {company.approvalStatus === 'APPROVED' && (
                <button
                  onClick={() => { setRejectModal(company.id); setRejectReason(''); }}
                  className="text-sm text-red-500 hover:underline"
                >
                  승인 취소 (거절 처리)
                </button>
              )}
              {company.approvalStatus === 'REJECTED' && (
                <button
                  onClick={() => handleApprove(company.id)}
                  className="text-sm text-green-600 hover:underline"
                >
                  재승인
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 거절 사유 모달 */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setRejectModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">거절 사유 입력</h3>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="거절 사유를 입력해주세요. (업체에게 이메일로 전달됩니다)"
              rows={4}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:border-brand"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setRejectModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleReject}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600"
              >
                거절 확정
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
