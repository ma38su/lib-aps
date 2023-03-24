import { BASE_URL } from "../index";
import { sleep } from "../test";

const OSS_URL = `${BASE_URL}/oss/v2`;

type PolicyVal = 'transient' | 'temporary' | 'persistent';

const POLICY_LIST: PolicyVal[] = [
  'transient', 'temporary', 'persistent'
]

type AccessVal = 'read' | 'full';

/** default value is 'read'. */
type SignedResourceAccessVal = 'read' | 'write' | 'readwrite';

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

type ResponseUploadObject = {
  bucketKey: string,
  objectId: string,
  objectKey: string,
  sha1: string,
  size: number,
  location: string,
}

type ResponseObjectDetails = {
  bucketKey: string,
  contentType: string,
  location: string,
  objectId: string, // urn
  objectKey: string, // file name
  sha1: string,
  size: number,
}

type ResponseGetBuckets = { items: BucketRaw[] };

type ResponseSignedS3UploadUrl = {
  uploadKey: string,
  uploadExpiration: string, // DateTime?
  urlExpiration: string,  // DateTime?
  urls: string[],
}

type ResponseNewBucket = {
  bucketKey: string,
  bucketOwner: string,
  createdDate: number,
  permissions: {
    authId: string,
    access: AccessVal,
  }[],
  policyKey: PolicyVal,
};

type ResponseBucketDetails = {
  bucketKey: string,
  bucketOwner: string,
  createdDate: number,
  permissions: {
    authId: string,
    access: AccessVal,
  }[],
  policyKey: PolicyVal,
}

function castPolicyVal(val: string): PolicyVal {
  if (val === 'transient' || val === 'temporary' || val === 'persistent') {
    return val;
  }
  throw new Error(`invalid policy key: ${val}`)
}

function newHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

async function getBuckets(token: string): Promise<IBucket[]> {
  if (!token) {
    throw new Error("token is required.");
  }

  const url = `${OSS_URL}/buckets`;
  const res = await fetch(url, {
    method: 'GET',
    headers: newHeaders(token),
  });

  const { status } = res;
  if (!res.ok) {
    console.error({ res, url });
    const msg = await res.json();
    throw new Error(`${status}: ${JSON.stringify(msg)}`);
  }

  const { items } = await res.json() as ResponseGetBuckets;
  return items.map(item => {
    const {
      bucketKey,
      createdDate,
      policyKey,
    } = item;
    return {
      bucketKey,
      createdDate: new Date(createdDate),
      policyKey,
    } satisfies IBucket;
  })
}

async function hasBucket(token: string, bucketKey: string, retry: number = 5): Promise<boolean> {
  const url = `${OSS_URL}/buckets/${bucketKey}/details`;

  while (true) {
    const res = await fetch(url, {
      method: 'GET',
      headers: newHeaders(token),
    });
    const { status } = res;
    if (status === 409) continue;

    if (status === 404) {
      return false;
    }
    if (status === 200) {
      return true;
    }

    if (--retry >= 0) {
      sleep(1000);
      continue;
    }
    throw new Error();
  }
}

async function getBucketDetails(token: string, bucketKey: string): Promise<ResponseBucketDetails> {
  const url = `${OSS_URL}/buckets/${bucketKey}/details`;
  const data = {
    bucketKey,
  };
  const res = await fetch(url, {
    method: 'GET',
    headers: newHeaders(token),
  });
  if (!res.ok) {
    throw res;
  }
  return await res.json();
}

