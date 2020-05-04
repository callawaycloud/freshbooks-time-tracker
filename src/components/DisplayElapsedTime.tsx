import { Tag } from "antd";
import * as React from "react";
import { getTimerDisplay } from "../App";

export interface DisplayElapsedTimeProps {
  elapsedTime: number;
  active: boolean;
}

export function DisplayElapsedTime(props: DisplayElapsedTimeProps) {
  let color = props.active ? "success" : "warning";
  return (
    <Tag color={color} style={{ float: "left" }}>
      <span style={{ fontSize: "30px", lineHeight: "40px" }}>
        {getTimerDisplay(props.elapsedTime)}
      </span>
    </Tag>
  );
}
