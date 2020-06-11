import {
  CloudUploadOutlined,
  DeleteOutlined,
  PauseOutlined,
  PlayCircleOutlined,
  SaveOutlined,
  CloseOutlined
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Input,
  Row,
  Select,
  InputNumber,
  Popconfirm
} from 'antd';
import { ButtonProps } from 'antd/lib/button';
import * as React from 'react';
import { FieldEntry, TimerEntry } from '../lib/timerState';
import { DisplayElapsedTime } from './DisplayElapsedTime';
import {
  Project,
  ClientMap,
  openLinkToFreshbookEntry
} from '../lib/freshbookClient';

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
  freshbookHostName: string;
}) {
  const dateFormatted = props.timerData.date;

  const hrefLink = `https://${props.freshbookHostName}/timesheet#date/${dateFormatted}/edit/${props.timerData.freshbooksId}`;

  const linkToFreshbook = props.timerData.freshbooksId ? (
    <Button
      type="link"
      target="_blank"
      onClick={e => openLinkToFreshbookEntry(e, hrefLink)}
      href={hrefLink}
    >
      View in Freshbooks
    </Button>
  ) : (
    ''
  );

  const projectListPicklist = Object.values(props.clients).map(key => {
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
    <Card style={{ textAlign: 'center', margin: '10px' }} size="small">
      <div style={{ clear: 'both' }} />
      <DisplayElapsedTime
        elapsedTime={props.timerData.count}
        active={props.active}
      />
      {props.timerData.date}
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
              showSearch
              optionFilterProp="children"
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
              showSearch
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
            onChange={value => {
              // eslint-disable-next-line no-restricted-globals
              const numValue = !isNaN(Number(value)) ? Number(value) * 3600 : 0;
              props.onFieldUpdate({
                count: numValue,
                roundedCount: numValue
              });
            }}
          />
          &nbsp;|&nbsp; Current time logged in Freshbook:
          {props.timerData.countLoggedinFreshbook
            ? props.timerData.countLoggedinFreshbook / 3600
            : 0}
          &nbsp;|&nbsp;
          {linkToFreshbook}
        </div>
      </div>
    </Card>
  );
}

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
      size="small"
      onClick={props.onTimerSave}
      key="saveBtn"
      danger={props.notSavedToFreshbooks}
    />
  ) : (
    ''
  );

  const deleteButton = props.timerData.unsavedChanges ? (
    <Popconfirm
      placement="bottomRight"
      title="This timer has changes that have not been saved in Freshbook. Are you sure you want to delete it?"
      key="deletePopConfirm"
      onConfirm={props.onTimerDelete}
      okText="Yes"
      cancelText="No"
    >
      <Button
        type="primary"
        icon={
          props.notSavedToFreshbooks ? <DeleteOutlined /> : <CloseOutlined />
        }
        size="small"
        danger
        key="deleteBtn"
      />
    </Popconfirm>
  ) : (
    <Button
      type="primary"
      icon={<CloseOutlined />}
      size="small"
      onClick={props.onTimerDelete}
      danger
      key="deleteBtn"
    />
  );

  return (
    <>
      <Button
        type="primary"
        size="small"
        {...pauseOrPlayProps}
        key="pausePlayBtn"
      />
      {saveButton}
      {deleteButton}
    </>
  );
}
