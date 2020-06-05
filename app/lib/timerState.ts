// eslint-disable-next-line import/no-cycle
import moment from 'antd/node_modules/moment';
// eslint-disable-next-line import/no-cycle
import { Task } from './freshbookClient';

export interface KeyMap<T> {
  [key: string]: T;
}

export interface TimerEntry {
  localId: string;
  count: number;
  roundedCount: number;
  countLoggedinFreshbook?: number;
  project?: string;
  task?: string;
  notes?: string;
  freshbooksId?: string;
  unsavedChanges?: boolean;
  date?: string;
}

export interface FieldEntry {
  fieldValue: string;
  field: string;
}

export type TimerState = KeyMap<TimerEntry>;

export type ProjectTaskState = KeyMap<Task[]>;

export function newTimer(state: TimerState, newTempId: string) {
  const tempState = { ...state };
  tempState[newTempId] = {
    localId: newTempId,
    count: 0,
    roundedCount: 0,
    unsavedChanges: true,
    date: moment().format('YYYY-MM-DD')
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

  const tempState = { ...state };

  const newCount = tempState[timerId].count + 1;

  tempState[timerId] = {
    ...tempState[timerId],
    count: newCount,
    roundedCount: Math.ceil((newCount - 60) / 900) * 900
  };
  callback?.(tempState);
  return tempState;
}

export function removeTimer(state: TimerState, timerId: string) {
  const tempState = { ...state };
  delete tempState[timerId];

  return tempState;
}
