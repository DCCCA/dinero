import type { FC } from "../../../lib/teact/teact";
import React, {memo, useCallback} from "../../../lib/teact/teact";
import { getActions, withGlobal } from "../../../global";

import type { ApiUser } from "../../../api/types";

import { selectUser } from "../../../global/selectors";
import buildClassName from "../../../util/buildClassName";
import { copyTextToClipboard } from "../../../util/clipboard";
import { completeJoinTask } from "../../../api/axios/task";

import Button from "../../ui/Button";

import NextIcon from '../../../assets/dinero/next.png';
import TipsIcon from '../../../assets/dinero/score_q.png';
import TaskIcon1 from '../../../assets/dinero/task_1.png';
import TaskIcon2 from '../../../assets/dinero/task_2.png';
import TaskIcon3 from '../../../assets/dinero/task_3.png';

export enum TaskType {
  DAILY = 1,
  INVITE = 2,
  FOLLOW = 3,
  BIND = 4
}

export const TaskIconHash = {
  [TaskType.DAILY]: TaskIcon1,
  [TaskType.BIND]: TaskIcon1,
  [TaskType.INVITE]: TaskIcon2,
  [TaskType.FOLLOW]: TaskIcon3,
} as const;

export const TaskTitleHash = {
  [TaskType.DAILY]: "Daily Sign",
  [TaskType.INVITE]: "Invite friend tasks",
  [TaskType.FOLLOW]: "Joining Dinero group earns 5 points.",
  [TaskType.BIND]: "Bind Telegram Account",
} as const;

export const TaskDescHash = {
  [TaskType.DAILY]: [],
  [TaskType.INVITE]: [
    "Inviting 1 friend earns 2 points.",
    "Inviting 2 friend earns 5 points.",
    "Inviting 3 friend earns 8 points."
  ],
  [TaskType.FOLLOW]: [],
  [TaskType.BIND]: [],
} as const;

export interface TaskItem {
  type: TaskType;
  title: string;
  content: string[];
  tips?: string;
}

const JOIN_TASK_GROUP_URL = 'https://t.me/DineroLabs';
const GROUP_CHAT_ID = '-1002237895362';
const GROUP_NAME = 'DineroLabs';

export interface OwnProps {
  taskInfo: TaskItem;
  inviteCode: string;
}

interface StateProps {
  isInApp: boolean;
  currentUserInfo?: ApiUser;
}

declare global {
  interface Window {
    CusTgJsBridge?: {
      copyText: (text: string) => void;
      jump: (page: string) => void;
    };
  }
}

const TaskItemComp: FC<StateProps & OwnProps> = (props) => {
  const { taskInfo, inviteCode, isInApp, currentUserInfo } = props;
  const { type, tips } = taskInfo;

  const {
    showNotification,
    searchGroupChat,
    openChat,
    joinChannel,
  } = getActions();

  const onCompleteJoinTask = useCallback(() => {
    if (!currentUserInfo) {
      return;
    }

    const currentUserNameInfoList = currentUserInfo.usernames || [];
    let userName = '';

    for (let i = 0; i < currentUserNameInfoList.length; i++) {
      if (currentUserNameInfoList[i].isActive) {
        userName = currentUserNameInfoList[i].username;
      }
    }

    completeJoinTask({
      group_url: JOIN_TASK_GROUP_URL,
      tg_name: userName,
      phone: currentUserInfo.phoneNumber || '',
      nick_name: (currentUserInfo.firstName || currentUserInfo.lastName)
        ? `${currentUserInfo.firstName} ${currentUserInfo.lastName}`
        : '',
    });
  }, [currentUserInfo]);

  const onTaskClick = useCallback(async () => {
    if (taskInfo.type === TaskType.INVITE) {
      if (!isInApp) {
        copyTextToClipboard(inviteCode);
        showNotification({ message: `invite code was copied` });
      } else {
        window.CusTgJsBridge?.copyText(inviteCode);
      }
    } else if (taskInfo.type === TaskType.FOLLOW) {
      if (!isInApp) {
        await searchGroupChat({ name: GROUP_NAME });
        openChat({ id: GROUP_CHAT_ID });
        joinChannel({ chatId: GROUP_CHAT_ID });
        onCompleteJoinTask();
      } else {
        window.CusTgJsBridge?.jump(GROUP_NAME);
      }
    }
  }, [taskInfo.type, inviteCode, isInApp, onCompleteJoinTask]);

  return (
    <Button className="task__item" onClick={onTaskClick}>
      {
        type !== TaskType.DAILY && <img src={TaskIconHash[type]} alt="task" className="task__item-icon"  />
      }
      <div className="task__item-main">
        <div className="task__item-title">
          <span className="task__item-title-content">{ TaskTitleHash[type] }</span>
          {
            tips && <img src={TipsIcon} className="task__item-title-tips" alt="tips" />
          }
        </div>
        {
          TaskDescHash[type].map(str => (
            <div className="task__item-content">{str}</div>
          ))
        }
      </div>
      <img className={buildClassName(
        "task__item-next",
        !TaskDescHash[type].length && "no-content"
      )} src={NextIcon} alt="btn"/>
    </Button>
  );
};

export default memo(withGlobal<OwnProps>(
  (global): StateProps => {
    return {
      isInApp: global.dineroIsInApp,
      currentUserInfo: global.currentUserId ? selectUser(global, global.currentUserId) : undefined
    };
  },
)(TaskItemComp));
