import api from './axios';

export const adminApi = {
  getStats: () => api.get('/api/admin/stats'),
  getCompanies: (status = 'ALL') => api.get('/api/admin/companies', { params: { status } }),
  approveCompany: (id) => api.patch(`/api/admin/companies/${id}/approve`),
  rejectCompany: (id, reason) => api.patch(`/api/admin/companies/${id}/reject`, { reason }),
  getUsers: () => api.get('/api/admin/users'),
  deleteUser: (id) => api.delete(`/api/admin/users/${id}`),
};
