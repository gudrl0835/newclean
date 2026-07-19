import { useState, useEffect } from 'react';
import { authApi } from '../../api/auth';
import useAuthStore from '../../store/authStore';

function formatPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export default function ProfileEdit() {
  const { user, updateUser } = useAuthStore();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [nickname, setNickname] = useState('');
  const [infoLoading, setInfoLoading] = useState(false);
  const [infoMsg, setInfoMsg] = useState(null); // { type: 'ok'|'error', text }

  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState(null);

  // 닉네임은 로그인 스토어에 없어서 최신 정보를 따로 조회
  useEffect(() => {
    authApi.getMe().then((res) => setNickname(res.data.nickname || '')).catch(() => {});
  }, []);

  const handleSaveInfo = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setInfoMsg({ type: 'error', text: '이름을 입력해주세요.' });
    if (!nickname.trim()) return setInfoMsg({ type: 'error', text: '닉네임을 입력해주세요.' });
    setInfoMsg(null);
    setInfoLoading(true);
    try {
      const res = await authApi.updateMe({ name, phone, nickname });
      updateUser({ name: res.data.name, phone: res.data.phone });
      setNickname(res.data.nickname || '');
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

  return (
    <div className="max-w-screen-sm mx-auto px-4 py-6 flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">내 정보 수정</h1>
        <p className="text-gray-500 text-sm mt-1">이름, 전화번호, 비밀번호를 관리하세요.</p>
      </div>

      {/* 기본 정보 */}
      <form onSubmit={handleSaveInfo} className="card flex flex-col gap-4">
        <h2 className="font-semibold text-gray-900">기본 정보</h2>

        <div>
          <label className="block text-xs text-gray-500 mb-1 ml-1">이메일</label>
          <input type="email" value={user?.email || ''} disabled className="input-base bg-gray-50 text-gray-400" />
          <p className="text-xs text-gray-400 mt-1 ml-1">이메일(아이디)은 변경할 수 없어요.</p>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1 ml-1">이름</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-base" />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1 ml-1">닉네임</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="리뷰·채팅에 표시될 이름"
            className="input-base"
            required
            maxLength={30}
          />
          <p className="text-xs text-gray-400 mt-1 ml-1">리뷰와 1:1 문의에서 이름 대신 이 닉네임이 상대방에게 보여요.</p>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1 ml-1">전화번호</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            placeholder="010-0000-0000"
            className="input-base"
          />
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

        <input
          type="password"
          placeholder="현재 비밀번호"
          value={pwForm.current}
          onChange={(e) => setPwForm((f) => ({ ...f, current: e.target.value }))}
          className="input-base"
        />
        <input
          type="password"
          placeholder="새 비밀번호 (8자 이상)"
          value={pwForm.next}
          onChange={(e) => setPwForm((f) => ({ ...f, next: e.target.value }))}
          className="input-base"
          minLength={8}
        />
        <input
          type="password"
          placeholder="새 비밀번호 확인"
          value={pwForm.confirm}
          onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))}
          className="input-base"
          minLength={8}
        />

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
