declare namespace API {
  type Response<T = any> = {
    code: number;
    Message: T;
  };

  export interface userInfo {
    id: number;
    exptime: number;
    token: string;
    beizhu: any;
    wxid: string;
    NickName: string;
    imgName: string;
    role: 1 | 0;
  }

  export interface MessageItem {
    index: number;
    type: number;
    content: string;
    headimg?: string;
    NickName?: string;
    wxid?: string;
    time?: string;
    loading?: boolean;
    role: 1 | 0;
  }
}
