import * as React from "react";
import { TimerData, setTimeDisplay } from "../App";
import { Tag } from "antd";

export function DisplayElapsedTime(props: {
  elapsedTime: number;
  active: boolean;
}) {
  if (props.active) {
    return (
      <Tag color="success" style={{ float: "left" }}>
        <span style={{ fontSize: "30px", lineHeight: "40px" }}>
          {setTimeDisplay(props.elapsedTime)}
        </span>
      </Tag>
    );
  } else {
    return (
      <Tag color="warning" style={{ float: "left" }}>
        <span style={{ fontSize: "30px", lineHeight: "40px" }}>
          {setTimeDisplay(props.elapsedTime)}
        </span>
      </Tag>
    );
  }
}
