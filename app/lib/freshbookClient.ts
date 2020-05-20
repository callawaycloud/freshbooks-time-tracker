import moment from 'moment';
import { KeyMap } from './timerState';

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
  tasks?: Task[];
}

export interface Task {
  task_id: string;
  name: string;
}

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

export function retrieveProjects(
  apiUrl: string | undefined,
  apiToken: string | undefined
): Promise<Project[]> {
  return new Promise((resolve, reject) => {
    const freshbooks = new FreshBooks(apiUrl, apiToken);

    const projectList: Project[] = [];

    freshbooks.project.list({ per_page: 50 }, function(
      err: any,
      projects: any,
      metaData: any
    ) {
      // reject(new Error('error here'));
      if (err) {
        reject(err);
      }
      projects.forEach((proj: { project_id: any; name: any }) => {
        projectList.push({ project_id: proj.project_id, name: proj.name });
        console.log(proj);
      });
      resolve(projectList);
    });
  });
}

export function retrieveTasks(
  apiUrl: string | undefined,
  apiToken: string | undefined
): Promise<Task[]> {
  return new Promise((resolve, reject) => {
    const freshbooks = new FreshBooks(apiUrl, apiToken);

    const taskList: Task[] = [];

    freshbooks.task.list({}, function(err: any, tasks: any, metaData: any) {
      // reject(new Error('error here'));
      if (err) {
        reject(err);
      }
      console.log('tasks', tasks);
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

export function retrieveProjectTasks(
  apiUrl: string | undefined,
  apiToken: string | undefined,
  projects: Project[]
): any {
  const promises: any = [];

  projects.forEach(proj => {
    console.log(proj);
    promises.push(taskPromise(apiUrl, apiToken, proj.project_id));
  });

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

  /* return new Promise((resolve, reject) => {
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
      console.log('tasks', tasks);
      tasks.forEach((task: { task_id: any; name: any }) => {
        taskList.push({ task_id: task.task_id, name: task.name });
      });
      resolve(taskList);
    });
  }); */
}
