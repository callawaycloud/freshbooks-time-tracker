interface KeyMap<T> {
  [key: string]: T;
}

export interface TimerEntry {
  count: number;
  roundedCount: number;
  project?: string;
  task?: string;
  notes?: string;
  freshbooksId?: string;
  unsavedChanges?: boolean;
  date?: Date;
}

export interface FieldEntry {
  fieldValue: string;
  field: string;
}

export type TimerState = KeyMap<TimerEntry>;

export function newTimer(state: TimerState, newTempId: string) {
  const tempState = { ...state };
  tempState[newTempId] = {
    count: 0,
    roundedCount: 0,
    unsavedChanges: true,
    date: new Date()
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

/* export function updateFieldValue(state: TimerState, timerId: string) {
  let tempState = { ...state };
  return tempState;
} */
