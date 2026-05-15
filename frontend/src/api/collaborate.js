import axiosInstance from './axiosInstance';

export const collaborateApi = {
  invite: (noteId, data) => axiosInstance.post(`/collaborate/${noteId}/invite`, data),
  getCollaborators: (noteId) => axiosInstance.get(`/collaborate/${noteId}`),
  removeCollaborator: (noteId, userId) => axiosInstance.delete(`/collaborate/${noteId}/${userId}`),
};
