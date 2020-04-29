import * as React from "react";
import { useState, useEffect, useRef } from "react";

function useInterval(callback: any, delay: number | null) {
  const savedCallback = useRef();

  // Remember the latest function.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      // @ts-ignore
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

export function TimeEntryCard(props: { countStart: any; active: boolean }) {
  let [displayValue, setDisplayValue] = useState(props.countStart);

  let [count, setCount] = useState(props.countStart);
  useEffect(() => {
    let date = new Date(0);
    date.setSeconds(count);
    setDisplayValue(date.toISOString().substr(11, 8));
  }, [count]);

  //let [delay, setDelay] = useState(1000);

  useInterval(() => {
    // Your custom logic here
    if (props.active) {
      setCount(count + 1);
    }
  }, 1000);

  /*function handleDelayChange(e: { target: { value: any } }) {
    setDelay(Number(e.target.value));
  }*/

  return (
    <div style={{ textAlign: "center" }}>
      seconds count: {count}
      <br />
      display: {displayValue}
      <hr />
    </div>
  );
}
