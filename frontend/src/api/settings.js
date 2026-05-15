import axiosInstance from './axiosInstance';

export const settingsApi = {
  getProfile: () => axiosInstance.get('/settings/profile'),
  updateProfile: (data) => axiosInstance.put('/settings/profile', data),
  changePassword: (data) => axiosInstance.put('/settings/password', data),
  getSessions: () => axiosInstance.get('/settings/sessions'),
  revokeSession: (id) => axiosInstance.delete(`/settings/sessions/${id}`),
  revokeAllSessions: () => axiosInstance.delete('/settings/sessions'),
  getAuditLogs: () => axiosInstance.get('/settings/audit-logs'),
  uploadAvatar: (formData) => axiosInstance.post('/settings/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};
