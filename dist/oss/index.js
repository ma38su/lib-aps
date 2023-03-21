import { BASE_URL } from "../index";
const OSS_URL = `${BASE_URL}/oss/v2`;
const POLICY_LIST = [
    'transient', 'temporary', 'persistent'
];
function castPolicyVal(val) {
    if (val === 'transient' || val === 'temporary' || val === 'persistent') {
        return val;
    }
    throw new Error(`invalid policy key: ${val}`);
}
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
function toUrn(bucketKey, objectKey) {
    return `urn:adsk.objects:os.object:${bucketKey}/${objectKey}`;
}
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
export { POLICY_LIST, castPolicyVal, uploadBlobToS3, getBuckets, newBucket, deleteBucket, toUrn, getObjects, getObjectTemporaryUrl, getObjectDetails, deleteObject, };
