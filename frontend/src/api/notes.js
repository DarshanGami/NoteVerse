import axiosInstance from './axiosInstance';

export const notesApi = {
  getNotes: (params) => axiosInstance.get('/notes', { params }),
  createNote: (data) => axiosInstance.post('/notes', data),
  getNote: (id) => axiosInstance.get(`/notes/${id}`),
  updateNote: (id, data) => axiosInstance.put(`/notes/${id}`, data),
  deleteNote: (id) => axiosInstance.delete(`/notes/${id}`),
  permanentDelete: (id) => axiosInstance.delete(`/notes/${id}/permanent`),
  restoreNote: (id) => axiosInstance.put(`/notes/${id}/restore`),
  togglePin: (id) => axiosInstance.put(`/notes/${id}/pin`),
  toggleFavourite: (id) => axiosInstance.put(`/notes/${id}/favourite`),
  lockNote: (id, data) => axiosInstance.post(`/notes/${id}/lock`, data),
  unlockNote: (id, data) => axiosInstance.post(`/notes/${id}/unlock`, data),
  getTrash: () => axiosInstance.get('/notes/trash'),
  getSharedWithMe: () => axiosInstance.get('/notes/shared-with-me'),
  searchNotes: (q) => axiosInstance.get('/notes/search', { params: { q } }),
  shareNote: (id, data) => axiosInstance.post(`/share/${id}`, data),
  getSharedNote: (token) => axiosInstance.get(`/share/public/${token}`),
  exportNote: (id, format) => axiosInstance.get(`/notes/${id}/export`, { params: { format }, responseType: 'blob' }),
};
