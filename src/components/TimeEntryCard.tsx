import * as React from "react";
import { TimerData, setTimeDisplay } from "../App";
import { Button, Card } from "antd";
import {
  DeleteOutlined,
  PauseOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { DisplayElapsedTime } from "./DisplayElapsedTime";

export function TimeEntryCard(props: {
  timerData: TimerData;
  active: boolean;
  onProjectChange: (project: string) => void;
  onTimerDelete: () => void;
  onTimerPause: () => void;
  onTimerContinue: () => void;
}) {
  const playOrPauseBtn = props.active ? (
    <Button
      type="primary"
      icon={<PauseOutlined />}
      size="large"
      onClick={props.onTimerPause}
      ghost={true}
    />
  ) : (
    <Button
      type="primary"
      icon={<PlayCircleOutlined />}
      size="large"
      onClick={props.onTimerContinue}
    />
  );

  return (
    <Card style={{ textAlign: "center" }}>
      <div style={{ clear: "both" }}></div>
      <DisplayElapsedTime
        elapsedTime={props.timerData.count}
        active={props.active}
      />
      <span style={{ float: "right" }}>
        {playOrPauseBtn}
        <Button
          type="primary"
          icon={<DeleteOutlined />}
          size="large"
          onClick={props.onTimerDelete}
          danger={true}
        />
      </span>
      <div style={{ clear: "both" }}></div>
      <hr />
      {setTimeDisplay(props.timerData.count)}
      <hr />
      seconds count: {props.timerData.count}
      <hr />
    </Card>
  );
}
