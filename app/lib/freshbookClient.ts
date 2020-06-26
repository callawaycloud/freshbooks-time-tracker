import moment from 'moment';
// eslint-disable-next-line import/no-cycle
import { TimerState, TimerEntry, KeyMap } from './timerState';

const FreshBooks = require('freshbooks-api');
const { shell } = require('electron');

export interface FreshbookClient {
  token: string;
}

export interface FreshbookXMLRequest {
  xmlString: string;
}

export interface Project {
  project_id: string;
  name: string;
  tasks: Task[];
  client_id: string;
}

export interface Task {
  task_id: string;
  name: string;
}

export interface Client {
  client_id: string;
  name: string;
  projects: Project[];
}

export type ClientMap = KeyMap<Client>;

export const testThis: FreshbookXMLRequest = { xmlString: '' };

export function openLinkToFreshbookEntry(
  event: React.MouseEvent<HTMLElement, MouseEvent>,
  entryURL: string
) {
  event.preventDefault();
  shell.openExternal(entryURL);
}

export function retrieveStaffData(
  apiUrl: string | undefined,
  apiToken: string | undefined
) {
  return new Promise((resolve, reject) => {
    const freshbooks = new FreshBooks(apiUrl, apiToken);

    freshbooks.staff.current(function(err: any, result: any) {
      if (err) {
        reject(err);
      }
      resolve(result);
    });
  });
}

export function retrieveTimeEntries(
  apiUrl: string | undefined,
  apiToken: string | undefined,
  staffId: string | undefined,
  selectedDate: any,
  timerState: TimerState
): Promise<TimerState> {
  return new Promise((resolve, reject) => {
    const freshbooks = new FreshBooks(apiUrl, apiToken);

    freshbooks.time_entry.list(
      {
        date_from: selectedDate.format('YYYY-MM-DD'),
        date_to: selectedDate.format('YYYY-MM-DD'),
        per_page: 200
      },
      function(err: any, timeEntries: any, metaData: any) {
        if (err) {
          reject(err);
        }
        const timerStateClone = { ...timerState };

        const timerEntryArray: TimerEntry[] = Object.values(timerStateClone);

        // eslint-disable-next-line no-restricted-syntax
        for (const entry of timeEntries) {
          if (staffId !== entry.staff_id) {
            // eslint-disable-next-line no-continue
            continue;
          }

          const localEntryData = timerEntryArray.find(
            ({ freshbooksId }) => freshbooksId === entry.time_entry_id
          );
          const entryCount = entry.hours * 60 * 60;
          const entryData: TimerEntry = {
            localId: entry.time_entry_id,
            count: entryCount,
            roundedCount: entryCount,
            project: entry.project_id,
            notes: entry.notes,
            freshbooksId: entry.time_entry_id,
            unsavedChanges: false,
            date: entry.date,
            task: entry.task_id,
            countLoggedinFreshbook: entryCount
          };
          if (!localEntryData) {
            timerStateClone[entry.time_entry_id] = entryData;
          } else if (
            !localEntryData.unsavedChanges ||
            localEntryData.roundedCount < entryData.roundedCount
          ) {
            entryData.localId = localEntryData.localId;
            timerStateClone[localEntryData.localId] = entryData;
          }
        }

        resolve(timerStateClone);
      }
    );
  });
}

export function retrieveClients(
  apiUrl: string | undefined,
  apiToken: string | undefined
): Promise<ClientMap> {
  return new Promise((resolve, reject) => {
    const freshbooks = new FreshBooks(apiUrl, apiToken);

    freshbooks.client.list({ per_page: 100, folder: 'active' }, function(
      err: any,
      clients: any,
      metaData: any
    ) {
      if (err) {
        reject(err);
      }

      const clientMap: ClientMap = clients.reduce(
        (
          obj: { [x: string]: Client },
          client: { client_id: string; organization: string }
        ) => {
          // eslint-disable-next-line no-param-reassign
          obj[client.client_id] = {
            client_id: client.client_id,
            name: client.organization,
            projects: []
          };
          return obj;
        },
        {}
      );

      resolve(clientMap);
    });
  });
}

