import React from "react";
import { Card, Layout, Button } from "antd";
import { ClockCircleOutlined, PlusOutlined } from "@ant-design/icons";
import "./App.css";
import { TimeEntryCard } from "./components/TimeEntryCard";
import { useState } from "react";
import { useInterval } from "./lib/useInterval";
import {
  TimerState,
  incrementTimer,
  removeTimer,
  newTimer,
  FieldEntry,
} from "./lib/timerState";
//import { testIntegration } from "./lib/freshbookClient";

export const TEMP_ID_PREFIX = "tmp-";

export const getTimerDisplay = (count: number) => {
  let date = new Date(0);
  date.setSeconds(count);
  return date.toISOString().substr(11, 8);
};

function App() {
  let [activeTimer, setActiveTimer] = useState<string | undefined>(undefined);

  let [timerObj, setTimerObj] = useState<TimerState>({});
  // start with temp ID then replace with freshbook entry id

  useInterval(() => {
    incrementTimer(timerObj, activeTimer, setTimerObj);
  }, 1000);

  const handleNewTimer = () => {
    let newTempId = TEMP_ID_PREFIX + new Date().getUTCMilliseconds().toString();
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
    let tempState = { ...timerObj };
    tempState[key] = { ...tempState[key], [obj.field]: obj.fieldValue };
    setTimerObj(tempState);
  };

  const timerDisplay: JSX.Element[] = Object.keys(timerObj).map((key) => {
    return (
      <TimeEntryCard
        timerData={timerObj[key]}
        active={activeTimer === key}
        key={key}
        onProjectChange={(project) => {
          let id = key;
          console.log(project);
          console.log(key);
          console.log(id);
          // update timer object to set project for Id
          // set timer obj
        }}
        onTimerDelete={() => {
          if (activeTimer === key) {
            setActiveTimer(undefined);
          }

          setTimerObj(removeTimer(timerObj, key));
        }}
        onTimerPause={() => {
          if (activeTimer === key) {
            setActiveTimer(undefined);
          }
        }}
        onTimerContinue={() => {
          setActiveTimer(key);
        }}
        onFieldUpdate={(obj: FieldEntry) => {
          handleFieldUpdate(obj, key);
        }}
      />
    );
  });

  return (
    <Layout>
      <Layout.Content>
        <Card title="Freshbook's Time Tracker">
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
            {timerDisplay}
          </Card>
        </Card>
      </Layout.Content>
    </Layout>
  );
}

export default App;
