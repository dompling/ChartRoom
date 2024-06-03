import Message from '@/components/Message';
import { getMessage, sendMessage } from '@/services/message';
import { useModel, useRequest, useSearchParams } from '@@/exports';
import $ from 'jquery';
import _ from 'lodash';
import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';

import './index.less';

let interval: any;

function scrollBottom() {
  _.debounce(() => {
    $('.msgcontent')?.animate(
      { scrollTop: $('.msgcontent')?.[0]?.scrollHeight },
      0,
    );
  }, 100)();
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
    fetchKey: (params) => `${params.index}`,
    formatResult: (res) => res,
    onSuccess: (response: API.MessageItem[], [param]) => {
      if (param.index === 0 || (response.length && !showTag)) scrollBottom();
      if (
        !oldMsgId &&
        (_.last(dataSource)?.index || 0) < (_.first(response)?.index || 0)
      ) {
        setOldMsgId(_.last(dataSource)?.index || 0);
      }
      handleScroll();
      setMsgData(response);
    },
    onError: () => {
      clearInterval(interval);
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
    interval = setInterval(throttledFunction, 1000);
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
      content: encodeURIComponent($('#txtMsg').val() as string),
      headimg: initialState?.userInfo?.imgName,
      NickName: initialState?.userInfo?.NickName,
      wxid: initialState?.userInfo?.wxid,
      time: moment().format('HH:mm:ss'),
      loading: true,
      role: initialState.userInfo?.role,
    } as API.MessageItem;
  };

  let msgCount = 0;
  if (oldMsgId) {
    const oldIndex = dataSource.findIndex((item) => item.index === oldMsgId);
    msgCount = dataSource.length - 1 - oldIndex;
  }

  const handleChange = (text: string) => {
    const val = $('#txtMsg').val();
    $('#txtMsg').val(`${val}${text}`);
  };

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
        {(fetchOldMsg.loading || fetchMsg.fetches[0]?.loading) && (
          <div className="msgload throbber-loader">Loading…</div>
        )}
        {pagination.complete && <div className="noMore">没有更多消息</div>}
        <div id="msgout"></div>
        {!fetchMsg.fetches[0]?.loading &&
          dataSource.map((item) => {
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
                autoComplete="off"
                className="nostart"
              ></textarea>
              <span
                className="send nostart"
                onClick={() => {
                  if (!$('#txtMsg').val()) return;
                  const msg = creatMsg();
                  setDataSource([...dataSource, msg]);
                  fetchSend.run(msg);
                  $('#txtMsg').val('');
                  scrollBottom();
                }}
              >
                发送
              </span>
            </div>
          </div>
          <div className="inpvkb">
            <ul className="nb">
              <li onClick={() => handleChange(`1`)}>1</li>
              <li onClick={() => handleChange(`2`)}>2</li>
              <li onClick={() => handleChange(`3`)}>3</li>
              <li onClick={() => handleChange(`4`)}>4</li>
              <li onClick={() => handleChange(`5`)}>5</li>
              <li onClick={() => handleChange(`6`)}>6</li>
              <li
                className="del"
                onClick={() => {
                  const val = $('#txtMsg').val() as string;
                  $('#txtMsg').val(val.slice(0, -1));
                }}
              >
                ×
              </li>
            </ul>
            <ul className="dw">
              <li onClick={() => handleChange(`=`)}>=</li>
              <li onClick={() => handleChange(`/`)}>/</li>
              <li onClick={() => handleChange(`0`)}>0</li>
              <li onClick={() => handleChange(`7`)}>7</li>
              <li onClick={() => handleChange(`8`)}>8</li>
              <li onClick={() => handleChange(`9`)}>9</li>
              <li onClick={() => handleChange(`取消`)}>取消</li>
            </ul>
            <ul className="nb">
              <li onClick={() => handleChange(`番`)}>番</li>
              <li onClick={() => handleChange(`角`)}>角</li>
              <li onClick={() => handleChange(`念`)}>念</li>
              <li onClick={() => handleChange(`正`)}>正</li>
              <li onClick={() => handleChange(`无`)}>无</li>
              <li onClick={() => handleChange(`查`)}>查</li>
              <li onClick={() => handleChange(`上`)}>上</li>
            </ul>
            <ul className="fh">
              <li onClick={() => handleChange(`大`)}>大</li>
              <li onClick={() => handleChange(`小`)}>小</li>
              <li onClick={() => handleChange(`单`)}>单</li>
              <li onClick={() => handleChange(`双`)}>双</li>
              <li className="bspace" onClick={() => handleChange(` `)}></li>
              <li onClick={() => handleChange(`流水`)}>流水</li>
              <li onClick={() => handleChange(`下`)}>下</li>
            </ul>
          </div>
        </div>
      </form>
    </div>
  );
};

export default HomePage;
