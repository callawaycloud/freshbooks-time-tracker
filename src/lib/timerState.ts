import { SelectValue } from "antd/lib/select";

interface KeyMap<T> {
  [key: string]: T;
}

export interface TimerEntry {
  count: number;
  project?: string;
  task?: string;
  notes?: string;
  freshbooksId?: string;
  unsavedChanges?: boolean;
}

export interface FieldEntry {
  fieldValue: string;
  field: string;
}

export type TimerState = KeyMap<TimerEntry>;

export function newTimer(state: TimerState, newTempId: string) {
  let tempState = { ...state };
  tempState[newTempId] = {
    count: 0,
    unsavedChanges: true,
  };

  console.log(tempState);

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
  tempState[timerId] = {
    ...tempState[timerId],
    count: tempState[timerId].count + 1,
  };
  callback?.(tempState);
  return tempState;
}

export function removeTimer(state: TimerState, timerId: string) {
  let tempState = { ...state };
  delete tempState[timerId];

  return tempState;
}

/*export function updateFieldValue(state: TimerState, timerId: string) {
  let tempState = { ...state };
  return tempState;
}*/