async function newBucket(token: string, bucketKey: string, policyKey: PolicyVal): Promise<ResponseNewBucket> {
  const data = {
    bucketKey,
    access: 'full',
    policyKey,
  };

  const url = `${OSS_URL}/buckets`;
  const res = await fetch(url, {
    method: 'POST',
    headers: newHeaders(token),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const { status } = res;
    if (status >= 400) {
      const { reason } = await res.json();
      console.error('newBucket', {status, reason});
    }
    throw res;
  }

  const json = await res.json();
  const { createdDate } = json;
  return {
    ...json,
    createdDate: new Date(createdDate),
  } satisfies ResponseNewBucket
}

async function deleteBucket(token: string, bucketKey: string): Promise<void> {
  const url = `${OSS_URL}/buckets/${bucketKey}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: newHeaders(token),
  });

  if (!res.ok) {
    throw res;
  }
}

async function getObjects(token: string, bucketKey: string): Promise<IObject[]> {
  const url = `${OSS_URL}/buckets/${bucketKey}/objects`;
  const res = await fetch(url, {
    method: 'GET',
    headers: newHeaders(token),
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

async function getObjectDetails(token: string, bucketKey: string, objectKey: string): Promise<ResponseObjectDetails> {
  const url = `${OSS_URL}/buckets/${bucketKey}/objects/${objectKey}/details`;
  const res = await fetch(url, {
    method: 'GET',
    headers: newHeaders(token),
  });

  if (!res.ok) {
    const { status } = res;
    console.error({ res, url, bucketKey });
    const msg = await res.json();
    throw new Error(`${status}: ${JSON.stringify(msg)}`);
  }
  return await res.json();
}

async function newObject(token: string, bucketKey: string, objectKey: string, blob: Blob): Promise<ResponseUploadObject> {
  const {
    uploadKey,
    urls,
  } = await getSignedS3UploadUrl(token, bucketKey, objectKey);

  if (urls.length !== 1) throw new Error();

  const [ signedUrl ] = urls;
  await uploadToSignedS3Url(signedUrl, blob);

  return await completeUploadObject(token, bucketKey, objectKey, uploadKey);
}

async function getSignedS3UploadUrl(token: string, bucketKey: string, objectKey: string, parts?: number): Promise<ResponseSignedS3UploadUrl> {
  const url = `${OSS_URL}/buckets/${bucketKey}/objects/${objectKey}/signeds3upload${parts != null ? `?parts=${parts}` : ''}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: newHeaders(token),
  });
  if (!res.ok) {
    const { status } = res;
    console.error({ res, url, bucketKey });
    const msg = await res.json();
    throw new Error(`${status}: ${JSON.stringify(msg)}`);
  }
  return await res.json() as ResponseSignedS3UploadUrl;
}

async function uploadToSignedS3Url(signedUrl: string, blob: Blob): Promise<void> {
  const res = await fetch(signedUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Length': blob.size.toString(),
    },
    body: blob,
  });
  if (!res.ok) {
    const { status } = res;
    console.error('upload To signed URL', { res });
    const msg = await res.json();
    throw new Error(`${status}: ${JSON.stringify(msg)}`);
  }
}

async function completeUploadObject(token: string, bucketKey: string, objectKey: string, uploadKey: string): Promise<ResponseUploadObject> {
  const url = `${OSS_URL}/buckets/${bucketKey}/objects/${objectKey}/signeds3upload`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      ...newHeaders(token),
      'x-ads-meta-Content-Type': 'application/octet-stream',
    },
    body: JSON.stringify({uploadKey}),
  });
  if (!res.ok) {
    throw res;
  }
  return await res.json();
}

async function getObjectTemporaryUrl(token: string, bucketKey: string, objectKey: string, access?: SignedResourceAccessVal): Promise<SignedUrls> {
  const url = `${OSS_URL}/buckets/${bucketKey}/objects/${objectKey}/signed${access != null ? `?access=${access}` : ''}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: newHeaders(token),
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

async function deleteObject(token: string, bucketKey: string, objectKey: string): Promise<any> {
  if (!token) {
    throw new Error("token is required.");
  }
  if (!bucketKey || !objectKey) {
    throw new Error("bucket key & object key are required.");
  }

  const url = `${OSS_URL}/buckets/${bucketKey}/objects/${objectKey}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: newHeaders(token),
  });

  if (!res.ok) {
    const { status } = res;
    console.error({ res, url, bucketKey });
    const msg = await res.json();
    throw new Error(`${status}: ${JSON.stringify(msg)}`);
  }
  return await res.json();
}

async function uploadBlobToS3(url: string, formData: any, blob: Blob): Promise<any> {
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
  return await res.json();
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
  toUrn,
  hasBucket,
  getBuckets,
  getBucketDetails,
  newBucket,
  deleteBucket,
  newObject,
  getObjects,
  getObjectTemporaryUrl,
  getObjectDetails,
  deleteObject,
}