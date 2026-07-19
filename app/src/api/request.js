import api from './axios';

export const requestApi = {
  // 의뢰 생성 (고객)
  create: (data) => api.post('/api/requests', data),

  // 내 의뢰 목록 (고객)
  getMyRequests: () => api.get('/api/requests/my'),

  // 견적 수락 (고객)
  accept: (id) => api.patch(`/api/requests/${id}/accept`),

  // 의뢰 취소 (고객)
  cancel: (id) => api.patch(`/api/requests/${id}/cancel`),

  // 업체 받은 의뢰 목록
  getCompanyRequests: () => api.get('/api/requests/company'),

  // 업체 통계
  getCompanyStats: () => api.get('/api/requests/company/stats'),

  // 견적서 발송 (업체)
  sendQuotation: (id, data) => api.post(`/api/requests/${id}/quote`, data),

  // 의뢰 거절 (업체)
  reject: (id) => api.patch(`/api/requests/${id}/reject`),

  // 청소 시작 (업체)
  start: (id) => api.patch(`/api/requests/${id}/start`),

  // 완료 처리 (업체)
  complete: (id) => api.patch(`/api/requests/${id}/complete`),
};
