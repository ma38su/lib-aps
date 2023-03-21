import { DA_URL } from ".";

type WorkItemArguments = {
  [key: string]: WorkItemArgument
};

type WorkItemArgumentDataList = {
  [key: string]: WorkItemArgumentData
};

type WorkItemArgument = {
  url: string,
  verb?: 'get' | 'head' | 'put',
  headers?: { [key: string]: string },
};

type WorkItemArgumentData = WorkItemArgumentJson | WorkItemArgumentOss;

type WorkItemArgumentJson = {
  json: string,
}

type WorkItemArgumentOss = {
  verb: 'get' | 'head' | 'put',
  bucketKey: string,
  objectKey: string,
};

type WorkItemStatus = 'pending' | 'inprogress' | 'cancelled' | 'failedLimitProcessingTime' | 'failedDownload' | 'failedInstructions' | 'failedUpload' | 'failedUploadOptional' | 'success';

type WorkItemEntry = {
  id: string,
  activityId: string,
  arguments: WorkItemArgumentDataList,
  timeQueued: string,
  status: WorkItemStatus,
  reportUrl?: string,
}

type NewWorkItemBody = {
  activityId: string,
  arguments: WorkItemArguments,
};

type WorkItemApiResponse = {
  id: string,
  status: WorkItemStatus,
  stats: {
    timeQueued: string
  }
}

type WorkItem = {
  id: string,
  status: WorkItemStatus,
  progress: string,
  reportUrl: string,
  stats: any,
};

type WorkItemWebSocketResponse = WorkItemWebSocketResponseProgress | WorkItemWebSocketResponseStatus | WorkItemWebSocketResponseError;

type WorkItemWebSocketResponseProgress = {
  action: 'progress',
  data: {
    id: string,
  }
};

type WorkItemWebSocketResponseStatus = {
  action: 'status',
  data: {
    id: string,
    reportUrl: string,
    status: WorkItemStatus,
  }
};

type WorkItemWebSocketResponseError = {
  action: 'error',
  data: any,
};

function isWorkItemArgumentJson(arg: WorkItemArgumentData): arg is WorkItemArgumentJson {
  return 'json' in arg;
}

function isWorkItemArgumentOss(arg: WorkItemArgumentData): arg is WorkItemArgumentOss {
  return 'bucketKey' in arg && 'objectKey' in arg;
}

function extractArguments(args: WorkItemArgumentDataList, token: string): WorkItemArguments {
  const extracted: WorkItemArguments = {};
  for (const [key, val] of Object.entries(args)) {
    if (isWorkItemArgumentJson(val)) {
      extracted[key] = {
        verb: 'get',
        url: `data:application/json,${val.json}`,
      };
    } else if (isWorkItemArgumentOss(val)) {
      const { verb, bucketKey, objectKey } = val;
      extracted[key] = {
        verb,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        url: `urn:adsk.objects:os.object:${bucketKey}/${objectKey}`
      }
    } else {
      throw new Error('invalid arg: '+ JSON.stringify({ key, val }));
    }
  }
  return extracted;
}

async function getWorkItem(token: string, id: string): Promise<WorkItem> {
  const url = `${DA_URL}/workitems/${id}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const { status } = res;
  switch (status) {
    case 200:
      break;
    default:
      console.error({ res });
      const msg = await res.json();
      throw new Error(`${status}: ${JSON.stringify(msg)}`);
  }
  const result = await res.json();
  return result as WorkItem;
}

function newWorkItemBody(token: string, activityId: string, args: WorkItemArgumentDataList): NewWorkItemBody {
  const data = {
    activityId,
    arguments: extractArguments(args, token),
  } satisfies NewWorkItemBody;
  return data;
}

async function newWorkItem(token: string, data: NewWorkItemBody): Promise<WorkItemApiResponse> {
  console.log('new-work-item', { data });
  const url = `${DA_URL}/workitems`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    cache: 'no-cache',
    body: JSON.stringify(data),
  });
  console.log({ res });
  const { status } = res;
  switch (status) {
    case 200:
      break;
    default:
      console.error({ res });
      const msg = await res.json();
      throw new Error(`${status}: ${JSON.stringify(msg)}`);
  }

  const result = await res.json() as WorkItemApiResponse;
  console.log('newWorkItem', { result });

  return result;
}

async function waitForWorkItem(token: string, workItemId: string) {
  const status = await new Promise<WorkItemStatus>((resolve) => {
    async function waitWorkItem() {
      const workItem = await getWorkItem(token, workItemId);
      const { status } = workItem;
      console.log('wait for work item', {id: workItemId, status});
      if (status === 'pending' || status === 'inprogress') {
        setTimeout(() => waitWorkItem(), 2000);
        return;
      }
      resolve(status);
    }
    void waitWorkItem();
  });
  return status;
}

async function newWorkItemByWebSocket(token: string, data: NewWorkItemBody): Promise<WorkItemStatus> {
  return new Promise<WorkItemStatus>((resolve, reject) => {
    const socket = new WebSocket('wss://websockets.forgedesignautomation.io');
    socket.addEventListener('open', (event) => {
      console.log('websocket open', event);

      socket.send(JSON.stringify({
        action: "post-workitem",
        data,
        headers: {
          Authorization: `Bearer ${token}`
        }
      }));
    })
    socket.addEventListener('message', (event) => {
      if (!('data' in event)) {
        throw new Error();
      }

      const json = JSON.parse(event.data as string) as WorkItemWebSocketResponse;
      console.log('websocket received', {json});
      
      const { action, data } = json;
      switch (action) {
        case 'status':
          const { status } = data;
          if (status !== 'pending' && status !== 'inprogress') {
            resolve(status);
            socket.close();
          }
          break;
        case 'progress':
          console.log('received process', {json});
          break;
        case 'error':
          const errorData = JSON.parse(data);
          reject(errorData);
          break;
        default:
          reject(json);
          break;
      }
    });
    socket.addEventListener('error', (event) => {
      console.error('websocket error', event);
      reject('error');
    });
    socket.addEventListener('close', (event) => {
      console.log('websocket close', event);
      reject('close');
    });
  });
} 

export {
  getWorkItem,
  newWorkItem,
  newWorkItemBody,
  waitForWorkItem,
  newWorkItemByWebSocket,
  isWorkItemArgumentJson,
  isWorkItemArgumentOss,
}

export type {
  WorkItemArgument,
  WorkItemArguments,
  WorkItemArgumentData,
  WorkItemArgumentDataList,
  WorkItemArgumentJson,
  WorkItemArgumentOss,
  NewWorkItemBody,
  WorkItemApiResponse,
  WorkItemEntry,
  WorkItemStatus,
}