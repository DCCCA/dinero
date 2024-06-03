import type { FC } from "../../../lib/teact/teact";
import React, { memo, useCallback } from "../../../lib/teact/teact";
import { getActions, withGlobal } from "../../../global";

import buildClassName from "../../../util/buildClassName";
import { completeTask } from "../../../api/axios/task";

import Button from "../../ui/Button";
import { TaskType } from "./TaskItem";

import CompleteIcon from "../../../assets/dinero/complete.png";
import TaskGift from "../../../assets/dinero/gift.png";
import TaskGiftDisabled from "../../../assets/dinero/gift_disabled.png";

interface OwnProps {
  hasSigned: number;
  todayHasSigned: boolean;
  today: number;
  onComplete: () => void;
};

interface StateProps {
  isInApp: boolean;
}

const DAY_LIST = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th'];
const SCORE_LIST = [1, 1, 1, 1, 1, 1, 5];

const DailyItem: FC<StateProps & OwnProps> = (props) => {
  const { hasSigned, today, todayHasSigned, isInApp, onComplete } = props;

  const {
    showNotification,
  } = getActions();

  const onClick = useCallback(async () => {
    if (hasSigned !== today || todayHasSigned) {
      return;
    }

    const res = await completeTask(TaskType.DAILY);

    if (res.data.success) {
      onComplete();

      if (!isInApp) {
        showNotification({ message: 'Task Completed !'});
      }
    }
  }, [hasSigned, today, todayHasSigned, isInApp, onComplete]);

  const realDate = todayHasSigned ? hasSigned - 1 : hasSigned;

  return (
    <Button
      className={buildClassName("daily__table-item", realDate === today && "today")}
      onClick={onClick}
    >
      {
        hasSigned > today && (
          <img src={CompleteIcon} className="daily__table-item-complete" alt="completeIcon" />
        )
      }
      <div className="daily__table-item-title">Point</div>
      {
        (realDate > today || (realDate === today && todayHasSigned)) ? (
          <span className="daily__table-item-score">{SCORE_LIST[today]}</span>
        ) : (
          <img
            src={realDate === today ? TaskGift : TaskGiftDisabled}
            className="daily__table-item-gift"
            alt="gift"
          />
        )
      }
      <div
        className={buildClassName(
          "daily__table-item-info",
          realDate === today && "active",
          realDate < today && "disabled"
        )}
      >
        {
          realDate === today ? "Today" : `${DAY_LIST[today]}`
        }
      </div>
    </Button>
  );
};

export default memo(withGlobal<OwnProps>(
  (global): StateProps => {
    return {
      isInApp: global.dineroIsInApp,
    };
  },
)(DailyItem));
