import { ClockCircleOutlined, PlusOutlined, SettingOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Layout } from "antd";
import moment from "moment";
import React, { useEffect, useState } from "react";
import "./App.css";
import { SettingsDrawer } from "./components/SettingsDrawer";
import { TimeEntryCard } from "./components/TimeEntryCard";
import { FieldEntry, incrementTimer, newTimer, removeTimer, TimerEntry, TimerState } from "./lib/timerState";
import { useInterval } from "./lib/useInterval";
import { useLocalStorage } from "./lib/useLocalStorage";
//import { testIntegration } from "./lib/freshbookClient";

export const TEMP_ID_PREFIX = "tmp-";

export const getTimerDisplay = (count: number) => {
  const date = new Date(0);
  date.setSeconds(count);
  return date.toISOString().substr(11, 8);
};

function App() {
  const todaysDate = moment().format("MMMM Do, YYYY");

  const [showSettings, setShowSettings] = useState<boolean>(false);

  const [activeTimer, setActiveTimer] = useState<string | undefined>(undefined);

  const [timerObj, setTimerObj] = useState<TimerState>({});

  const [localStorageTimers, setLocalStorageTimers] = useLocalStorage(
    "localStorageTimers",
    timerObj
  );

  //let [savedTimers, setSavedTimers] = useLocalStorage("savedTimers", timerObj);

  const [apiURL, setApiUrl] = useLocalStorage("apiURL", undefined);

  const [freshbookToken, setFreshbookToken] = useLocalStorage(
    "freshbookToken",
    undefined
  );

  const [initialLoad, setInitialLoad] = useState<boolean>(false);
  useEffect(() => {
    console.log(localStorageTimers);
    let tempTimerObj = { ...timerObj };
    tempTimerObj = { ...tempTimerObj, ...localStorageTimers };
    console.log(tempTimerObj);
    setTimerObj(tempTimerObj);
    setInitialLoad(true);
  }, [initialLoad]);

  useInterval(() => {
    incrementTimer(timerObj, activeTimer, setTimerObj);
    if (activeTimer && timerObj[activeTimer].count % 10 == 0) {
      setLocalStorageTimers(timerObj);
    }
  }, 1000);

  const handleNewTimer = () => {
    const newTempId = TEMP_ID_PREFIX + new Date().getUTCMilliseconds().toString();
    setTimerObj(newTimer(timerObj, newTempId));
    setActiveTimer(newTempId);
    //testIntegration();
  };

  /*
  Do authentication check here, then show authentication section
  if (true) {
    return <div>Login</div>;
  }*/

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

  /*const handleSavedAndUnsavedTimerStorage = () => {

  };*/

  const onSettingsClose = () => {
    setShowSettings(false);
  };

  const onSettingsChange = (
    localStorageKey: string,
    value: string | undefined
  ) => {
    if (localStorageKey === "apiURL") {
      setApiUrl(value);
    } else if (localStorageKey === "freshbookToken") {
      setFreshbookToken(value);
    }
  };

  const timerDisplay: JSX.Element[] = Object.keys(timerObj).map((key) => {
    return (
      <TimeEntryCard
        timerData={timerObj[key]}
        active={activeTimer === key}
        key={key}
        onProjectChange={(project) => {
          const id = key;
          console.log(project);
          console.log(key);
          console.log(id);
          // update timer object to set project for Id
          // set timer obj
        }}
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
        ""
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
          title={<span>Freshbook&apos;s Time Tracker </span>}
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
          <h1 style={{ textAlign: "center" }}>{todaysDate}</h1>

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
                style={{ float: "right" }}
              />
            }
            style={{ minWidth: 600, maxWidth: 1200, margin: "auto" }}
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
