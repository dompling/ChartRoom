import { getUserInfo } from '@/services/user';
import { getStoreUserInfo, getUrlParam } from '@/utils';
import { API } from '@/utils/config';
import { history } from '@@/exports';
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
      return { url: `${API}${url}?${opt.join('&')}`, options };
    },
  ],
  responseInterceptors: [
    (response: any) => {
      if (response.data?.code === 1) {
        response.data = response.data.Message || response.data.message;
        return response;
      }
      if ([-1, 0].includes(response.data.code)) {
        localStorage.clear();
        history.push('/404');
      }
      throw new Error(JSON.stringify(response));
    },
  ],
};
