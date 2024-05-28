import { getUserInfo } from '@/services/user';
import { getStoreUserInfo, getUrlParam } from '@/utils';
import { CACHE_KEY } from '@/utils/config';
import { RequestConfig } from '@@/plugin-request/request';

export async function getInitialState(): Promise<{ userInfo?: API.userInfo }> {
  const wxid = getUrlParam('wxid') || '';
  let userInfo: API.userInfo = getStoreUserInfo();
  if (!userInfo.wxid) userInfo = await getUserInfo(wxid);
  return { userInfo };
}

export const request: RequestConfig<API.Response> = {
  errorConfig: {},
  requestInterceptors: [
    (url, options) => {
      const opt: string[] = [];
      options.data = options.data || {};
      const userInfo: API.userInfo = getStoreUserInfo();
      if (!userInfo.wxid && !options.skipErrorHandler) {
        throw new Error('未登录');
      }
      options.data.token = userInfo.token;
      options.data.wxid = userInfo.wxid || options.data.wxid;

      Object.entries(options.data || {}).forEach(([key, val]) => {
        opt.push(`${key}=${val}`);
      });
      return { url: `${process.env.API}${url}?${opt.join('&')}`, options };
    },
  ],
  responseInterceptors: [
    (response: any) => {
      if (response.data?.code === 1) {
        response.data = response.data.Message || response.data.message;
        return response;
      }
      const userInfo: API.userInfo = getStoreUserInfo();
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ ...userInfo, wxid: null }),
      );
      throw new Error(JSON.stringify(response));
    },
  ],
};
