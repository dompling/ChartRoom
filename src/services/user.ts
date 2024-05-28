import { CACHE_KEY } from '@/utils/config';
import { request } from '@@/exports';

export const getUserInfo = (wxid: string) => {
  return request<API.userInfo[]>('/api/getuserinfo', {
    method: 'POST',
    data: { wxid },
    skipErrorHandler: true,
  }).then((response) => {
    localStorage.setItem(CACHE_KEY, JSON.stringify(response?.[0] || {}));
    return response?.[0];
  });
};
