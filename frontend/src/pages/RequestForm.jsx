import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiCalendar, FiMapPin, FiCheckCircle } from 'react-icons/fi';
import { companyApi } from '../api/company';
import { requestApi } from '../api/request';

const TIMES = ['오전 9:00', '오전 10:00', '오전 11:00', '오후 12:00', '오후 1:00', '오후 2:00', '오후 3:00', '오후 4:00', '오후 5:00'];

const SERVICE_TYPES = [
  { value: 'HOUSE',    label: '가정청소' },
  { value: 'MOVE_IN',  label: '입주청소' },
  { value: 'MOVE_OUT', label: '이사청소' },
  { value: 'OFFICE',   label: '사무실청소' },
  { value: 'SPECIAL',  label: '특수청소' },
  { value: 'WINDOW',   label: '창문청소' },
];

export default function RequestForm() {
  const navigate = useNavigate();
  const { companyId } = useParams();
  const [company, setCompany] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    serviceType: '', address: '', addressDetail: '', area: '', date: '', time: '', memo: ''
  });

  useEffect(() => {
    if (companyId) {
      companyApi.getCompany(companyId)
        .then(res => setCompany(res.data))
        .catch(() => {});
    }
  }, [companyId]);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.serviceType) return alert('서비스 항목을 선택해주세요.');
    if (!form.address) return alert('청소 장소를 입력해주세요.');
    if (!form.area) return alert('면적을 입력해주세요.');
    if (!form.date || !form.time) return alert('희망 날짜와 시간을 선택해주세요.');

    setSubmitting(true);
    try {
      await requestApi.create({
        companyId: Number(companyId),
        serviceType: form.serviceType,
        address: form.address,
        addressDetail: form.addressDetail,
        roomSize: Number(form.area),
        scheduledDate: form.date,
        scheduledTime: form.time,
        memo: form.memo,
      });
      setSubmitted(true);
    } catch (err) {
      alert(err.response?.data?.message || '의뢰 전송에 실패했어요. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedService = SERVICE_TYPES.find(s => s.value === form.serviceType);

  if (submitted) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
        <div className="text-center max-w-sm w-full">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <FiCheckCircle size={40} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">의뢰 전송 완료!</h2>
          <p className="text-gray-500 text-sm mb-2">
            <span className="font-semibold text-gray-700">{company?.companyName || '업체'}</span>에 의뢰를 보냈어요.
          </p>
          <p className="text-gray-400 text-sm mb-8">업체에서 견적서를 보내면 알림으로 알려드립니다.</p>
          <div className="card bg-blue-50 border-blue-100 mb-6 text-left">
            <p className="text-xs text-blue-600 font-semibold mb-2">의뢰 내용 요약</p>
            <p className="text-sm text-gray-700">서비스: {selectedService?.label}</p>
            <p className="text-sm text-gray-700">주소: {form.address} {form.addressDetail}</p>
            <p className="text-sm text-gray-700">면적: {form.area}평</p>
            <p className="text-sm text-gray-700">일정: {form.date} {form.time}</p>
          </div>
          <div className="flex flex-col gap-3">
            <button onClick={() => navigate('/my-requests')} className="btn-primary">내 의뢰 확인하기</button>
            <button onClick={() => navigate('/')} className="btn-outline">홈으로 돌아가기</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-sm mx-auto px-4 py-6 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100">
          <FiArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">의뢰 보내기</h1>
          {company && <p className="text-sm text-gray-500">{company.companyName}</p>}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">

        {/* 서비스 선택 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">서비스 선택 *</label>
          <div className="grid grid-cols-2 gap-2">
            {SERVICE_TYPES.map(opt => (
              <label key={opt.value} className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-colors ${
                form.serviceType === opt.value ? 'border-brand bg-blue-50' : 'border-gray-200 hover:border-blue-200'
              }`}>
                <input type="radio" name="serviceType" value={opt.value} onChange={set('serviceType')} className="hidden" />
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  form.serviceType === opt.value ? 'border-brand' : 'border-gray-300'
                }`}>
                  {form.serviceType === opt.value && <div className="w-2 h-2 rounded-full bg-brand" />}
                </div>
                <span className={`font-medium text-sm ${form.serviceType === opt.value ? 'text-brand' : 'text-gray-700'}`}>
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* 청소 장소 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <FiMapPin className="inline mr-1" />청소 장소 주소 *
          </label>
          <input
            type="text" placeholder="도로명 주소 입력"
            value={form.address} onChange={set('address')}
            className="input-base mb-2"
          />
          <input
            type="text" placeholder="상세 주소 (동/호수)"
            value={form.addressDetail} onChange={set('addressDetail')}
            className="input-base"
          />
        </div>

        {/* 평수 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">면적 (평수) *</label>
          <div className="relative">
            <input
              type="number" placeholder="예: 25"
              value={form.area} onChange={set('area')}
              className="input-base pr-12" min="1"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">평</span>
          </div>
        </div>

        {/* 희망 날짜 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <FiCalendar className="inline mr-1" />희망 날짜 *
          </label>
          <input
            type="date" value={form.date} onChange={set('date')}
            min={new Date().toISOString().split('T')[0]}
            className="input-base"
          />
        </div>

        {/* 희망 시간 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">희망 시간 *</label>
          <div className="grid grid-cols-3 gap-2">
            {TIMES.map(t => (
              <button
                key={t} type="button"
                onClick={() => setForm(f => ({ ...f, time: t }))}
                className={`py-2.5 rounded-xl text-sm font-medium border-2 transition-colors ${
                  form.time === t ? 'border-brand bg-blue-50 text-brand' : 'border-gray-200 text-gray-600 hover:border-blue-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* 요청 사항 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">요청 사항 (선택)</label>
          <textarea
            placeholder="특별 요청사항을 입력해주세요&#10;예) 친환경 세제 사용 요청, 반려동물 있음 등"
            value={form.memo} onChange={set('memo')}
            rows={4} className="input-base resize-none"
          />
        </div>

        {/* 안내 */}
        <div className="card bg-yellow-50 border-yellow-200">
          <p className="text-xs text-yellow-700 font-semibold mb-1">📌 의뢰 전 안내사항</p>
          <ul className="text-xs text-yellow-600 space-y-1 list-disc list-inside">
            <li>의뢰 후 업체에서 견적서를 보내드립니다</li>
            <li>견적 수락 후 예약이 확정됩니다</li>
            <li>완료 후 청소 전/후 사진을 제공받을 수 있습니다</li>
          </ul>
        </div>

        <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-60">
          {submitting ? '전송 중...' : '의뢰 보내기'}
        </button>
      </form>
    </div>
  );
}
