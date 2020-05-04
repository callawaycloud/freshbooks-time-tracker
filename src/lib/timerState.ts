interface KeyMap<T> {
  [key: string]: T;
}

export interface TimerEntry {
  count: number;
  project?: string;
}

export type TimerState = KeyMap<TimerEntry>;

export function newTimer(state: TimerState, newTempId: string) {
  let tempState = { ...state };
  tempState[newTempId] = {
    count: 0,
  };

  return tempState;
}

export function incrementTimer(
  state: TimerState,
  timerId?: string,
  callback?: (newState: TimerState) => void
) {
  if (!timerId) {
    return state;
  }

  let tempState = { ...state };
  tempState[timerId] = { count: tempState[timerId].count + 1 };
  callback?.(tempState);
  return tempState;
}

export function removeTimer(state: TimerState, timerId: string) {
  let tempState = { ...state };
  delete tempState[timerId];

  return tempState;
}
