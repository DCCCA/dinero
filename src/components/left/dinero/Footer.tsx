import { type FC,memo, useCallback } from "../../../lib/teact/teact";
import React from "../../../lib/teact/teact";
import { getActions,withGlobal } from "../../../global";

import { MainTabStatus } from "../../../types";

import buildClassName from "../../../util/buildClassName";

import './Footer.scss';

import Home from '../../../assets/dinero/home.png';
import HomeActive from '../../../assets/dinero/home_active.png';
import Task from '../../../assets/dinero/task.png';
import TaskActive from '../../../assets/dinero/task_active.png';

interface StateProps {
  mainTabStatus: MainTabStatus;
};

const Footer: FC<StateProps> = ({
  mainTabStatus
}) => {
  const {
    changeMainTabStatus
  } = getActions();

  const handleChangeTabStatus = useCallback((newTab: MainTabStatus) => {
    return changeMainTabStatus({
      newTab
    });
  }, [changeMainTabStatus]);

  return (
    <div
      id="Custom_Footer"
      className={buildClassName(
        "Custom_Footer",
        mainTabStatus === MainTabStatus.Task && "task"
      )}
    >
      <div
        className={buildClassName("tab__item", mainTabStatus === MainTabStatus.TeleGram && "active")}
        onClick={() => handleChangeTabStatus(MainTabStatus.TeleGram)}
      >
        <img
          className="tab__item-icon"
          alt="Chats"
          src={mainTabStatus === MainTabStatus.TeleGram ? HomeActive : Home}
          style='top: 0.125rem'
        />
        Chats
      </div>
      <div
        className={buildClassName("tab__item", mainTabStatus === MainTabStatus.Task && "active")}
        onClick={() => handleChangeTabStatus(MainTabStatus.Task)}
      >
        <img
          className="tab__item-icon"
          alt="Chats"
          src={mainTabStatus === MainTabStatus.Task ? TaskActive : Task}
        />
        Dinero
      </div>
    </div>
  );
};

export default memo(withGlobal(
  (global): StateProps => {
    return {
      mainTabStatus: global.mainTabStatus || MainTabStatus.TeleGram,
    };
  },
)(Footer));
