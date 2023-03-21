type WorkItemArguments = {
    [key: string]: WorkItemArgument;
};
type WorkItemArgumentDataList = {
    [key: string]: WorkItemArgumentData;
};
type WorkItemArgument = {
    url: string;
    verb?: 'get' | 'head' | 'put';
    headers?: {
        [key: string]: string;
    };
};
type WorkItemArgumentData = WorkItemArgumentJson | WorkItemArgumentOss;
type WorkItemArgumentJson = {
    json: string;
};
type WorkItemArgumentOss = {
    verb: 'get' | 'head' | 'put';
    bucketKey: string;
    objectKey: string;
};
type WorkItemStatus = 'pending' | 'inprogress' | 'cancelled' | 'failedLimitProcessingTime' | 'failedDownload' | 'failedInstructions' | 'failedUpload' | 'failedUploadOptional' | 'success';
type WorkItemEntry = {
    id: string;
    activityId: string;
    arguments: WorkItemArgumentDataList;
    timeQueued: string;
    status: WorkItemStatus;
    reportUrl?: string;
};
type NewWorkItemBody = {
    activityId: string;
    arguments: WorkItemArguments;
};
type WorkItemApiResponse = {
    id: string;
    status: WorkItemStatus;
    stats: {
        timeQueued: string;
    };
};
type WorkItem = {
    id: string;
    status: WorkItemStatus;
    progress: string;
    reportUrl: string;
    stats: any;
};
declare function isWorkItemArgumentJson(arg: WorkItemArgumentData): arg is WorkItemArgumentJson;
declare function isWorkItemArgumentOss(arg: WorkItemArgumentData): arg is WorkItemArgumentOss;
declare function getWorkItem(token: string, id: string): Promise<WorkItem>;
declare function newWorkItemBody(token: string, activityId: string, args: WorkItemArgumentDataList): NewWorkItemBody;
declare function newWorkItem(token: string, data: NewWorkItemBody): Promise<WorkItemApiResponse>;
declare function waitForWorkItem(token: string, workItemId: string): Promise<WorkItemStatus>;
declare function newWorkItemByWebSocket(token: string, data: NewWorkItemBody): Promise<WorkItemStatus>;
export { getWorkItem, newWorkItem, newWorkItemBody, waitForWorkItem, newWorkItemByWebSocket, isWorkItemArgumentJson, isWorkItemArgumentOss, };
export type { WorkItemArgument, WorkItemArguments, WorkItemArgumentData, WorkItemArgumentDataList, WorkItemArgumentJson, WorkItemArgumentOss, NewWorkItemBody, WorkItemApiResponse, WorkItemEntry, WorkItemStatus, };
