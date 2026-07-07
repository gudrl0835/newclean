import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiPlus, FiTrash2, FiCheckCircle } from 'react-icons/fi';
import { requestApi } from '../../api/request';

const TIMES = ['오전 9:00','오전 10:00','오전 11:00','오후 12:00','오후 1:00','오후 2:00','오후 3:00','오후 4:00','오후 5:00'];

export default function QuotationForm() {
  const navigate = useNavigate();
  const { requestId } = useParams();
  const [request, setRequest] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [items, setItems] = useState([{ id: 1, name: '기본 청소', price: '' }]);
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('');
  const [validDays, setValidDays] = useState('3');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!requestId) return;
    requestApi.getCompanyRequests()
      .then(res => {
        const found = (res.data || []).find(r => String(r.id) === String(requestId));
        if (found) setRequest(found);
      })
      .catch(() => {});
  }, [requestId]);

  const total = items.reduce((sum, i) => sum + (Number(i.price) || 0), 0);

  const addItem = () => setItems(prev => [...prev, { id: Date.now(), name: '', price: '' }]);
  const removeItem = (id) => setItems(prev => prev.filter(i => i.id !== id));
  const updateItem = (id, field, val) => setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: val } : i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.some(i => !i.name || !i.price)) return alert('모든 항목의 이름과 금액을 입력해주세요.');
    if (!visitDate || !visitTime) return alert('방문 예정일과 시간을 입력해주세요.');

    setSubmitting(true);
    try {
      await requestApi.sendQuotation(requestId, {
        totalPrice: total,
        note: note,
        visitDate: visitDate,
        visitTime: visitTime,
      });
      setSubmitted(true);
    } catch (err) {
      alert(err.response?.data?.message || '견적서 발송에 실패했어요.');
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">견적서 발송 완료!</h2>
          <p className="text-gray-500 text-sm mb-8">
            <span className="font-semibold text-gray-700">{request?.customerName || '고객'}</span>님께 견적서를 발송했습니다.
            고객이 수락하면 예약이 확정됩니다.
          </p>
          <div className="card bg-blue-50 border-blue-100 mb-6 text-left">
            <p className="text-xs text-blue-600 font-semibold mb-2">발송된 견적 요약</p>
            <p className="text-sm text-gray-700 font-bold">총 금액: {total.toLocaleString()}원</p>
            <p className="text-sm text-gray-700">방문 예정: {visitDate} {visitTime}</p>
            <p className="text-sm text-gray-700">유효기간: {validDays}일</p>
          </div>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">대시보드로 돌아가기</button>
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
        <h1 className="text-xl font-bold text-gray-900">견적서 작성</h1>
      </div>

      {/* 의뢰 정보 요약 */}
      {request && (
        <div className="card bg-gray-50 border-gray-200 mb-6">
          <p className="text-xs font-semibold text-gray-500 mb-2">의뢰 정보</p>
          <p className="font-bold text-gray-900">{request.customerName} 고객 · {request.service}</p>
          <p className="text-sm text-gray-600 mt-1">📍 {request.address} {request.addressDetail}</p>
          {request.roomSize && <p className="text-sm text-gray-600">📐 {request.roomSize}평</p>}
          {request.scheduledDate && <p className="text-sm text-gray-600">📅 {request.scheduledDate}</p>}
          {request.memo && <p className="text-xs text-gray-400 mt-1.5 bg-white rounded-lg px-3 py-2">💬 {request.memo}</p>}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">

        {/* 세부 항목 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-gray-700">세부 항목 및 금액 *</label>
            <button type="button" onClick={addItem}
              className="flex items-center gap-1 text-brand text-sm font-semibold hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
              <FiPlus size={15} /> 항목 추가
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {items.map((item, idx) => (
              <div key={item.id} className="flex gap-2 items-center">
                <input
                  type="text" placeholder={`항목명 (예: ${idx === 0 ? '기본 청소' : idx === 1 ? '창문 청소' : '욕실 청소'})`}
                  value={item.name} onChange={e => updateItem(item.id, 'name', e.target.value)}
                  className="input-base flex-[2]"
                />
                <div className="relative flex-1">
                  <input
                    type="number" placeholder="금액"
                    value={item.price} onChange={e => updateItem(item.id, 'price', e.target.value)}
                    className="input-base pr-8" min="0"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">원</span>
                </div>
                {items.length > 1 && (
                  <button type="button" onClick={() => removeItem(item.id)}
                    className="p-2.5 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-xl transition-colors flex-shrink-0">
                    <FiTrash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
            <span className="font-semibold text-gray-700">견적 총액</span>
            <span className="text-xl font-bold text-brand">{total.toLocaleString()}원</span>
          </div>
        </div>

        {/* 방문 예정 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">방문 예정일 *</label>
            <input type="date" value={visitDate} onChange={e => setVisitDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]} className="input-base" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">방문 시간 *</label>
            <select value={visitTime} onChange={e => setVisitTime(e.target.value)} className="select-base">
              <option value="">선택</option>
              {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* 유효기간 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">견적 유효기간</label>
          <div className="flex gap-2">
            {['1', '3', '5', '7'].map(d => (
              <button key={d} type="button" onClick={() => setValidDays(d)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-colors ${
                  validDays === d ? 'border-brand bg-blue-50 text-brand' : 'border-gray-200 text-gray-600 hover:border-blue-200'
                }`}>
                {d}일
              </button>
            ))}
          </div>
        </div>

        {/* 추가 메모 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">추가 안내 (선택)</label>
          <textarea placeholder="고객에게 전달할 추가 안내사항을 입력해주세요"
            value={note} onChange={e => setNote(e.target.value)}
            rows={3} className="input-base resize-none" />
        </div>

        <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-60">
          {submitting ? '발송 중...' : '견적서 발송하기'}
        </button>
      </form>
    </div>
  );
}
