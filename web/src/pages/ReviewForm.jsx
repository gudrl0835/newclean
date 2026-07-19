import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
import { requestApi } from '../api/request';
import { reviewApi } from '../api/review';

const CRITERIA = [
  { key: 'scorePunctuality', label: '시간 준수' },
  { key: 'scoreQuality',     label: '청소 품질' },
  { key: 'scoreKindness',    label: '친절도' },
];

export default function ReviewForm() {
  const navigate = useNavigate();
  const { requestId } = useParams();
  const [request, setRequest] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [criteria, setCriteria] = useState({ scorePunctuality: 0, scoreQuality: 0, scoreKindness: 0 });
  const [content, setContent] = useState('');

  useEffect(() => {
    if (!requestId) return;
    requestApi.getMyRequests()
      .then(res => {
        const found = (res.data || []).find(r => String(r.id) === String(requestId));
        if (found) setRequest(found);
      })
      .catch(() => {});
  }, [requestId]);

  const setCriterion = (key, val) => setCriteria(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return alert('별점을 선택해주세요.');
    if (content.length < 10) return alert('리뷰 내용을 10자 이상 입력해주세요.');

    setSubmitting(true);
    try {
      await reviewApi.create(requestId, {
        score: rating,
        scoreKindness: criteria.scoreKindness || null,
        scorePunctuality: criteria.scorePunctuality || null,
        scoreQuality: criteria.scoreQuality || null,
        content: content,
      });
      setSubmitted(true);
    } catch (err) {
      alert(err.response?.data?.message || '리뷰 등록에 실패했어요. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
        <div className="text-center max-w-sm w-full">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <FiCheckCircle size={40} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">리뷰 작성 완료!</h2>
          <p className="text-gray-500 text-sm mb-8">소중한 리뷰 감사합니다. 다른 고객들에게 큰 도움이 됩니다. 🙏</p>
          <button onClick={() => navigate('/my-requests')} className="btn-primary">내 의뢰 목록으로</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-sm mx-auto px-4 py-6 pb-10">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100">
          <FiArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">리뷰 작성</h1>
      </div>

      {/* 업체 정보 */}
      <div className="card flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl">🧹</div>
        <div>
          <p className="font-bold text-gray-900">{request?.companyName || '업체'}</p>
          <p className="text-sm text-brand">
            {request?.service || '청소 서비스'} · {request?.scheduledDate || ''} 완료
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">

        {/* 별점 */}
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-700 mb-3">전체 만족도 *</p>
          <div className="flex justify-center gap-2 mb-2">
            {[1,2,3,4,5].map(star => (
              <button key={star} type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="transition-transform hover:scale-110">
                <FaStar size={40} className={`transition-colors ${
                  star <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-200'
                }`} />
              </button>
            ))}
          </div>
          <p className="text-sm font-medium text-gray-600">
            {rating === 0 ? '별점을 선택해주세요' :
             rating === 1 ? '😞 매우 불만족' :
             rating === 2 ? '😕 불만족' :
             rating === 3 ? '😐 보통' :
             rating === 4 ? '😊 만족' : '😍 매우 만족'}
          </p>
        </div>

        {/* 항목별 평가 */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">항목별 평가 (선택)</p>
          <div className="flex flex-col gap-3">
            {CRITERIA.map(c => (
              <div key={c.key} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 w-24">{c.label}</span>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} type="button" onClick={() => setCriterion(c.key, s)}>
                      <FaStar size={22} className={`transition-colors ${s <= criteria[c.key] ? 'text-yellow-400' : 'text-gray-200'}`} />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 리뷰 내용 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            리뷰 내용 * <span className="font-normal text-gray-400">(10자 이상)</span>
          </label>
          <textarea
            placeholder="청소 서비스는 어떠셨나요? 솔직한 후기를 남겨주세요."
            value={content} onChange={e => setContent(e.target.value)}
            rows={5} className="input-base resize-none"
          />
          <p className={`text-right text-xs mt-1 ${content.length < 10 ? 'text-gray-400' : 'text-green-500'}`}>
            {content.length}자 {content.length < 10 && '(최소 10자)'}
          </p>
        </div>

        <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-60">
          {submitting ? '등록 중...' : '리뷰 등록하기'}
        </button>
      </form>
    </div>
  );
}
