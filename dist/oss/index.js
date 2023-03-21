"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteObject = exports.getObjectDetails = exports.getObjectTemporaryUrl = exports.getObjects = exports.toUrn = exports.deleteBucket = exports.newBucket = exports.getBuckets = exports.uploadBlobToS3 = exports.castPolicyVal = exports.POLICY_LIST = void 0;
const index_1 = require("../index");
const OSS_URL = `${index_1.BASE_URL}/oss/v2`;
const POLICY_LIST = [
    'transient', 'temporary', 'persistent'
];
exports.POLICY_LIST = POLICY_LIST;
function castPolicyVal(val) {
    if (val === 'transient' || val === 'temporary' || val === 'persistent') {
        return val;
    }
    throw new Error(`invalid policy key: ${val}`);
}
exports.castPolicyVal = castPolicyVal;
async function getBuckets(token) {
    if (!token) {
        throw new Error("token is required.");
    }
    const url = `${OSS_URL}/buckets`;
    const res = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    });
    const { status } = res;
    switch (status) {
        case 200:
            break;
        default:
            console.error({ res, url });
            const msg = await res.json();
            throw new Error(`${status}: ${JSON.stringify(msg)}`);
    }
    const { items } = await res.json();
    return items.map(item => {
        console.log({ item });
        const { bucketKey, createdDate, policyKey, } = item;
        return {
            bucketKey,
            createdDate: new Date(createdDate),
            policyKey,
        };
    });
}
exports.getBuckets = getBuckets;
async function newBucket(token, bucketKey, policyKey) {
    const data = {
        bucketKey,
        access: 'full',
        policyKey,
    };
    const url = `${OSS_URL}/buckets`;
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    const { status } = res;
    switch (status) {
        case 200:
            break;
        default:
            console.error({ res, url, bucketKey });
            const msg = await res.json();
            throw new Error(`${status}: ${JSON.stringify(msg)}`);
    }
    return await res.json();
}
exports.newBucket = newBucket;
async function deleteBucket(token, bucketKey) {
    const url = `${OSS_URL}/buckets/${bucketKey}`;
    const res = await fetch(url, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    const { status } = res;
    switch (status) {
        case 200:
            break;
        default:
            console.error({ res, url, bucketKey });
            const msg = await res.json();
            throw new Error(`${status}: ${JSON.stringify(msg)}`);
    }
}
exports.deleteBucket = deleteBucket;
async function getObjects(token, bucketKey) {
    const url = `${OSS_URL}/buckets/${bucketKey}/objects`;
    const res = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    const { status } = res;
    if (!res.ok) {
        console.error({ res, url, bucketKey });
        const msg = await res.json();
        throw new Error(`${status}: ${JSON.stringify(msg)}`);
    }
    const { items } = await res.json();
    return items;
}
exports.getObjects = getObjects;
async function getObjectDetails(token, bucketKey, objectKey) {
    const url = `${OSS_URL}/buckets/${bucketKey}/objects/${objectKey}/details`;
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
            console.error({ res, url, bucketKey });
            const msg = await res.json();
            throw new Error(`${status}: ${JSON.stringify(msg)}`);
    }
    return await res.json();
}
exports.getObjectDetails = getObjectDetails;
function getObjectTemporaryUrlUrl(bucketKey, objectKey, access) {
    const url = `${OSS_URL}/buckets/${bucketKey}/objects/${objectKey}/signed`;
    if (access) {
        return `${url}?access=${access}`;
    }
    else {
        return url;
    }
}
async function getObjectTemporaryUrl(token, bucketKey, objectKey, access) {
    const url = getObjectTemporaryUrlUrl(bucketKey, objectKey, access);
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
    });
    if (!res.ok) {
        const { status } = res;
        console.error({ res, url, bucketKey });
        const msg = await res.json();
        throw new Error(`${status}: ${JSON.stringify(msg)}`);
    }
    return await res.json();
}
exports.getObjectTemporaryUrl = getObjectTemporaryUrl;
function toUrn(bucketKey, objectKey) {
    return `urn:adsk.objects:os.object:${bucketKey}/${objectKey}`;
}
exports.toUrn = toUrn;
async function deleteObject(token, bucketKey, objectKey) {
    if (!token) {
        throw new Error("token is required.");
    }
    if (!bucketKey || !objectKey) {
        throw new Error("bucket key & object key are required.");
    }
    const url = `${OSS_URL}/buckets/${bucketKey}/objects/${objectKey}`;
    const res = await fetch(url, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!res.ok) {
        const { status } = res;
        console.error({ res, url, bucketKey });
        const msg = await res.json();
        throw new Error(`${status}: ${JSON.stringify(msg)}`);
    }
}
exports.deleteObject = deleteObject;
async function uploadBlobToS3(url, formData, blob) {
    const fd = new FormData();
    for (const [key, value] of Object.entries(formData)) {
        fd.set(key, value);
    }
    fd.set('file', blob);
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Cache-Control': 'no-cache',
        },
        body: fd,
    });
    if (!res.ok) {
        const { status } = res;
        console.error({ res });
        const msg = await res.json();
        throw new Error(`${status}: ${JSON.stringify(msg)}`);
    }
}
exports.uploadBlobToS3 = uploadBlobToS3;
