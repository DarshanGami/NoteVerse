import axiosInstance from './axiosInstance';

export const authApi = {
  register: (data) => axiosInstance.post('/auth/register', data),
  login: (data) => axiosInstance.post('/auth/login', data),
  refresh: (data) => axiosInstance.post('/auth/refresh', data),
  logout: (data) => axiosInstance.post('/auth/logout', data),
  forgotPassword: (data) => axiosInstance.post('/auth/forgot-password', data),
  resetPassword: (data) => axiosInstance.post('/auth/reset-password', data),
  setup2fa: () => axiosInstance.post('/auth/2fa/setup'),
  verify2fa: (data) => axiosInstance.post('/auth/2fa/verify', data),
  disable2fa: (data) => axiosInstance.post('/auth/2fa/disable', data),
  loginWithGoogle: (data) => axiosInstance.post('/auth/oauth/google', data),
  loginWithGithub: (data) => axiosInstance.post('/auth/oauth/github', data),
};
