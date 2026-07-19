import api from './axios';

export const reviewApi = {
  // 리뷰 작성 (고객, 완료된 의뢰 기준)
  create: (requestId, data) => api.post(`/api/reviews/request/${requestId}`, data),
};
