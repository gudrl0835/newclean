import { useState, useEffect } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import { authApi } from '../../api/auth';
import { companyApi } from '../../api/company';
import useAuthStore from '../../store/authStore';

const SIDO_LIST = ['서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'];

const APPROVAL_LABEL = {
  PENDING: { text: '승인 대기중', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  APPROVED: { text: '승인됨', color: 'bg-green-50 text-green-700 border-green-200' },
  REJECTED: { text: '거절됨', color: 'bg-red-50 text-red-600 border-red-200' },
};

export default function ProfileEdit() {
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  const [form, setForm] = useState({
    description: '', profileImage: '', sido: '', sigungu: '', addressDetail: '',
    serviceRadius: '', basePrice: '',
  });

  const [infoLoading, setInfoLoading] = useState(false);
  const [infoMsg, setInfoMsg] = useState(null);

  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await companyApi.getMyProfile();
        setProfile(res.data);
        setForm({
          description: res.data.description || '',
          profileImage: res.data.profileImage || '',
          sido: res.data.sido || '',
          sigungu: res.data.sigungu || '',
          addressDetail: res.data.addressDetail || '',
          serviceRadius: res.data.serviceRadius ?? '',
          basePrice: res.data.basePrice ?? '',
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setInfoMsg(null);
    if (!form.sido) return setInfoMsg({ type: 'error', text: '활동 지역(시/도)을 선택해주세요.' });

    setInfoLoading(true);
    try {
      const companyRes = await companyApi.updateProfile({
        description: form.description,
        profileImage: form.profileImage,
        sido: form.sido,
        sigungu: form.sigungu,
        addressDetail: form.addressDetail,
        serviceRadius: form.serviceRadius ? parseInt(form.serviceRadius, 10) : null,
        basePrice: form.basePrice ? parseInt(form.basePrice, 10) : null,
      });
      setProfile(companyRes.data);
      setInfoMsg({ type: 'ok', text: '저장됐어요.' });
    } catch (err) {
      setInfoMsg({ type: 'error', text: err.response?.data?.message || '저장에 실패했어요.' });
    } finally {
      setInfoLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwMsg(null);
    if (pwForm.next.length < 8) return setPwMsg({ type: 'error', text: '새 비밀번호는 8자 이상이어야 해요.' });
    if (pwForm.next !== pwForm.confirm) return setPwMsg({ type: 'error', text: '새 비밀번호가 서로 달라요.' });

    setPwLoading(true);
    try {
      await authApi.changePassword({ currentPassword: pwForm.current, newPassword: pwForm.next });
      setPwMsg({ type: 'ok', text: '비밀번호가 변경됐어요.' });
      setPwForm({ current: '', next: '', confirm: '' });
    } catch (err) {
      setPwMsg({ type: 'error', text: err.response?.data?.message || '변경에 실패했어요.' });
    } finally {
      setPwLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-screen-sm mx-auto px-4 py-6">
        <div className="card animate-pulse h-64 bg-gray-100" />
      </div>
    );
  }

  const approval = APPROVAL_LABEL[profile?.approvalStatus] || APPROVAL_LABEL.PENDING;

  return (
    <div className="max-w-screen-sm mx-auto px-4 py-6 flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">업체 프로필 수정</h1>
        <p className="text-gray-500 text-sm mt-1">고객에게 보여지는 업체 정보를 관리하세요.</p>
      </div>

      {/* 읽기 전용 - 사업자 정보 */}
      <div className="card flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">사업자 정보</h2>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${approval.color}`}>
            {approval.text}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">업체명</p>
            <p className="text-gray-800 font-medium">{profile?.companyName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">사업자등록번호</p>
            <p className="text-gray-800 font-medium">{profile?.businessNo || '-'}</p>
          </div>
        </div>
        {profile?.approvalStatus === 'REJECTED' && profile?.rejectReason && (
          <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">거절 사유: {profile.rejectReason}</p>
        )}
        <p className="text-xs text-gray-400">업체명·사업자등록번호는 관리자 재승인이 필요해 여기서 바로 수정할 수 없어요. 변경이 필요하면 고객센터로 문의해주세요.</p>
      </div>

      {/* 자유 수정 항목 */}
      <form onSubmit={handleSave} className="card flex flex-col gap-4">
        <h2 className="font-semibold text-gray-900">기본 정보</h2>

        <div>
          <label className="block text-xs text-gray-500 mb-1 ml-1">대표자 이름</label>
          <input type="text" value={user?.name || ''} disabled className="input-base bg-gray-50 text-gray-400" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1 ml-1">전화번호</label>
          <input type="tel" value={user?.phone || ''} disabled className="input-base bg-gray-50 text-gray-400" />
        </div>
        <p className="text-xs text-gray-400 -mt-2">대표자 이름·전화번호는 본인 확인 정보라 변경할 수 없어요.</p>
        <div>
          <label className="block text-xs text-gray-500 mb-1 ml-1">업체 소개</label>
          <textarea value={form.description} onChange={set('description')} rows={4} className="input-base resize-none" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1 ml-1">프로필 사진 URL</label>
          <input type="text" value={form.profileImage} onChange={set('profileImage')} placeholder="https://..." className="input-base" />
        </div>

        <h2 className="font-semibold text-gray-900 mt-2">활동 지역</h2>
        <p className="text-xs text-gray-400 -mt-2">고객이 지역으로 검색할 때 이 지역을 기준으로 노출돼요.</p>
        <div className="relative">
          <select value={form.sido} onChange={set('sido')} className="select-base pr-8">
            <option value="">시/도 선택 *</option>
            {SIDO_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <input type="text" placeholder="시/군/구 *" value={form.sigungu} onChange={set('sigungu')} className="input-base" />
        <input type="text" placeholder="상세 주소 (선택)" value={form.addressDetail} onChange={set('addressDetail')} className="input-base" />

        <h2 className="font-semibold text-gray-900 mt-2">서비스 조건</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1 ml-1">서비스 반경(km)</label>
            <input type="number" value={form.serviceRadius} onChange={set('serviceRadius')} className="input-base" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1 ml-1">기본 가격(원)</label>
            <input type="number" value={form.basePrice} onChange={set('basePrice')} className="input-base" />
          </div>
        </div>

        {infoMsg && (
          <p className={`text-sm py-2 px-3 rounded-lg text-center ${infoMsg.type === 'ok' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
            {infoMsg.text}
          </p>
        )}

        <button type="submit" className="btn-primary" disabled={infoLoading}>
          {infoLoading ? '저장 중...' : '저장'}
        </button>
      </form>

      {/* 비밀번호 변경 */}
      <form onSubmit={handleChangePassword} className="card flex flex-col gap-4">
        <h2 className="font-semibold text-gray-900">비밀번호 변경</h2>

        <input type="password" placeholder="현재 비밀번호" value={pwForm.current} onChange={(e) => setPwForm((f) => ({ ...f, current: e.target.value }))} className="input-base" />
        <input type="password" placeholder="새 비밀번호 (8자 이상)" value={pwForm.next} onChange={(e) => setPwForm((f) => ({ ...f, next: e.target.value }))} className="input-base" minLength={8} />
        <input type="password" placeholder="새 비밀번호 확인" value={pwForm.confirm} onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))} className="input-base" minLength={8} />

        {pwMsg && (
          <p className={`text-sm py-2 px-3 rounded-lg text-center ${pwMsg.type === 'ok' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
            {pwMsg.text}
          </p>
        )}

        <button type="submit" className="btn-outline" disabled={pwLoading}>
          {pwLoading ? '변경 중...' : '비밀번호 변경'}
        </button>
      </form>
    </div>
  );
}
