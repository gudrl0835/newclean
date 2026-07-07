import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiChevronDown } from 'react-icons/fi';
import { authApi } from '../../api/auth';

const STEPS = ['기본 정보', '위치 정보', '서비스 등록', '완료'];
const SIDO_LIST = ['서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'];
const SERVICE_TAGS = ['가정 기본청소', '입주청소', '이사청소', '사무실청소', '특수청소', '에어컨청소', '욕실청소', '주방청소'];

function formatPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export default function CompanySignup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', representative: '', businessNo: '', email: '', password: '', phone: '',
    sido: '', sigungu: '', dong: '', addressDetail: '',
    selectedTags: [], priceMin: '', description: '',
  });

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));
  const setPhone = (e) => setForm(f => ({ ...f, phone: formatPhone(e.target.value) }));
  const toggleTag = (tag) => setForm(f => ({
    ...f,
    selectedTags: f.selectedTags.includes(tag)
      ? f.selectedTags.filter(t => t !== tag)
      : [...f.selectedTags, tag],
  }));

  const validateStep0 = () => {
    if (!form.name.trim()) return '업체명을 입력해주세요.';
    if (!form.representative.trim()) return '대표자 이름을 입력해주세요.';
    if (!form.email.trim()) return '이메일을 입력해주세요.';
    if (!/^010-\d{4}-\d{4}$/.test(form.phone)) return '전화번호를 올바르게 입력해주세요. (010-0000-0000)';
    if (form.password.length < 8) return '비밀번호는 8자 이상이어야 합니다.';
    return null;
  };

  const validateStep1 = () => {
    if (!form.sido) return '시/도를 선택해주세요.';
    if (!form.sigungu.trim()) return '시/군/구를 입력해주세요.';
    return null;
  };

  const handleNext = (nextStep) => {
    setError('');
    if (nextStep === 1) {
      const err = validateStep0();
      if (err) return setError(err);
    }
    if (nextStep === 2) {
      const err = validateStep1();
      if (err) return setError(err);
    }
    setStep(nextStep);
  };

  const handleSubmit = async () => {
    if (form.selectedTags.length === 0) return setError('서비스 항목을 1개 이상 선택해주세요.');
    setError('');
    setLoading(true);
    try {
      await authApi.signupCompany({
        email: form.email,
        password: form.password,
        name: form.representative,
        phone: form.phone,
        companyName: form.name,
        description: form.description,
        sido: form.sido,
        sigungu: form.sigungu,
        addressDetail: form.addressDetail,
        basePrice: form.priceMin ? parseInt(form.priceMin) : null,
      });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || '가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">

        {/* 진행 표시 */}
        <div className="flex items-center gap-1.5 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex-1 flex flex-col items-center gap-1">
              <div className={`w-full h-1.5 rounded-full transition-colors ${i <= step ? 'bg-brand' : 'bg-gray-200'}`} />
              <span className={`text-xs ${i === step ? 'text-brand font-semibold' : 'text-gray-400'}`}>{s}</span>
            </div>
          ))}
        </div>

        {/* Step 0: 기본 정보 */}
        {step === 0 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-gray-900 mb-2">업체 기본 정보</h2>

            {/* 안전번호 안내 */}
            <div className="card bg-blue-50 border-blue-100">
              <p className="text-xs text-blue-700 font-semibold mb-1">🔒 안전번호 서비스</p>
              <p className="text-xs text-blue-600 leading-relaxed">
                의뢰 체결 시 실제 번호 대신 <strong>가상 안전번호</strong>로 고객과 연락합니다.
              </p>
            </div>

            <input type="text" placeholder="업체명 *" value={form.name} onChange={set('name')} className="input-base" />
            <input type="text" placeholder="대표자 이름 *" value={form.representative} onChange={set('representative')} className="input-base" />
            <input type="text" placeholder="사업자등록번호 (000-00-00000)" value={form.businessNo} onChange={set('businessNo')} className="input-base" />
            <input type="email" placeholder="이메일 *" value={form.email} onChange={set('email')} className="input-base" />
            <input type="password" placeholder="비밀번호 (8자 이상) *" value={form.password} onChange={set('password')} className="input-base" minLength={8} />
            <div>
              <input type="tel" placeholder="전화번호 (010-0000-0000) *" value={form.phone} onChange={setPhone} className="input-base" />
              <p className="text-xs text-gray-400 mt-1 ml-1">🔒 고객에게는 안전번호로 대체 제공됩니다</p>
            </div>

            {error && <p className="text-red-500 text-sm bg-red-50 py-2 px-3 rounded-lg text-center">{error}</p>}
            <button className="btn-primary mt-2" onClick={() => handleNext(1)}>다음</button>
          </div>
        )}

        {/* Step 1: 위치 정보 */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-gray-900 mb-2">업체 위치 정보</h2>
            <p className="text-gray-500 text-sm -mt-2">고객이 검색할 때 사용되는 주요 활동 지역입니다</p>
            <div className="relative">
              <select value={form.sido} onChange={set('sido')} className="select-base pr-8">
                <option value="">시/도 선택 *</option>
                {SIDO_LIST.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <input type="text" placeholder="시/군/구 *" value={form.sigungu} onChange={set('sigungu')} className="input-base" />
            <input type="text" placeholder="동/읍/면 (선택)" value={form.dong} onChange={set('dong')} className="input-base" />
            <input type="text" placeholder="상세 주소 (선택)" value={form.addressDetail} onChange={set('addressDetail')} className="input-base" />

            {error && <p className="text-red-500 text-sm bg-red-50 py-2 px-3 rounded-lg text-center">{error}</p>}
            <div className="flex gap-2 mt-2">
              <button className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:border-brand hover:text-brand transition-colors" onClick={() => setStep(0)}>이전</button>
              <button className="btn-primary flex-1" onClick={() => handleNext(2)}>다음</button>
            </div>
          </div>
        )}

        {/* Step 2: 서비스 등록 */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-gray-900 mb-2">서비스 항목 등록</h2>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">제공하는 서비스 선택 * (복수 선택)</p>
              <div className="flex flex-wrap gap-2">
                {SERVICE_TAGS.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                      form.selectedTags.includes(tag)
                        ? 'bg-brand text-white border-brand'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-brand hover:text-brand'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <input type="number" placeholder="최소 가격 (원)" value={form.priceMin} onChange={set('priceMin')} className="input-base" />
            <textarea
              placeholder="업체 소개 (청소 경력, 특장점 등)"
              value={form.description} onChange={set('description')}
              rows={4} className="input-base resize-none"
            />

            {error && <p className="text-red-500 text-sm bg-red-50 py-2 px-3 rounded-lg text-center">{error}</p>}
            <div className="flex gap-2 mt-2">
              <button className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:border-brand hover:text-brand transition-colors" onClick={() => setStep(1)}>이전</button>
              <button className="btn-primary flex-1" onClick={handleSubmit} disabled={loading}>
                {loading ? '처리 중...' : '가입 완료'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: 완료 */}
        {step === 3 && (
          <div className="text-center flex flex-col items-center gap-4">
            <div className="text-6xl mb-2">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900">신청 완료!</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              업체 등록 신청이 완료되었습니다.<br />
              관리자 검토 후 <span className="text-brand font-semibold">1~2 영업일</span> 내 승인됩니다.
            </p>
            <div className="card bg-blue-50 border-blue-100 w-full text-left">
              <p className="text-xs text-blue-700 font-semibold mb-2">🔒 안전번호 서비스 안내</p>
              <p className="text-xs text-blue-600 leading-relaxed">
                의뢰가 체결되면 고객에게 실제 전화번호 대신 <strong>070 안전번호</strong>가 제공됩니다.
                안전번호를 통해 통화하면 서로의 실제 번호는 절대 노출되지 않습니다.
              </p>
            </div>
            <button className="btn-primary mt-4 w-full" onClick={() => navigate('/login')}>
              로그인 하러 가기
            </button>
          </div>
        )}

        {step < 3 && (
          <p className="text-center text-sm text-gray-500 mt-6">
            이미 계정이 있으신가요?{' '}
            <Link to="/login" className="text-brand font-semibold hover:underline">로그인</Link>
          </p>
        )}
      </div>
    </div>
  );
}
