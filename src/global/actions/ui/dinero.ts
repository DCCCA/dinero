import qs from 'qs';

import type { ActionReturnType } from '../../types';
import { MainTabStatus,PageStatus } from '../../../types';

import { AXIOS_TOKEN_KEY_IN_URL, IS_DINERO_IN_URL } from '../../../config';
import { buildCollectionByKey } from '../../../util/iteratees';
import { callApi } from '../../../api/gramjs';
import { addActionHandler, getGlobal, setGlobal } from '../../index';
import { addChats } from '../../reducers';
import { selectTheme } from '../../selectors';

addActionHandler('initDineroFromApp', (global): ActionReturnType => {
  const params = qs.parse(window.location.search.slice(1));
  const isInApp = params[IS_DINERO_IN_URL] === '1';
  const tokenFromApp = (params[AXIOS_TOKEN_KEY_IN_URL] || '') as string;

  return {
    ...global,
    dineroIsInApp: isInApp,
    dineroTokenFromApp: isInApp ? tokenFromApp : '',
  };
});

addActionHandler('changeMainTabStatus', (global, actions, payload): ActionReturnType => {
  const {
    newTab,
  } = payload!;
  const theme = selectTheme(global);
  const isDarkTheme = theme === 'dark';
  const themeColorTag = document.querySelector('meta[name="theme-color"]');


  if (newTab === MainTabStatus.Task) {
    if (themeColorTag) {
      themeColorTag.setAttribute('content', '#141416');
    }
    document.body.classList.add('is-task');
  } else {
    if (themeColorTag) {
      themeColorTag.setAttribute('content', isDarkTheme ? '#212121' : '#fff');
    }
    document.body.classList.remove('is-task');
  }

  return {
    ...global,
    mainTabStatus: newTab
  };
});

addActionHandler('updateShowDineroScoreDetail', (global, actions, payload): ActionReturnType => {
  const {
    showScoreDetail,
  } = payload!;

  return {
    ...global,
    pageStatus: showScoreDetail ? PageStatus.ScoreDetail : PageStatus.Index,
  };
});

addActionHandler('initDineroTaskList', (global, actions, payload): ActionReturnType => {
  const {
    taskList,
  } = payload!;

  return {
    ...global,
    dineroTaskList: taskList
  };
});

addActionHandler('updateDineroTotalScore', (global, actions, payload): ActionReturnType => {
  const {
    score,
  } = payload!;

  return {
    ...global,
    dineroTotalScore: score
  };
});

addActionHandler('updateDineroInviteCode', (global, actions, payload): ActionReturnType => {
  const {
    code,
  } = payload!;

  return {
    ...global,
    dineroInviteCode: code
  };
});

addActionHandler('updateDineroSignedInfo', (global, actions, payload): ActionReturnType => {
  const {
    hasSigned,
    todaySigned
  } = payload!;

  return {
    ...global,
    dineroHasSigned: typeof hasSigned === 'undefined' ? global.dineroHasSigned : hasSigned,
    dineroTodaySigned: typeof todaySigned === 'undefined' ? global.dineroTodaySigned : todaySigned,
  };
});

addActionHandler('searchGroupChat', async (global, actions, payload): Promise<void> => {
  const {
    name
  } = payload!;

  const result = await callApi('searchChats', { query: name });
  const {
    globalChats = [], accountChats = [],
  } = result || {};
  const chats = [...accountChats, ...globalChats];

  global = getGlobal();

  if (chats.length) {
    global = addChats(global, buildCollectionByKey(chats, 'id'));
  }

  setGlobal(global);
});
