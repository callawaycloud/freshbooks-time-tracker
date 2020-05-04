import {
  DeleteOutlined,
  PauseOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { Button, Card } from "antd";
import { ButtonProps } from "antd/lib/button";
import * as React from "react";
import { getTimerDisplay } from "../App";
import { TimerEntry } from "../lib/timerState";
import { DisplayElapsedTime } from "./DisplayElapsedTime";

export function TimeEntryCard(props: {
  timerData: TimerEntry;
  active: boolean;
  onProjectChange: (project: string) => void;
  onTimerDelete: () => void;
  onTimerPause: () => void;
  onTimerContinue: () => void;
}) {
  return (
    <Card style={{ textAlign: "center" }}>
      <div style={{ clear: "both" }}></div>
      <DisplayElapsedTime
        elapsedTime={props.timerData.count}
        active={props.active}
      />
      <span style={{ float: "right" }}>
        <TimeEntryActions
          active={props.active}
          onTimerContinue={props.onTimerContinue}
          onTimerPause={props.onTimerPause}
          onTimerDelete={props.onTimerDelete}
        />
      </span>
      <div style={{ clear: "both" }}></div>
      <hr />
      {getTimerDisplay(props.timerData.count)}
      <hr />
      seconds count: {props.timerData.count}
      <hr />
    </Card>
  );
}

// include Delete Button here!
function TimeEntryActions(props: {
  active: boolean;
  onTimerPause: () => void;
  onTimerContinue: () => void;
  onTimerDelete: () => void;
}) {
  const pauseOrPlayProps: ButtonProps = props.active
    ? {
        icon: <PauseOutlined />,
        onClick: props.onTimerPause,
        ghost: true,
      }
    : {
        icon: <PlayCircleOutlined />,
        onClick: props.onTimerContinue,
      };
  return (
    <React.Fragment>
      <Button
        type="primary"
        size="large"
        {...pauseOrPlayProps}
        key="pausePlayBtn"
      />
      <Button
        type="primary"
        icon={<DeleteOutlined />}
        size="large"
        onClick={props.onTimerDelete}
        danger={true}
        key="deleteBtn"
      />
    </React.Fragment>
  );
}
