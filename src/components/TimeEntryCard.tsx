import {
  DeleteOutlined,
  PauseOutlined,
  PlayCircleOutlined,
  CloudUploadOutlined,
} from "@ant-design/icons";
import { Button, Card, Row, Col, Select, Input } from "antd";
import { ButtonProps } from "antd/lib/button";
import * as React from "react";
import { getTimerDisplay } from "../App";
import { TimerEntry, FieldEntry } from "../lib/timerState";
import { DisplayElapsedTime } from "./DisplayElapsedTime";
const { Option } = Select;
const { TextArea } = Input;

export function TimeEntryCard(props: {
  timerData: TimerEntry;
  active: boolean;
  onProjectChange: (project: string) => void;
  onTimerDelete: () => void;
  onTimerPause: () => void;
  onTimerContinue: () => void;
  onFieldUpdate: (obj: FieldEntry) => void;
  onTimerSave: () => void;
}) {
  return (
    <Card style={{ textAlign: "center", margin: "15px" }}>
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
          onTimerSave={props.onTimerSave}
        />
      </span>
      <div style={{ clear: "both" }}>
        <Row gutter={[16, 16]} style={{ textAlign: "left" }}>
          <Col span={12}>
            <Select
              key="selectedProject"
              defaultValue={props.timerData.project}
              style={{ width: "80%", marginTop: 10 }}
              onChange={(value) =>
                props.onFieldUpdate({
                  fieldValue: value,
                  field: "project",
                })
              }
            >
              <Option value="jack">Jack</Option>
              <Option value="lucy">Lucy</Option>
              <Option value="disabled" disabled>
                Disabled
              </Option>
              <Option value="Yiminghe">yiminghe</Option>
            </Select>
            <Select
              defaultValue={props.timerData.task}
              style={{ width: "80%", marginTop: 10 }}
              onChange={(value) =>
                props.onFieldUpdate({
                  fieldValue: value,
                  field: "task",
                })
              }
            >
              <Option value="jack">Jack</Option>
              <Option value="lucy">Lucy</Option>
              <Option value="disabled" disabled>
                Disabled
              </Option>
              <Option value="Yiminghe">yiminghe</Option>
            </Select>
          </Col>
          <Col span={12}>
            <TextArea
              rows={3}
              style={{ marginTop: 10 }}
              placeholder="Notes....."
              defaultValue={props.timerData.notes}
              onChange={(event) =>
                props.onFieldUpdate({
                  fieldValue: event.target.value,
                  field: "notes",
                })
              }
            />
          </Col>
        </Row>
      </div>
    </Card>
  );
}

// include Delete Button here!
function TimeEntryActions(props: {
  active: boolean;
  onTimerPause: () => void;
  onTimerContinue: () => void;
  onTimerDelete: () => void;
  onTimerSave: () => void;
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
        icon={<CloudUploadOutlined />}
        size="large"
        onClick={props.onTimerSave}
        key="saveBtn"
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
