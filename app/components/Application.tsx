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
  TimerState
} from '../lib/timerState';
import { useInterval } from '../lib/useInterval';
import { useLocalStorage } from '../lib/useLocalStorage';
import {
  Project,
  retrieveProjects,
  retrieveTimeEntries,
  updateTimeEntry,
  createTimeEntry,
  retrieveClients,
  Client
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

  const [clientList, setClientList] = useState<Client[]>([]);

  useEffect(() => {
    // setInitialLoad(true);
    async function retrieveFreshbookData() {
      const filteredLocalStorageTimers = Object.keys({ ...localStorageTimers })
        .filter(
          key =>
            localStorageTimers[key].date == moment().format('YYYY-MM-DD') ||
            localStorageTimers[key].unsavedChanges == true
        )
        .reduce((obj, key) => {
          obj[key] = localStorageTimers[key];
          return obj;
        }, {});

      let tempTimerObj = { ...timerObj };
      tempTimerObj = { ...tempTimerObj, ...filteredLocalStorageTimers };

      console.log(tempTimerObj);

      try {
        const clients = await retrieveClients(apiURL, freshbookToken);

        const projects = await retrieveProjects(apiURL, freshbookToken);

        console.log(clients);

        projects.forEach((project: Project) => {
          if (project) {
            console.log(project.client_id);
            // Note for Charlie - I am eventually going to use this to build the picklist for the Projects FYI
            // clients[project.client_id].projects.push(project);
          }
        });

        console.log(clients);

        setProjecList(projects);
        tempTimerObj = await retrieveTimeEntries(
          apiURL,
          freshbookToken,
          tempTimerObj
        );
      } catch (e) {
        message.error(e.toString());
        console.log(e);
      }
      setTimerObj(tempTimerObj);
      setLocalStorageTimers(tempTimerObj);
    }
    retrieveFreshbookData();
  }, []);
  // console.log(projectTasksMap);

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
    let tempTimeEntry: TimerEntry = tempTimerObj[key];
    tempTimeEntry.unsavedChanges = false;

    /* if (!tempTimeEntry.freshbooksId) {
      tempTimeEntry.freshbooksId = key;
    } */

    if (activeTimer === key) {
      setActiveTimer(undefined);
    }

    async function saveTimerEntryToFB() {
      try {
        if (tempTimeEntry.freshbooksId) {
          tempTimeEntry = await updateTimeEntry(
            apiURL,
            freshbookToken,
            tempTimeEntry
          );
        } else {
          tempTimeEntry = await createTimeEntry(
            apiURL,
            freshbookToken,
            tempTimeEntry
          );
        }
        console.log(tempTimeEntry);
        tempTimerObj[key] = tempTimeEntry;
      } catch (e) {
        message.error(e.toString());
        console.log(e);
      }
      console.log(tempTimerObj);
      setTimerObj(tempTimerObj);
      setLocalStorageTimers(tempTimerObj);
    }
    saveTimerEntryToFB();
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

  const timerDisplay: JSX.Element[] = Object.keys(timerObj).map(key => {
    return (
      <TimeEntryCard
        timerData={timerObj[key]}
        active={activeTimer === key}
        key={key}
        projectList={projectList}
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
