import { getStoreUserInfo } from '@/utils';
import * as nodeEmoji from 'node-emoji';
import React from 'react';

const Message: React.FC<{ data: API.MessageItem; loading?: boolean }> = ({
  data,
}) => {
  const userInfo = getStoreUserInfo();
  const content = nodeEmoji.emojify(decodeURIComponent(data.content));

  return (
    <div
      className={`msglayer ${data.wxid !== userInfo.wxid ? 'msgleft' : 'msgright'}`}
    >
      <div className="fpop">
        <div className="headimg">
          <img src={data.headimg} alt={data.wxid} />
        </div>
        <h5 className="uname">
          {data.NickName}
          <span>{data.time}</span>
        </h5>
        {data.loading && (
          <div className="msg-loader">
            <div className="throbber-loader">Loading…</div>
          </div>
        )}

        <div className="msgimg">
          {data.type === 2 ? (
            <a>
              <img src={data.content} alt="图片" />
            </a>
          ) : (
            <pre className="msgpre">{content}</pre>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;
