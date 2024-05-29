import Message from '@/components/Message';
import { getMessage, sendMessage } from '@/services/message';
import { useModel, useRequest, useSearchParams } from '@@/exports';
import $ from 'jquery';
import _ from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';

import './index.less';

function scrollBottom() {
  _.debounce(() => {
    $('.msgcontent').animate(
      { scrollTop: $('.msgcontent')[0].scrollHeight },
      100,
    );
  }, 300)();
}

const HomePage: React.FC = () => {
  const { initialState } = useModel('@@initialState');

  const [pagination, setPagination] = useState({
    index: 0,
    count: 40,
    complete: false,
  });

  const [keyboard, setKeyboard] = useState<boolean>();

  const [oldMsgId, setOldMsgId] = useState(0);
  const [showTag, setShowTag] = useState<boolean>(false);
  const [value, setValue] = useState<string>('');
  const [dataSource, setDataSource] = useState<API.MessageItem[]>([]);

  const [params] = useSearchParams();
  const wxid = params.get('wxid');

  function handleScroll() {
    const { scrollTop, clientHeight, scrollHeight } = $('.msgcontent')[0];
    const isShowTag = scrollTop + clientHeight <= scrollHeight - 100;
    if (!isShowTag) setOldMsgId(0);
    setShowTag(isShowTag);
  }

  const setMsgData = (response: API.MessageItem[]) => {
    const data: Record<string, API.MessageItem> = {};

    dataSource.forEach((item) => {
      if (!item.loading) data[item.index] = item;
    });

    response.forEach((item) => {
      if (!item.loading) data[item.index] = item;
    });

    let newDataSource: API.MessageItem[] = Object.values(data);
    newDataSource = _.sortBy(
      newDataSource,
      (item: API.MessageItem) => item.index,
    );
    setDataSource(newDataSource);
  };

  const fetchMsg = useRequest(getMessage, {
    manual: true,

    formatResult: (res) => res,
    onSuccess: (response: API.MessageItem[], [param]) => {
      if (param.index === 0 || response.length) scrollBottom();
      if (
        !oldMsgId &&
        (_.last(dataSource)?.index || 0) < (_.first(response)?.index || 0)
      ) {
        setOldMsgId(_.last(dataSource)?.index || 0);
      }
      handleScroll();
      setMsgData(response);
    },
  });

  const fetchOldMsg = useRequest(getMessage, {
    manual: true,
    formatResult: (res) => res,
    onSuccess: (response) => {
      setPagination({
        ...pagination,
        complete: !response.length || response.length < pagination.count,
      });
      $('.msgcontent').scrollTop(100);
      setMsgData(response);
    },
  });

  const fetchSend = useRequest(sendMessage, { manual: true });

  useEffect(() => {
    $('#txtMsg').on('blur', function () {
      //alert("松开输入");
      window.scroll(0, 0); //失焦后强制让页面归位
    });
  }, []);

  const throttledFunction = useCallback(
    _.throttle(() => {
      if (!fetchMsg.loading)
        fetchMsg.run({
          ...pagination,
          index: _.last(dataSource.filter((item) => !item.loading))?.index || 0,
        });
    }, 1000),
    [dataSource],
  );

  const oldMsgFunction = useCallback(() => {
    const historyIndex =
      (_.first(dataSource.filter((item) => !item.loading))?.index || 0) -
      pagination.count -
      1;
    fetchOldMsg.run({ ...pagination, index: historyIndex });
  }, [dataSource]);

  useEffect(() => {
    const interval = setInterval(throttledFunction, 1000);
    return () => clearInterval(interval);
  }, [throttledFunction]);

  useEffect(() => {
    $('#txtMsg').on('blur', function () {
      //alert("松开输入");
      window.scroll(0, 0); //失焦后强制让页面归位
    });
  }, []);

  if (!wxid || !initialState?.userInfo?.wxid) return `抱歉你访问的页面不存在`;

  const creatMsg = () => {
    return {
      index: (_.last(dataSource)?.index || 0) + 1,
      type: 1,
      content: value,
      headimg: initialState?.userInfo?.imgName,
      NickName: initialState?.userInfo?.NickName,
      wxid: initialState?.userInfo?.wxid,
      loading: true,
    } as API.MessageItem;
  };

  let msgCount = 0;
  if (oldMsgId) {
    const oldIndex = dataSource.findIndex((item) => item.index === oldMsgId);
    msgCount = dataSource.length - 1 - oldIndex;
  }

  return (
    <div className={'container'}>
      <div
        className="msgcontent"
        style={{ paddingBottom: keyboard ? 260 : 120 }}
        onScroll={() => {
          const scrollTop = $('.msgcontent').scrollTop() || 0;
          if (
            scrollTop < 50 &&
            !pagination.complete &&
            fetchMsg.params[0]?.index &&
            !fetchOldMsg.loading
          ) {
            oldMsgFunction();
          }
          handleScroll();
        }}
      >
        <div id="debugout"></div>
        {fetchOldMsg.loading && (
          <div
            className="msgload throbber-loader"
          >
            Loading…
          </div>
        )}
        {pagination.complete && <div className="noMore">没有更多消息</div>}
        <div id="msgout"></div>
        {dataSource.map((item) => {
          return <Message key={item.index} data={item} />;
        })}
      </div>
      <form id="formsendmsg" onSubmit={() => false}>
        <div className={`divBottom ${keyboard ? 'msgdown selekb' : ''}`}>
          {showTag && (
            <div className="btndown" onClick={() => scrollBottom()}>
              <b>{msgCount}条新消息</b>
            </div>
          )}
          <div className="divBottom_top">
            <div className="send_actions">
              <div
                className="vkb"
                onClick={() => {
                  setKeyboard(!keyboard);
                }}
              >
                <ul>
                  <li></li>
                  <li></li>
                  <li></li>
                  <li></li>
                </ul>
              </div>
              <textarea
                rows={1}
                id="txtMsg"
                value={value}
                autoComplete="off"
                className="nostart"
                onChange={(e) => {
                  setValue(e.target.value);
                }}
              ></textarea>
              <span
                className="send nostart"
                onClick={() => {
                  const msg = creatMsg();
                  setDataSource([...dataSource, msg]);
                  fetchSend.run(msg);
                  setValue('');
                  scrollBottom();
                }}
              >
                发送
              </span>
            </div>
          </div>
          <div className="inpvkb">
            <ul className="nb">
              <li onClick={() => setValue(`${value}1`)}>1</li>
              <li onClick={() => setValue(`${value}2`)}>2</li>
              <li onClick={() => setValue(`${value}3`)}>3</li>
              <li onClick={() => setValue(`${value}4`)}>4</li>
              <li onClick={() => setValue(`${value}5`)}>5</li>
              <li onClick={() => setValue(`${value}6`)}>6</li>
              <li
                className="del"
                onClick={() => setValue(`${value}`.slice(0, -1))}
              >
                ×
              </li>
            </ul>
            <ul className="dw">
              <li onClick={() => setValue(`${value}=`)}>=</li>
              <li onClick={() => setValue(`${value}/`)}>/</li>
              <li onClick={() => setValue(`${value}0`)}>0</li>
              <li onClick={() => setValue(`${value}7`)}>7</li>
              <li onClick={() => setValue(`${value}8`)}>8</li>
              <li onClick={() => setValue(`${value}9`)}>9</li>
              <li onClick={() => setValue(`${value}取消`)}>取消</li>
            </ul>
            <ul className="nb">
              <li onClick={() => setValue(`${value}番`)}>番</li>
              <li onClick={() => setValue(`${value}角`)}>角</li>
              <li onClick={() => setValue(`${value}念`)}>念</li>
              <li onClick={() => setValue(`${value}堂`)}>堂</li>
              <li onClick={() => setValue(`${value}无`)}>无</li>
              <li onClick={() => setValue(`${value}查`)}>查</li>
              <li onClick={() => setValue(`${value}上`)}>上</li>
            </ul>
            <ul className="fh">
              <li onClick={() => setValue(`${value}大`)}>大</li>
              <li onClick={() => setValue(`${value}小`)}>小</li>
              <li onClick={() => setValue(`${value}单`)}>单</li>
              <li onClick={() => setValue(`${value}双`)}>双</li>
              <li className="bspace" onClick={() => setValue(`${value} `)}></li>
              <li onClick={() => setValue(`${value}流水`)}>流水</li>
              <li onClick={() => setValue(`${value}下`)}>下</li>
            </ul>
          </div>
        </div>
      </form>
    </div>
  );
};

export default HomePage;
