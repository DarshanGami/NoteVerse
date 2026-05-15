import axiosInstance from './axiosInstance';

export const tagsApi = {
  getTags: () => axiosInstance.get('/tags'),
  createTag: (data) => axiosInstance.post('/tags', data),
  updateTag: (id, data) => axiosInstance.put(`/tags/${id}`, data),
  deleteTag: (id) => axiosInstance.delete(`/tags/${id}`),
};
