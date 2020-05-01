import React from "react";
import { Card, Layout, Button } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import "./App.css";
import { TimeEntryCard } from "./components/TimeEntryCard";
import { useState } from "react";
import { useInterval } from "./lib/useInterval";

export const TEMP_ID_PREFIX = "tmp-";

interface KeyMap<T> {
  [key: string]: T;
}

export interface TimerData {
  count: number;
  project?: string;
}

const addTimer = (timerObj: KeyMap<TimerData>, newTempId: string) => {
  let tempTimerObj = { ...timerObj };
  tempTimerObj[newTempId] = {
    count: 0,
  };

  return tempTimerObj;
};

export const setTimeDisplay = (count: number) => {
  let date = new Date(0);
  date.setSeconds(count);
  return date.toISOString().substr(11, 8);
};

function App() {
  let [activeTimer, setActiveTimer] = useState("1");

  let [timerObj, setTimerObj] = useState<KeyMap<TimerData>>({
    "1": { count: 150 },
    "2": { count: 200 },
    "3": { count: 200 },
  });
  // start with temp ID then replace with freshbook entry id

  useInterval(() => {
    // Your custom logic here

    if (!activeTimer) {
      return;
    }

    let timerObjTemp = { ...timerObj };
    timerObjTemp[activeTimer] = { count: timerObj[activeTimer].count + 1 };

    setTimerObj(timerObjTemp);
  }, 1000);

  console.log(timerObj);
  let timerDisplay: JSX.Element[] = [];
  const timers = Object.keys(timerObj).forEach((key) => {
    timerDisplay.push(
      <TimeEntryCard
        timerData={timerObj[key]}
        active={activeTimer === key}
        key={key}
        onProjectChange={(project) => {
          let id = key;
          // update timer object to set project for Id
          // set timer obj
        }}
        onTimerDelete={() => {
          if (activeTimer === key) {
            setActiveTimer("");
          }
          let tempTimerObj = { ...timerObj };
          delete tempTimerObj[key];
          setTimerObj(tempTimerObj);
        }}
        onTimerPause={() => {
          if (activeTimer === key) {
            setActiveTimer("");
          }
        }}
        onTimerContinue={() => {
          setActiveTimer(key);
        }}
      />
    );
  });

  const handleNewTimer = () => {
    let newTempId = TEMP_ID_PREFIX + new Date().getUTCMilliseconds().toString();
    setTimerObj(addTimer(timerObj, newTempId));
    setActiveTimer(newTempId);
  };

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