export function retrieveTasks(
  apiUrl: string | undefined,
  apiToken: string | undefined,
  projectId: string
): Promise<Task[]> {
  return new Promise((resolve, reject) => {
    const freshbooks = new FreshBooks(apiUrl, apiToken);

    const taskList: Task[] = [];

    freshbooks.task.list({ project_id: projectId }, function(
      err: any,
      tasks: any,
      metaData: any
    ) {
      if (err) {
        reject(err);
      }
      tasks.forEach((task: { task_id: any; name: any }) => {
        taskList.push({ task_id: task.task_id, name: task.name });
      });
      resolve(taskList);
    });
  });
}

function taskPromise(
  apiUrl: string | undefined,
  apiToken: string | undefined,
  projectId: string
) {
  return new Promise<KeyMap<Task[]>>((resolve, reject) => {
    const freshbooks = new FreshBooks(apiUrl, apiToken);

    const taskListMap: KeyMap<Task[]> = {};

    freshbooks.task.list({ project_id: projectId }, function(
      err: any,
      tasks: any,
      metaData: any
    ) {
      if (err) {
        reject(err);
      }
      const taskList: Task[] = [];
      tasks.forEach((task: Task) => {
        taskList.push({ task_id: task.task_id, name: task.name });
      });
      taskListMap[projectId] = taskList;
      resolve(taskListMap);
    });
  });
}

export async function retrieveProjectTasks(
  apiUrl: string | undefined,
  apiToken: string | undefined,
  projects: Project[]
) {
  const promises: Promise<KeyMap<Task[]>>[] = [];

  // eslint-disable-next-line no-restricted-syntax
  for (const project of projects) {
    // eslint-disable-next-line no-await-in-loop
    promises.push(taskPromise(apiUrl, apiToken, project.project_id));
  }

  const response = await Promise.all(promises);
  return response.reduce((projectTaskMap, item) => {
    const keyOfObject = Object.keys(item)[0];
    // eslint-disable-next-line no-param-reassign
    projectTaskMap[keyOfObject] = item[keyOfObject];
    return projectTaskMap;
  });
}

export function retrieveProjects(
  apiUrl: string | undefined,
  apiToken: string | undefined
): Promise<Project[]> {
  return new Promise((resolve, reject) => {
    const freshbooks = new FreshBooks(apiUrl, apiToken);

    const projectList: Project[] = [];

    freshbooks.project.list({ per_page: 100 }, async function(
      err: any,
      projects: any,
      metaData: any
    ) {
      if (err) {
        reject(err);
      }

      const projectTask = await retrieveProjectTasks(
        apiUrl,
        apiToken,
        projects
      );

      // eslint-disable-next-line no-restricted-syntax
      for (const project of projects) {
        const taskForProject = projectTask[project.project_id];
        projectList.push({
          project_id: project.project_id,
          name: project.name,
          tasks: taskForProject,
          client_id: project.client_id
        });
      }
      resolve(projectList);
    });
  });
}

export function createTimeEntry(
  apiUrl: string | undefined,
  apiToken: string | undefined,
  timerEntry: TimerEntry
): Promise<TimerEntry> {
  return new Promise((resolve, reject) => {
    const freshbooks = new FreshBooks(apiUrl, apiToken);

    freshbooks.time_entry.create(
      {
        hours: timerEntry.roundedCount / 60 / 60,
        project_id: timerEntry.project,
        task_id: timerEntry.task,
        notes: timerEntry.notes,
        date: timerEntry.date
      },
      function(err: any, result: any) {
        if (err) {
          reject(err);
        }
        const tempTimerEntry = { ...timerEntry };

        tempTimerEntry.freshbooksId = result.time_entry_id;
        tempTimerEntry.countLoggedinFreshbook = tempTimerEntry.roundedCount;

        resolve(tempTimerEntry);
      }
    );
  });
}

export function updateTimeEntry(
  apiUrl: string | undefined,
  apiToken: string | undefined,
  timerEntry: TimerEntry
): Promise<TimerEntry> {
  return new Promise((resolve, reject) => {
    const freshbooks = new FreshBooks(apiUrl, apiToken);

    freshbooks.time_entry.update(
      {
        hours: timerEntry.roundedCount / 60 / 60,
        time_entry_id: timerEntry.freshbooksId,
        project_id: timerEntry.project,
        task_id: timerEntry.task,
        notes: timerEntry.notes
      },
      function(err: any, result: any) {
        if (err) {
          reject(err);
        }
        const tempTimerEntry = { ...timerEntry };

        tempTimerEntry.countLoggedinFreshbook = tempTimerEntry.roundedCount;

        resolve(tempTimerEntry);
      }
    );
  });
}
