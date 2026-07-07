import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiPhone } from 'react-icons/fi';
import { authApi } from '../../api/auth';
import useAuthStore from '../../store/authStore';

function formatPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export default function CustomerSignup() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  const from = location.state?.from || '/';

  const [form, setForm] = useState({ name: '', email: '', password: '', passwordConfirm: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));
  const setPhone = (e) => setForm(f => ({ ...f, phone: formatPhone(e.target.value) }));

  const validate = () => {
    if (!form.name.trim()) return '이름을 입력해주세요.';
    if (!form.email.trim()) return '이메일을 입력해주세요.';
    if (!/^010-\d{4}-\d{4}$/.test(form.phone)) return '전화번호를 올바르게 입력해주세요. (010-0000-0000)';
    if (form.password.length < 8) return '비밀번호는 8자 이상이어야 합니다.';
    if (form.password !== form.passwordConfirm) return '비밀번호가 일치하지 않습니다.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) return setError(validationError);
    setError('');
    setLoading(true);

    try {
      await authApi.signupCustomer({
        email: form.email,
        password: form.password,
        name: form.name,
        phone: form.phone,
      });
      const loginRes = await authApi.login({ email: form.email, password: form.password });
      login(loginRes.data);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">

        <h1 className="text-2xl font-bold text-gray-900 mb-1">고객 회원가입</h1>
        <p className="text-gray-500 text-sm mb-6">기본 정보를 입력해주세요</p>

        {/* 안전번호 안내 */}
        <div className="card bg-blue-50 border-blue-100 mb-5">
          <p className="text-xs text-blue-700 font-semibold mb-1">🔒 안전번호 서비스</p>
          <p className="text-xs text-blue-600 leading-relaxed">
            의뢰가 체결되면 실제 전화번호 대신 <strong>가상 안전번호</strong>로만 연락하여
            개인정보를 안전하게 보호합니다.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text" placeholder="이름"
              value={form.name} onChange={set('name')}
              className="input-base pl-10" required
            />
          </div>
          <div className="relative">
            <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="email" placeholder="이메일"
              value={form.email} onChange={set('email')}
              className="input-base pl-10" required
            />
          </div>
          <div className="relative">
            <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="tel" placeholder="전화번호 (010-0000-0000)"
              value={form.phone} onChange={setPhone}
              className="input-base pl-10" required
            />
            <p className="text-xs text-gray-400 mt-1 ml-1">
              🔒 실제 번호는 의뢰 체결 후 안전번호로 대체됩니다
            </p>
          </div>
          <div className="relative">
            <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="password" placeholder="비밀번호 (8자 이상)"
              value={form.password} onChange={set('password')}
              className="input-base pl-10" required minLength={8}
            />
          </div>
          <div className="relative">
            <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="password" placeholder="비밀번호 확인"
              value={form.passwordConfirm} onChange={set('passwordConfirm')}
              className="input-base pl-10" required
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center bg-red-50 py-2 px-3 rounded-lg">{error}</p>
          )}

          <button type="submit" className="btn-primary mt-2" disabled={loading}>
            {loading ? '가입 중...' : '가입하기'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" state={{ from }} className="text-brand font-semibold hover:underline">로그인</Link>
        </p>
      </div>
    </div>
  );
}
