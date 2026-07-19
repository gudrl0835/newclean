import api from './axios';

export const authApi = {
  // 고객 회원가입
  signupCustomer: (data) => api.post('/api/auth/signup/customer', data),

  // 업체 회원가입
  signupCompany: (data) => api.post('/api/auth/signup/company', data),

  // 로그인
  login: (data) => api.post('/api/auth/login', data),

  // 내 정보
  getMe: () => api.get('/api/auth/me'),

  // 이메일 중복 확인
  checkEmail: (email) => api.get('/api/auth/check-email', { params: { email } }),
};
