import React from "react";
import { Card, Layout, Button } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import "./App.css";
import { TimeEntryCard } from "./components/TimeEntryCard";
import { useState } from "react";
import { useInterval } from "./lib/useInterval";
import {
  TimerState,
  incrementTimer,
  removeTimer,
  newTimer,
} from "./lib/timerState";

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
  };

  /*
  Do authentication check here, then show authentication section
  if (true) {
    return <div>Login</div>;
  }*/

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
      />
    );
  });

  return (
    <Layout>
      <Layout.Content>
        <Card title="Freshbook's Time Tracker">
          <ClockCircleOutlined /> Hello World
          <Button type="primary" onClick={handleNewTimer}>
            Add Timer
          </Button>
          {timerDisplay}
        </Card>
      </Layout.Content>
    </Layout>
  );
}

export default App;
