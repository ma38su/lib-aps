import { BASE_URL } from "../index";

const OSS_URL = `${BASE_URL}/oss/v2`;

type PolicyVal = 'transient' | 'temporary' | 'persistent';

const POLICY_LIST: PolicyVal[] = [
  'transient', 'temporary', 'persistent'
]

/** default value is 'read'. */
type AccessVal = 'read' | 'write' | 'readwrite';

type IBucket = {
  bucketKey: string,
  createdDate: Date,
  policyKey: string,
}

type BucketRaw = {
  bucketKey: string,
  createdDate: number,
  policyKey: string,
}

type IObject = {
  bucketKey: string,
  objectId: string, // URN
  objectKey: string,
  sha1: string,
  size: number,
  location: string,
  next: string,
}

type SignedUrls = {
  signedUrl: string;
}

function castPolicyVal(val: string): PolicyVal {
  if (val === 'transient' || val === 'temporary' || val === 'persistent') {
    return val;
  }
  throw new Error(`invalid policy key: ${val}`)
}

async function getBuckets(token: string): Promise<IBucket[]> {
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

  const { items } = await res.json() as { items: BucketRaw[] };
  return items.map(item => {
    console.log({item});
    const {
      bucketKey,
      createdDate,
      policyKey,
    } = item;  
    return {
      bucketKey,
      createdDate: new Date(createdDate),
      policyKey,
    };
  })
}

async function newBucket(token: string, bucketKey: string, policyKey: PolicyVal): Promise<any> {
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

async function deleteBucket(token: string, bucketKey: string): Promise<void> {
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

async function getObjects(token: string, bucketKey: string): Promise<IObject[]> {
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
  return items as IObject[];
}

async function getObjectDetails(token: string, bucketKey: string, objectKey: string): Promise<any> {
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

function getObjectTemporaryUrlUrl(bucketKey: string, objectKey: string, access?: AccessVal): string {
  const url = `${OSS_URL}/buckets/${bucketKey}/objects/${objectKey}/signed`;
  if (access) {
    return `${url}?access=${access}`;
  } else {
    return url;
  }
}

async function getObjectTemporaryUrl(token: string, bucketKey: string, objectKey: string, access?: AccessVal): Promise<SignedUrls> {
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

  return await res.json() as SignedUrls;
}

function toUrn(bucketKey: string, objectKey: string): string {
  return `urn:adsk.objects:os.object:${bucketKey}/${objectKey}`;
}

async function deleteObject(token: string, bucketKey: string, objectKey: string): Promise<void> {
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

async function uploadBlobToS3(url: string, formData: any, blob: Blob): Promise<void> {
  const fd = new FormData();
  for (const [key, value] of Object.entries(formData)) {
    fd.set(key, value as string);
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

export type {
  IBucket,
  IObject,
  PolicyVal,
}

export {
  POLICY_LIST,
  castPolicyVal,

  uploadBlobToS3,

  getBuckets,
  newBucket,
  deleteBucket,

  toUrn,

  getObjects,
  getObjectTemporaryUrl,
  getObjectDetails,
  deleteObject,
}