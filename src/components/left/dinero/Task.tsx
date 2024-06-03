import { type FC,memo, useCallback, useEffect } from "../../../lib/teact/teact";
import React from "../../../lib/teact/teact";
import { getActions, withGlobal } from "../../../global";

import type { TaskItem } from "./TaskItem";
import { PageStatus } from "../../../types";

import { LAYERS_ANIMATION_NAME } from "../../../util/windowEnvironment";
import { getTaskInfo, getTaskList } from "../../../api/axios/task";

import Button from "../../ui/Button";
import Transition from "../../ui/Transition";
import DailyItem from './DailyItem';
import Footer from "./Footer";
import ScoreDetail from "./scoreDetail/ScoreDetail";
import TaskItemComp, { TaskType } from "./TaskItem";

import './Task.scss';

import AIScoreBtnIcon from '../../../assets/dinero/score.png';
import AITips from '../../../assets/dinero/score_q.png';


interface StateProps {
  score: number;
  hasSigned: number;
  todayHasSigned: boolean;
  inviteCode: string;
  taskList: TaskItem[];
  isInApp: boolean;
  pageStatus: PageStatus;
};

const DAILY_NUM = 7;

const DAILY_NORMAL_LIST: Array<undefined> = [undefined, undefined,undefined,undefined,undefined, undefined];

const TaskComp: FC<StateProps> = ({
  score,
  hasSigned,
  todayHasSigned,
  inviteCode,
  taskList,
  isInApp,
  pageStatus,
}) => {
  const {
    initDineroTaskList,
    updateDineroInviteCode,
    updateDineroSignedInfo,
    updateDineroTotalScore,
    updateShowDineroScoreDetail,
  } = getActions();

  useEffect(() => {
    initTaskInfo();
    initTaskList();
  }, []);

  async function initTaskInfo () {
    try {
      const res = await getTaskInfo();

      updateDineroTotalScore({score: res.total_score || 0});
      updateDineroInviteCode({code: res.invite_code || ''});
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
  }

  async function initTaskList() {
    try {
      const res = await getTaskList();

      const tmpTaskList: TaskItem[] = [];

      (res || []).forEach(task => {
        if (task.task_info.id === TaskType.DAILY) {
          updateDineroSignedInfo({
            hasSigned: task?.finish_count || 0,
            todaySigned: !!task.today_finished
          });
        } else {
          tmpTaskList.push({
            type: task?.task_info.id,
            title: task.task_info?.name,
            content: task.task_info?.description?.split(','),
            tips: task.task_info?.tip_text,
          });
        }
      });

      initDineroTaskList({ taskList: tmpTaskList });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
  }

  function handleToDetail () {
    updateShowDineroScoreDetail({ showScoreDetail: true });
  }

  const handleCompleteDaily = useCallback(() => {
    updateDineroSignedInfo({
      hasSigned: hasSigned + 1,
      todaySigned: true
    });
    initTaskInfo();
  }, [hasSigned]);

  function renderIndex () {
    return (
      <div className="task">
        <div className="task-header">
          <div className="task-header-title">Dinero</div>
          <div className="task-header-detail" onClick={handleToDetail}>Points Details</div>
        </div>
        <div className="task-main">
          <div className="total__score">
            <div className="total__score-detail">
              <div className="total__score-detail-title">
                AI Points
                <img className="total__score-detail-tips" src={AITips} alt="tips" />
              </div>
              <div className="total__score-detail-num">{score}</div>
            </div>
            <Button className="total__score-exchange">
              <img className="total__score-exchange-icon" src={AIScoreBtnIcon} alt="score" />
              <span className="total__score-exchange-txt">Exchange</span>
            </Button>
          </div>
          <div className="daily__table">
            <div className="daily__table-title">Sign in continuously to get points</div>
            <div className="daily__table-list">
              <div className="daily__table-sublist">
                {
                  DAILY_NORMAL_LIST.map((_, index) => (
                    <DailyItem
                      hasSigned={hasSigned}
                      todayHasSigned={todayHasSigned}
                      today={index}
                      onComplete={handleCompleteDaily}
                    />
                  ))
                }
              </div>
              <div className="daily__table-target">
                <DailyItem
                  hasSigned={hasSigned}
                  todayHasSigned={todayHasSigned}
                  today={DAILY_NUM - 1}
                  onComplete={handleCompleteDaily}
                />
              </div>
            </div>
          </div>
          <div className="task__list">
            {
              taskList.map(task => (
                <TaskItemComp key={task.type} taskInfo={task} inviteCode={inviteCode} />
              ))
            }
            <div className="more-task">
              More rewards are coming soon...
            </div>
          </div>
        </div>
        {
          !isInApp && <Footer />
        }
      </div>
    );
  }

  function renderContent() {
    switch (pageStatus) {
      case PageStatus.ScoreDetail:
        return <ScoreDetail />;
      default:
        return renderIndex();
    }
  }

  return (
    <Transition
      id="TaskComp"
      name={LAYERS_ANIMATION_NAME}
      activeKey={pageStatus}
    >{renderContent}</Transition>
  );
};

export default memo(withGlobal(
  (global): StateProps => {
    return {
      score: global.dineroTotalScore,
      hasSigned: global.dineroHasSigned,
      todayHasSigned: global.dineroTodaySigned,
      inviteCode: global.dineroInviteCode,
      taskList: global.dineroTaskList || [],
      isInApp: global.dineroIsInApp,
      pageStatus: global.pageStatus,
    };
  },
)(TaskComp));
