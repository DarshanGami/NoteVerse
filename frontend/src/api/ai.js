import axiosInstance from './axiosInstance';

export const aiApi = {
  summarize: (content) => axiosInstance.post('/ai/summarize', { content }),
  grammar: (content) => axiosInstance.post('/ai/grammar', { content }),
  rewrite: (content, instruction) => axiosInstance.post('/ai/rewrite', { content, instruction }),
  suggestTags: (content) => axiosInstance.post('/ai/tags', { content }),
};
