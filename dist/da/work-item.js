"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isWorkItemArgumentOss = exports.isWorkItemArgumentJson = exports.newWorkItemByWebSocket = exports.waitForWorkItem = exports.newWorkItemBody = exports.newWorkItem = exports.getWorkItem = void 0;
const _1 = require(".");
function isWorkItemArgumentJson(arg) {
    return 'json' in arg;
}
exports.isWorkItemArgumentJson = isWorkItemArgumentJson;
function isWorkItemArgumentOss(arg) {
    return 'bucketKey' in arg && 'objectKey' in arg;
}
exports.isWorkItemArgumentOss = isWorkItemArgumentOss;
function extractArguments(args, token) {
    const extracted = {};
    for (const [key, val] of Object.entries(args)) {
        if (isWorkItemArgumentJson(val)) {
            extracted[key] = {
                verb: 'get',
                url: `data:application/json,${val.json}`,
            };
        }
        else if (isWorkItemArgumentOss(val)) {
            const { verb, bucketKey, objectKey } = val;
            extracted[key] = {
                verb,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                url: `urn:adsk.objects:os.object:${bucketKey}/${objectKey}`
            };
        }
        else {
            throw new Error('invalid arg: ' + JSON.stringify({ key, val }));
        }
    }
    return extracted;
}
async function getWorkItem(token, id) {
    const url = `${_1.DA_URL}/workitems/${id}`;
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
    return result;
}
exports.getWorkItem = getWorkItem;
function newWorkItemBody(token, activityId, args) {
    const data = {
        activityId,
        arguments: extractArguments(args, token),
    };
    return data;
}
exports.newWorkItemBody = newWorkItemBody;
async function newWorkItem(token, data) {
    console.log('new-work-item', { data });
    const url = `${_1.DA_URL}/workitems`;
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
    const result = await res.json();
    console.log('newWorkItem', { result });
    return result;
}
exports.newWorkItem = newWorkItem;
async function waitForWorkItem(token, workItemId) {
    const status = await new Promise((resolve) => {
        async function waitWorkItem() {
            const workItem = await getWorkItem(token, workItemId);
            const { status } = workItem;
            console.log('wait for work item', { id: workItemId, status });
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
exports.waitForWorkItem = waitForWorkItem;
async function newWorkItemByWebSocket(token, data) {
    return new Promise((resolve, reject) => {
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
        });
        socket.addEventListener('message', (event) => {
            if (!('data' in event)) {
                throw new Error();
            }
            const json = JSON.parse(event.data);
            console.log('websocket received', { json });
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
                    console.log('received process', { json });
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
exports.newWorkItemByWebSocket = newWorkItemByWebSocket;
