import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiMessageSquare, FiMapPin } from 'react-icons/fi';
import { MdVerified } from 'react-icons/md';
import StarRating from '../components/common/StarRating';
import LoginPromptModal from '../components/common/LoginPromptModal';
import useAuthStore from '../store/authStore';
import { companyApi } from '../api/company';
import { openRoomWithCompany } from '../api/chat';

export default function CompanyProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuthStore();
  const [tab, setTab] = useState('info');
  const [loginModal, setLoginModal] = useState(null); // null | 'request' | 'chat'
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    companyApi.getCompany(id)
      .then(res => setCompany(res.data))
      .catch(() => setError('업체 정보를 불러오지 못했어요.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleRequest = () => {
    if (!isLoggedIn) {
      setLoginModal('request');
      return;
    }
    if (user?.role?.toLowerCase() !== 'customer') {
      alert('의뢰는 고객 계정으로만 가능합니다.');
      return;
    }
    navigate(`/request/${id}`);
  };

  const [chatLoading, setChatLoading] = useState(false);

  const handleChat = async () => {
    if (!isLoggedIn) {
      setLoginModal('chat');
      return;
    }
    if (user?.role?.toLowerCase() !== 'customer') {
      alert('1:1 문의는 고객 계정으로만 가능합니다.');
      return;
    }
    setChatLoading(true);
    try {
      const res = await openRoomWithCompany(id);
      navigate(`/chat/${res.data.id}`);
    } catch {
      alert('채팅을 여는 데 실패했어요.');
    } finally {
      setChatLoading(false);
    }
  };

  /* 로딩 */
  if (loading) {
    return (
      <div className="max-w-screen-md mx-auto pb-28">
        <div className="bg-gray-200 animate-pulse h-44" />
        <div className="px-4 -mt-6">
          <div className="card mb-4 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-3" />
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
            <div className="h-4 bg-gray-100 rounded w-full mb-1" />
            <div className="h-4 bg-gray-100 rounded w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  /* 에러 */
  if (error || !company) {
    return (
      <div className="max-w-screen-md mx-auto px-4 py-20 text-center">
        <p className="text-4xl mb-3">😥</p>
        <p className="font-bold text-gray-700 text-lg mb-2">{error || '업체를 찾을 수 없어요'}</p>
        <button onClick={() => navigate(-1)} className="text-brand text-sm font-medium hover:underline">
          뒤로 가기
        </button>
      </div>
    );
  }

  const reviews = company.reviews || [];

  return (
    <div className="max-w-screen-md mx-auto pb-28">

      {/* 로그인 유도 모달 */}
      {loginModal && (
        <LoginPromptModal
          message={
            loginModal === 'request'
              ? '의뢰를 보내려면 로그인이 필요해요.\n회원가입하면 바로 이용할 수 있어요!'
              : '1:1 문의를 하려면 로그인이 필요해요.'
          }
          returnTo={loginModal === 'request' ? `/request/${id}` : `/chats`}
          onClose={() => setLoginModal(null)}
        />
      )}

      {/* 상단 히어로 */}
      <div className="relative bg-gradient-to-br from-blue-500 to-blue-700 h-44 flex items-center justify-center overflow-hidden">
        {company.profileImage ? (
          <img src={company.profileImage} alt={company.companyName} className="w-full h-full object-cover opacity-60" />
        ) : (
          <span className="text-8xl">🧹</span>
        )}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 p-2 bg-white/20 backdrop-blur-sm rounded-xl text-white hover:bg-white/30"
        >
          <FiArrowLeft size={20} />
        </button>
      </div>

      <div className="px-4 -mt-6">

        {/* 업체 기본 정보 카드 */}
        <div className="card mb-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-gray-900">{company.companyName}</h1>
                {company.verified && (
                  <MdVerified size={22} className="text-brand" title="사업자 인증 완료" />
                )}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <StarRating rating={company.bayesianRating} size={15} />
                <span className="text-gray-400 text-sm">리뷰 {company.reviewCount}개</span>
              </div>
              <div className="flex items-center gap-1 text-gray-400 text-sm">
                <FiMapPin size={13} />
                <span>{company.sido} {company.sigungu}</span>
              </div>
            </div>
            {company.verified && (
              <span className="bg-blue-50 text-brand text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-100">
                ✅ 사업자 인증
              </span>
            )}
          </div>
          <p className="text-gray-600 text-sm leading-relaxed mt-2">{company.description}</p>

          {/* 통계 행 */}
          <div className="flex gap-4 mt-4 pt-4 border-t border-gray-100">
            {company.responseRate != null && (
              <div className="text-center flex-1">
                <p className="text-brand font-bold text-lg">{company.responseRate.toFixed(0)}%</p>
                <p className="text-gray-400 text-xs">응답률</p>
              </div>
            )}
            {company.completionRate != null && (
              <div className="text-center flex-1">
                <p className="text-brand font-bold text-lg">{company.completionRate.toFixed(0)}%</p>
                <p className="text-gray-400 text-xs">완료율</p>
              </div>
            )}
            {company.serviceRadius != null && (
              <div className="text-center flex-1">
                <p className="text-brand font-bold text-lg">{company.serviceRadius}km</p>
                <p className="text-gray-400 text-xs">서비스 반경</p>
              </div>
            )}
            {company.basePrice != null && (
              <div className="text-center flex-1">
                <p className="text-brand font-bold text-lg">{company.basePrice.toLocaleString()}원~</p>
                <p className="text-gray-400 text-xs">기본 요금</p>
              </div>
            )}
          </div>
        </div>

        {/* 탭 */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4">
          {[
            { key: 'info', label: '서비스 정보' },
            { key: 'reviews', label: `리뷰 (${company.reviewCount ?? 0})` }
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
                tab === t.key ? 'bg-white text-brand shadow-sm' : 'text-gray-500'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* 서비스 정보 탭 */}
        {tab === 'info' && (
          <div className="card text-center py-10 mb-4">
            <p className="text-3xl mb-2">📋</p>
            <p className="font-semibold text-gray-700 mb-1">서비스 항목 준비 중</p>
            <p className="text-gray-400 text-sm">업체에 직접 문의해주세요</p>
            <button
              onClick={handleChat}
              className="mt-4 text-brand text-sm font-semibold hover:underline"
            >
              1:1 문의하기
            </button>
          </div>
        )}

        {/* 리뷰 탭 */}
        {tab === 'reviews' && (
          <div className="flex flex-col gap-3 mb-4">
            {/* 별점 요약 */}
            <div className="flex items-center gap-3 card bg-blue-50 border-blue-100">
              <div className="text-center min-w-[70px]">
                <p className="text-4xl font-bold text-brand">
                  {(company.bayesianRating ?? 0).toFixed(1)}
                </p>
                <StarRating rating={company.bayesianRating ?? 0} size={14} showNumber={false} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">총 {company.reviewCount ?? 0}개의 리뷰</p>
                <p className="text-xs text-gray-400 mt-0.5">✅ 실제 완료된 의뢰에만 리뷰 작성 가능</p>
              </div>
            </div>

            {reviews.length === 0 ? (
              <div className="card text-center py-10">
                <p className="text-3xl mb-2">💬</p>
                <p className="text-gray-500 font-medium">아직 리뷰가 없어요</p>
                <p className="text-gray-400 text-sm mt-1">첫 번째 리뷰를 남겨주세요!</p>
              </div>
            ) : (
              reviews.map(review => (
                <div key={review.id} className="card">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-brand font-bold text-sm">
                        {review.customerName?.[0] || '?'}
                      </div>
                      <span className="font-medium text-gray-900 text-sm">{review.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StarRating rating={review.score} size={12} showNumber={false} />
                      <span className="text-gray-400 text-xs">{review.date}</span>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{review.content}</p>
                  {/* 전/후 사진 */}
                  {(review.beforeImage || review.afterImage) && (
                    <div className="flex gap-2 mt-3">
                      {review.beforeImage && (
                        <div className="flex-1">
                          <p className="text-xs text-gray-400 mb-1">청소 전</p>
                          <img src={review.beforeImage} alt="청소 전" className="w-full h-24 object-cover rounded-lg" />
                        </div>
                      )}
                      {review.afterImage && (
                        <div className="flex-1">
                          <p className="text-xs text-gray-400 mb-1">청소 후</p>
                          <img src={review.afterImage} alt="청소 후" className="w-full h-24 object-cover rounded-lg" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4">
        <div className="max-w-screen-md mx-auto flex gap-3">
          <button
            onClick={handleChat}
            disabled={chatLoading}
            className="flex items-center justify-center gap-2 border-2 border-brand text-brand font-semibold py-3 px-5 rounded-xl hover:bg-blue-50 transition-colors flex-1 disabled:opacity-60"
          >
            <FiMessageSquare size={18} />
            {chatLoading ? '여는 중...' : '1:1 문의'}
          </button>
          <button
            onClick={handleRequest}
            className="bg-brand text-white font-bold py-3 px-8 rounded-xl hover:bg-brand-dark transition-colors flex-[2]"
          >
            의뢰하기
          </button>
        </div>
      </div>
    </div>
  );
}
