import axiosInstance from './axiosInstance';

export const foldersApi = {
  getFolders: () => axiosInstance.get('/folders'),
  createFolder: (data) => axiosInstance.post('/folders', data),
  updateFolder: (id, data) => axiosInstance.put(`/folders/${id}`, data),
  deleteFolder: (id) => axiosInstance.delete(`/folders/${id}`),
};
