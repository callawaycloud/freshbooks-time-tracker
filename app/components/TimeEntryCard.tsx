import {
  CloudUploadOutlined,
  DeleteOutlined,
  PauseOutlined,
  PlayCircleOutlined,
  SaveOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { Button, Card, Col, Input, Row, Select, InputNumber } from 'antd';
import { ButtonProps } from 'antd/lib/button';
import * as React from 'react';
import { FieldEntry, TimerEntry } from '../lib/timerState';
import { DisplayElapsedTime } from './DisplayElapsedTime';
import { Project, ClientMap } from '../lib/freshbookClient';
// import { Project } from '../lib/freshbookClient';

const { Option, OptGroup } = Select;
const { TextArea } = Input;

export function TimeEntryCard(props: {
  timerData: TimerEntry;
  active: boolean;
  onTimerDelete: () => void;
  onTimerPause: () => void;
  onTimerContinue: () => void;
  onFieldUpdate: (changes: Partial<TimerEntry>) => void;
  onTimerSave: () => void;
  projectList: Project[];
  clients: ClientMap;
  // taskList: JSX.Element[];
}) {
  const dateFormatted = props.timerData.date;

  const hrefLink = `https://callawaycloudconsulting.freshbooks.com/timesheet#date/${dateFormatted}/edit/${props.timerData.freshbooksId}`;

  function myFunction(event) {
    const { shell } = require('electron');
    event.preventDefault();
    shell.openExternal(hrefLink);
  }
  const linkToFreshbook = props.timerData.freshbooksId ? (
    <Button type="link" target="_blank" onClick={myFunction} href={hrefLink}>
      View in Freshbooks
    </Button>
  ) : (
    ''
  );

  /* const projectListPicklist: JSX.Element[] = props.projectList.map(key => {
    return (
      <Select.Option value={key.project_id} key={key.project_id}>
        {key.name}
      </Select.Option>
    );
  }); */

  const projectListPicklist: JSX.Element[] | null = Object.values(
    props.clients
  ).map(key => {
    const clientProjects = key.projects;
    if (clientProjects.length === 0) {
      return null;
    }

    const clientProjectPicklist: JSX.Element[] = clientProjects.map(proj => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      return (
        <Option value={proj.project_id} key={proj.project_id}>
          {proj.name}
        </Option>
      );
    });

    // clientProjectPicklist

    return (
      <OptGroup label={key.name} key={key.name}>
        {clientProjectPicklist}
      </OptGroup>
    );
  });

  let taskListPicklist: JSX.Element[] | undefined = [];

  if (props.timerData.project) {
    taskListPicklist = props.projectList
      .find(
        // eslint-disable-next-line @typescript-eslint/camelcase
        ({ project_id }) => project_id === props.timerData.project
      )
      ?.tasks.map(key => {
        return (
          <Select.Option value={key.task_id} key={key.task_id}>
            {key.name}
          </Select.Option>
        );
      });
  }

  return (
    <Card style={{ textAlign: 'center', margin: '15px' }}>
      <div style={{ clear: 'both' }} />
      <DisplayElapsedTime
        elapsedTime={props.timerData.count}
        active={props.active}
      />
      <span style={{ float: 'right' }}>
        <TimeEntryActions
          active={props.active}
          timerData={props.timerData}
          onTimerContinue={props.onTimerContinue}
          onTimerPause={props.onTimerPause}
          onTimerDelete={props.onTimerDelete}
          onTimerSave={props.onTimerSave}
          notSavedToFreshbooks={!props.timerData.freshbooksId}
        />
      </span>
      <div style={{ clear: 'both' }}>
        <Row gutter={[16, 16]} style={{ textAlign: 'left' }}>
          <Col span={12}>
            <Select
              placeholder="Select a Project"
              key="selectedProject"
              value={props.timerData.project}
              style={{ width: '80%', marginTop: 10 }}
              onChange={value =>
                props.onFieldUpdate({ project: value, task: undefined })
              }
            >
              {projectListPicklist}
            </Select>
            <Select
              placeholder="Select a Task"
              value={props.timerData.task}
              style={{ width: '80%', marginTop: 10 }}
              onChange={value =>
                props.onFieldUpdate({
                  task: value
                })
              }
            >
              {taskListPicklist}
            </Select>
          </Col>
          <Col span={12}>
            <TextArea
              rows={3}
              style={{ marginTop: 10 }}
              placeholder="Notes....."
              value={props.timerData.notes}
              onChange={event =>
                props.onFieldUpdate({
                  notes: event.target.value
                })
              }
            />
          </Col>
        </Row>
        <div>
          Time to log in Freshbook:
          <InputNumber
            type="number"
            min={0}
            step={0.25}
            value={props.timerData.roundedCount / 3600}
            onChange={value =>
              props.onFieldUpdate({
                count: value ? value * 3600 : 0,
                roundedCount: value ? value * 3600 : 0
              })
            }
          />
        </div>
        <div>
          Current time logged in Freshbook:
          {props.timerData.countLoggedinFreshbook
            ? props.timerData.countLoggedinFreshbook / 3600
            : 0}
        </div>
        {linkToFreshbook}
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
  notSavedToFreshbooks: boolean;
  timerData: TimerEntry;
}) {
  const pauseOrPlayProps: ButtonProps = props.active
    ? {
        icon: <PauseOutlined />,
        onClick: props.onTimerPause,
        ghost: true
      }
    : {
        icon: <PlayCircleOutlined />,
        onClick: props.onTimerContinue
      };

  const saveButton = props.timerData.unsavedChanges ? (
    <Button
      type="primary"
      icon={
        props.notSavedToFreshbooks ? <CloudUploadOutlined /> : <SaveOutlined />
      }
      size="large"
      onClick={props.onTimerSave}
      key="saveBtn"
      danger={props.notSavedToFreshbooks}
    />
  ) : (
    ''
  );

  return (
    <>
      <Button
        type="primary"
        size="large"
        {...pauseOrPlayProps}
        key="pausePlayBtn"
      />
      {saveButton}
      <Button
        type="primary"
        icon={
          props.notSavedToFreshbooks ? <DeleteOutlined /> : <CloseOutlined />
        }
        size="large"
        onClick={props.onTimerDelete}
        danger
        key="deleteBtn"
      />
    </>
  );
}
