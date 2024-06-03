export const getUrlParam = (name: string) => {
  const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)');
  const r = window.location.search.substr(1).match(reg);
  if (r !== null) return unescape(r[2]);
  return null;
};

export const getStoreUserInfo = (): API.userInfo => {
  const wxid = getUrlParam('wxid') || '';
  try {
    const user = JSON.parse(localStorage.getItem(wxid) || '{}');
    return user as API.userInfo;
  } catch (e) {
    return {} as API.userInfo;
  }
};
