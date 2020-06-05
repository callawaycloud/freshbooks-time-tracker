import {
  ClockCircleOutlined,
  PlusOutlined,
  SettingOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Layout,
  Select,
  message,
  Tooltip,
  Spin
} from 'antd';
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
  Client,
  ClientMap
} from '../lib/freshbookClient';

export const TEMP_ID_PREFIX = 'zzz-';
const todaysDate = moment().format('MMMM Do, YYYY');

function isValidUrl(urlString: string) {
  try {
    const newURL = new URL(urlString);
  } catch (_) {
    return false;
  }

  return true;
}

function App() {
  const [showSpinner, setShowSpinner] = useState<boolean>(true);

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

  const [clientMap, setClientMap] = useState<ClientMap>({});

  const freshbookHostName: string = isValidUrl(apiURL)
    ? new URL(apiURL).hostname
    : '';

  const refreshAppdata = async () => {
    const filteredLocalStorageTimers = Object.keys({ ...localStorageTimers })
      .filter(
        key =>
          localStorageTimers[key].date === moment().format('YYYY-MM-DD') ||
          localStorageTimers[key].unsavedChanges === true
      )
      .reduce((obj, key) => {
        const objClone: any = { ...obj };
        objClone[key] = localStorageTimers[key];
        return objClone;
      }, {});

    let tempTimerObj = { ...timerObj };
    tempTimerObj = { ...tempTimerObj, ...filteredLocalStorageTimers };

    try {
      const clients = await retrieveClients(apiURL, freshbookToken);

      const projects = await retrieveProjects(apiURL, freshbookToken);

      projects.forEach((project: Project) => {
        if (project) {
          clients[project.client_id].projects.push(project);
        }
      });

      setClientMap(clients);
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
    setShowSpinner(false);
  };

  useEffect(() => {
    if (showSettings) {
      return;
    }
    setShowSpinner(true);
    async function retrieveFreshbookData() {
      refreshAppdata();
    }
    if (apiURL && freshbookToken) {
      retrieveFreshbookData();
    } else {
      setShowSpinner(false);
    }
  }, [showSettings]);

  useInterval(() => {
    incrementTimer(timerObj, activeTimer, setTimerObj);
    if (activeTimer && timerObj[activeTimer].count % 10 === 0) {
      setLocalStorageTimers(timerObj);
    }
  }, 1000);

  const handleNewTimer = () => {
    const newTempId = TEMP_ID_PREFIX + new Date().getTime().toString();

    console.log(newTempId);
    setTimerObj(newTimer(timerObj, newTempId));
    setActiveTimer(newTempId);
  };

  const handleFieldUpdate = (changes: Partial<TimerEntry>, key: string) => {
    const tempState = { ...timerObj };
    tempState[key] = { ...tempState[key], ...changes };
    tempState[key].unsavedChanges = true;

    setTimerObj(tempState);
    setLocalStorageTimers(tempState);
  };

  const saveTimeEntry = (key: string) => {
    setShowSpinner(true);
    const tempTimerObj = { ...timerObj };
    let tempTimeEntry: TimerEntry = tempTimerObj[key];
    tempTimeEntry.unsavedChanges = false;

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
        tempTimerObj[key] = tempTimeEntry;
      } catch (e) {
        message.error(e.toString());
        console.log(e);
      }
      setTimerObj(tempTimerObj);
      setLocalStorageTimers(tempTimerObj);
      setShowSpinner(false);
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

  const timerDisplay: JSX.Element[] = Object.keys(timerObj)
    .sort((a, b) => {
      return b.localeCompare(a);
    })
    .map(key => {
      return (
        <TimeEntryCard
          timerData={timerObj[key]}
          active={activeTimer === key}
          key={key}
          projectList={projectList}
          clients={clientMap}
          freshbookHostName={freshbookHostName}
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
            const tempTimerObj = { ...timerObj };
            tempTimerObj[key].unsavedChanges = true;
            setLocalStorageTimers(tempTimerObj);
          }}
          onFieldUpdate={(changes: Partial<TimerEntry>) => {
            handleFieldUpdate(changes, key);
          }}
          onTimerSave={() => {
            saveTimeEntry(key);
          }}
        />
      );
    });

  const authenticationStatus =
    !apiURL || !freshbookToken || !freshbookHostName ? (
      <Alert
        message="Please Set Freshbook Authentication Settings"
        description={
          <div>
            Freshbook authentication settings are not currently set!&nbsp;
            <Button
              key="settings"
              type="primary"
              onClick={() => setShowSettings(true)}
            >
              Open Settings Drawer
            </Button>
          </div>
        }
        type="warning"
      />
    ) : (
      ''
    );

  return (
    <Spin spinning={showSpinner}>
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
            extra={[
              <Tooltip
                placement="topLeft"
                title="Refresh Freshbook data!"
                key="refreshDataToolTip"
              >
                <Button
                  ghost
                  key="refreshData"
                  type="primary"
                  onClick={async () => {
                    setShowSpinner(true);
                    refreshAppdata();
                  }}
                  icon={<ReloadOutlined />}
                />
              </Tooltip>,
              <Tooltip
                placement="topLeft"
                title="Settings to enter Freshbook credentials!"
                key="settingToolTip"
              >
                <Button
                  key="settings"
                  type="primary"
                  onClick={() => setShowSettings(true)}
                  icon={<SettingOutlined />}
                />
              </Tooltip>
            ]}
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
    </Spin>
  );
}

export default App;
