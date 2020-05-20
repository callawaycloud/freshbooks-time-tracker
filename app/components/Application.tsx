import {
  ClockCircleOutlined,
  PlusOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { Alert, Button, Card, Layout, Select, message } from 'antd';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { SettingsDrawer } from './SettingsDrawer';
import { TimeEntryCard } from './TimeEntryCard';
import {
  FieldEntry,
  incrementTimer,
  newTimer,
  removeTimer,
  TimerEntry,
  TimerState,
  ProjectTaskState
} from '../lib/timerState';
import { useInterval } from '../lib/useInterval';
import { useLocalStorage } from '../lib/useLocalStorage';
import {
  testIntegration,
  Project,
  retrieveProjects,
  retrieveTasks,
  Task,
  retrieveProjectTasks
} from '../lib/freshbookClient';
// import { testIntegration } from "./lib/freshbookClient";

export const TEMP_ID_PREFIX = 'tmp-';
const todaysDate = moment().format('MMMM Do, YYYY');

// const projectTasksMap: ProjectTaskState = {};

function App() {
  const [showSettings, setShowSettings] = useState<boolean>(false);

  const [activeTimer, setActiveTimer] = useState<string | undefined>(undefined);

  const [timerObj, setTimerObj] = useState<TimerState>({});

  const [localStorageTimers, setLocalStorageTimers] = useLocalStorage(
    'localStorageTimers',
    timerObj
  );

  const [apiURL, setApiUrl] = useLocalStorage('apiURL', undefined);

  const [freshbookToken, setFreshbookToken] = useLocalStorage(
    'freshbookToken',
    undefined
  );

  const [projectList, setProjecList] = useState<Project[]>([]);

  const [taskList, setTaskList] = useState<Task[]>([]);

  const [projectTasksMap, setProjectTasksMap] = useState<ProjectTaskState>({});

  useEffect(() => {
    // setInitialLoad(true);
    async function retrieveFreshbookData() {
      let tempTimerObj = { ...timerObj };
      tempTimerObj = { ...tempTimerObj, ...localStorageTimers };
      setTimerObj(tempTimerObj);

      try {
        const projects = await retrieveProjects(apiURL, freshbookToken);
        const tasks = await retrieveTasks(apiURL, freshbookToken);

        const projectTaskMapClone = { ...projectTasksMap };

        const testThis = await retrieveProjectTasks(
          apiURL,
          freshbookToken,
          projects
        );

        console.log(testThis);

        /* projects.forEach(async project => {
          // eslint-disable-next-line no-param-reassign
          project.tasks = await retrieveProjectTasks(
            apiURL,
            freshbookToken,
            projects
          );
          console.log(project);
          // const projectTaskMapClone = { ...projectTasksMap };
          console.log('here', projectTaskMapClone);
          projectTaskMapClone[project.project_id] = project.tasks;
          setProjectTasksMap({ ...projectTaskMapClone });
        }); */

        /* projectTasksMap = projects.map(proj => {
          return \
        }); */



        setProjecList(projects);
        setTaskList(tasks);
        setProjectTasksMap(testThis);
      } catch (e) {
        message.error(e.toString());
        console.log(e);
      }
    }
    retrieveFreshbookData();
  }, []);
  console.log(projectTasksMap);

  useInterval(() => {
    incrementTimer(timerObj, activeTimer, setTimerObj);
    if (activeTimer && timerObj[activeTimer].count % 10 === 0) {
      setLocalStorageTimers(timerObj);
    }
  }, 1000);

  const handleNewTimer = () => {
    const newTempId =
      TEMP_ID_PREFIX + new Date().getUTCMilliseconds().toString();
    setTimerObj(newTimer(timerObj, newTempId));
    setActiveTimer(newTempId);
    // testIntegration();
  };

  const handleFieldUpdate = (obj: FieldEntry, key: string) => {
    const tempState = { ...timerObj };
    tempState[key] = { ...tempState[key], [obj.field]: obj.fieldValue };
    tempState[key].unsavedChanges = true;
    setTimerObj(tempState);
    setLocalStorageTimers(tempState);
  };

  const saveTimeEntry = (key: string) => {
    const tempTimerObj = { ...timerObj };
    const tempTimeEntry: TimerEntry = tempTimerObj[key];
    tempTimeEntry.unsavedChanges = false;

    if (!tempTimeEntry.freshbooksId) {
      tempTimeEntry.freshbooksId = key;
    }

    setTimerObj(tempTimerObj);
    setLocalStorageTimers(tempTimerObj);
  };

  const handleTimerDelete = (key: string) => {
    if (activeTimer === key) {
      setActiveTimer(undefined);
    }
    const tempState = removeTimer(timerObj, key);
    setTimerObj(tempState);
    setLocalStorageTimers(tempState);
  };

  const onSettingsClose = () => {
    setShowSettings(false);
  };

  const onSettingsChange = (
    localStorageKey: string,
    value: string | undefined
  ) => {
    if (localStorageKey === 'apiURL') {
      setApiUrl(value);
    } else if (localStorageKey === 'freshbookToken') {
      setFreshbookToken(value);
    }
  };

  // testIntegration(apiURL, freshbookToken);

  const projectListPicklist: JSX.Element[] = projectList.map(key => {
    return (
      <Select.Option value={key.project_id} key={key.project_id}>
        {key.name}
      </Select.Option>
    );
  });

  const timerDisplay: JSX.Element[] = Object.keys(timerObj).map(key => {
    // let taskListPicklistToShow: Task[] | JSX.Element[] = [];

    /* if (timerObj[key].project) {
      const projectId = timerObj[key].project ? timerObj[key].project : '';
      taskListPicklistToShow = projectTasksMap[projectId || ''];
    } */

    console.log(projectTasksMap);

    if (Object.keys(projectTasksMap).length === 0) {
      return <div></div>;
    }

    const projectId = timerObj[key].project ? timerObj[key].project : '';

    const taskListPicklist: JSX.Element[] = projectTasksMap[
      projectId || '156'
    ].map(task => {
      return (
        <Select.Option value={task.task_id} key={task.task_id}>
          {task.name}
        </Select.Option>
      );
    });

    return (
      <TimeEntryCard
        timerData={timerObj[key]}
        active={activeTimer === key}
        key={key}
        projectList={projectListPicklist}
        taskList={taskListPicklist}
        onTimerDelete={() => {
          handleTimerDelete(key);
        }}
        onTimerPause={() => {
          if (activeTimer === key) {
            setActiveTimer(undefined);
            setLocalStorageTimers(timerObj);
          }
        }}
        onTimerContinue={() => {
          setActiveTimer(key);
          setLocalStorageTimers(timerObj);
        }}
        onFieldUpdate={(obj: FieldEntry) => {
          handleFieldUpdate(obj, key);
        }}
        onTimerSave={() => {
          saveTimeEntry(key);
        }}
      />
    );
  });

  const authenticationStatus =
    !apiURL || !freshbookToken ? (
      <Alert
        message="Please Set Freshbook Authentication Settings"
        description="Freshbook authentication settings are not currently set!"
        type="warning"
      />
    ) : (
      ''
    );

  return (
    <Layout>
      <SettingsDrawer
        showSettings={showSettings}
        apiURL={apiURL}
        freshbookToken={freshbookToken}
        onSettingsClose={onSettingsClose}
        onSettingsChange={onSettingsChange}
      />
      <Layout.Content>
        <Card
          title={<span>Freshbook Time Tracker </span>}
          extra={
            <Button
              type="primary"
              onClick={() => {
                setShowSettings(true);
                return showSettings;
              }}
              icon={<SettingOutlined />}
            />
          }
        >
          <h1 style={{ textAlign: 'center' }}>{todaysDate}</h1>

          <Card
            title={
              <span>
                <ClockCircleOutlined />
                &nbsp; Timers
              </span>
            }
            extra={
              <Button
                type="primary"
                onClick={handleNewTimer}
                icon={<PlusOutlined />}
                style={{ float: 'right' }}
              />
            }
            style={{ minWidth: 600, maxWidth: 1200, margin: 'auto' }}
          >
            {authenticationStatus}
            {timerDisplay}
          </Card>
        </Card>
      </Layout.Content>
    </Layout>
  );
}

export default App;

/*

<Drawer
        title="Settings"
        placement="right"
        closable={true}
        onClose={() => {
          setShowSettings(false);
          return showSettings;
        }}
        visible={showSettings}
        width={500}
      >
        <Input
          value={apiURL}
          key="apiUrlInputKey"
          onChange={(e) => {
            setApiUrl(e.target.value);
          }}
          addonBefore="API URL"
        />
        <br />
        <br />
        <Input
          key="tokenInputKey"
          value={freshbookToken}
          onChange={(e) => {
            setFreshbookToken(e.target.value);
          }}
          addonBefore="Authentication Token"
        />
      </Drawer>

      */
