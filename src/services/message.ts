import { request } from '@@/exports';

export const getMessage = (params?: any) => {
  return request<API.MessageItem[]>('/api/getMsg', {
    method: 'POST',
    data: params,
  });
};

export const sendMessage = (params: any) => {
  return request('/api/sendMsg', { method: 'POST', data: params });
};
