import api from './axios';

export const companyApi = {
  // 홈 추천 업체
  getTopCompanies: () => api.get('/api/companies'),

  // 지역 검색
  searchByRegion: (sido, sigungu, sort = 'rating') =>
    api.get('/api/companies/search', { params: { sido, sigungu, sort } }),

  // GPS 검색
  searchNearby: (lat, lng, radius = 10, sort = 'rating') =>
    api.get('/api/companies/nearby', { params: { lat, lng, radius, sort } }),

  // 업체 상세
  getCompany: (id) => api.get(`/api/companies/${id}`),

  // 활동 지역 수정 (업체 본인)
  updateRegion: (data) => api.patch('/api/companies/region', data),
};
