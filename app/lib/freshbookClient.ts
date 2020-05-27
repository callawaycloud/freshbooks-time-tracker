import moment from 'moment';
// eslint-disable-next-line import/no-cycle
import { TimerState, TimerEntry, KeyMap } from './timerState';

const FreshBooks = require('freshbooks-api');

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

export type ClientMap = KeyMap<Client[]>;

export const testThis: FreshbookXMLRequest = { xmlString: '' };

// const apiUrl = 'https://callawaycloudconsulting.freshbooks.com/api/2.1/xml-in';
// const apiToken = '975952a803084cc449a863c5f80941f9';

export function testIntegration(
  apiUrl: string | undefined,
  apiToken: string | undefined
) {
  /* var freshbooks = new FreshBooks(apiUrl, apiToken),
    timeEntryList = new freshbooks.Time_Entry(); */
  // console.log(timeEntryList.list);

  /* invoice.get(invoice_id, function (err, invoice) {
    if (err) {
      //returns if an error has occured, ie invoice_id doesn't exist.
      console.log(err);
    } else {
      console.log("Invoice Number:" + invoice.number);
    }
  }); */

  const freshbooks = new FreshBooks(apiUrl, apiToken);

  freshbooks.time_entry.list(
    {
      date_from: moment().format('YYYY-MM-DD'),
      date_to: moment().format('YYYY-MM-DD')
    },
    function(err: any, timeEntries: any, metaData: any) {
      console.log(err);
      console.log(timeEntries);
      /* do things */
    }
  );

  freshbooks.project.list({ per_page: 50 }, function(
    err: any,
    projects: any,
    metaData: any
  ) {
    // console.log(err);
    // console.log(projects);
    // console.log(metaData);
    /* do things */
  });

  freshbooks.task.list({ per_page: 50 }, function(
    err: any,
    projects: any,
    metaData: any
  ) {
    console.log(projects);
    // console.log(err);
    // console.log(projects);
    // console.log(metaData);
    /* do things */
  });
}

export function retrieveTimeEntries(
  apiUrl: string | undefined,
  apiToken: string | undefined,
  timerState: TimerState
): Promise<TimerState> {
  return new Promise((resolve, reject) => {
    const freshbooks = new FreshBooks(apiUrl, apiToken);

    freshbooks.time_entry.list(
      {
        date_from: moment().format('YYYY-MM-DD'),
        date_to: moment().format('YYYY-MM-DD')
      },
      function(err: any, timeEntries: any, metaData: any) {
        if (err) {
          reject(err);
        }
        const timerStateClone = { ...timerState };

        console.log(timerStateClone);

        const timerEntryArray: TimerEntry[] = Object.values(timerStateClone);

        // eslint-disable-next-line no-restricted-syntax
        for (const entry of timeEntries) {
          console.log(entry);
          const localEntryData = timerEntryArray.find(
            ({ freshbooksId }) => freshbooksId === entry.time_entry_id
          );
          console.log(localEntryData);
          if (!localEntryData) {
            const entryCount = entry.hours * 60 * 60;
            const entryData: TimerEntry = {
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
            console.log(entryData);
            timerStateClone[entry.time_entry_id] = entryData;
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

      console.log(clients);

      const clientMap: ClientMap = clients
        // .filter((client: any) => client.folder === 'active')
        .reduce(
          (
            obj: { [x: string]: Client },
            client: { client_id: string; organization: any }
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

      console.log(clientMap);

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
      // reject(new Error('error here'));
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
  return new Promise((resolve, reject) => {
    const freshbooks = new FreshBooks(apiUrl, apiToken);

    const taskListMap: KeyMap<Task[]> = {};

    freshbooks.task.list({ project_id: projectId }, function(
      err: any,
      tasks: any,
      metaData: any
    ) {
      // reject(new Error('error here'));
      if (err) {
        reject(err);
      }
      console.log('tasks', tasks);
      const taskList: Task[] = [];
      tasks.forEach((task: { task_id: any; name: any }) => {
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
): any {
  const promises: any = [];

  // eslint-disable-next-line no-restricted-syntax
  for (const project of projects) {
    console.log(project);
    // eslint-disable-next-line no-await-in-loop
    promises.push(taskPromise(apiUrl, apiToken, project.project_id));
  }

  return Promise.all(promises)
    .then(response => {
      console.log(response);
      return response.reduce((projectTaskMap, item) => {
        const keyOfObject = Object.keys(item)[0];
        projectTaskMap[keyOfObject] = item[keyOfObject];
        return projectTaskMap;
      });
    })
    .catch(error => console.log(error));
}

export function retrieveProjects(
  apiUrl: string | undefined,
  apiToken: string | undefined
): Promise<Project[]> {
  return new Promise((resolve, reject) => {
    const freshbooks = new FreshBooks(apiUrl, apiToken);

    const projectList: Project[] = [];

    freshbooks.project.list({ per_page: 50 }, async function(
      err: any,
      projects: any,
      metaData: any
    ) {
      // reject(new Error('error here'));
      if (err) {
        reject(err);
      }

      console.log(projects);

      const projectTask = await retrieveProjectTasks(
        apiUrl,
        apiToken,
        projects
      );
      console.log('here', projectTask);

      // eslint-disable-next-line no-restricted-syntax
      for (const project of projects) {
        // eslint-disable-next-line no-await-in-loop
        /* const taskList: Task[] = await retrieveTasks(
          apiUrl,
          apiToken,
          project.project_id
        ); */
        const taskForProject = projectTask[project.project_id];
        projectList.push({
          project_id: project.project_id,
          name: project.name,
          tasks: taskForProject,
          client_id: project.client_id
        });
      }

      /* projects.forEach(async (proj: { project_id: any; name: any }) => {
        const taskList: Task[] = await retrieveTasks(
          apiUrl,
          apiToken,
          proj.project_id
        );
        projectList.push({
          project_id: proj.project_id,
          name: proj.name,
          tasks: taskList
        });
      }); */
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
        notes: timerEntry.notes
      },
      function(err: any, result: any) {
        if (err) {
          reject(err);
        }
        const tempTimerEntry = { ...timerEntry };

        tempTimerEntry.freshbooksId = result.time_entry_id;
        tempTimerEntry.countLoggedinFreshbook = tempTimerEntry.roundedCount;
        console.log(tempTimerEntry);

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
