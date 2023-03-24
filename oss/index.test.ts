import * as dotenv from 'dotenv'
import { describe, expect, test,  } from 'vitest'
import { deleteBucket, getBucketDetails, getObjectDetails, hasBucket, newBucket, newObject } from '.';

import { getAccessToken } from '../auth/2legged';
import { sleep } from '../test';

import * as fs from 'fs';
import { encodeUrlSafeBase64, fetchManifest, translateToSvf2, waitForTranslate } from '../derivative';

describe('OSS', async () => {
  dotenv.config();

  const apsClientId = process.env.APS_CLIENT_ID ?? '';
  const apsClientSecret = process.env.APS_CLIENT_SECRET ?? '';
  expect(apsClientId, `APS Client Id: ${apsClientId}`).toBeTruthy();
  expect(apsClientSecret, `APS Client Secret: ${apsClientId}`).toBeTruthy();

  const token = await getAccessToken(apsClientId, apsClientSecret);
  expect(token, `2Legged Access Token: ${token}`).toBeTruthy();

  test('OSS', async () => {
    const testBucketKey = 'fujiwara_test';
    while (await hasBucket(token, testBucketKey)) {
      try {
        await deleteBucket(token, testBucketKey);
        await sleep(1000);
      } catch (e: unknown) {
        const { status } = e as any;
        console.warn('delete bucket exception', { status });
        expect(status === 409 || status === 404);
        await sleep(1000);
      }
    }

    let retry = 5;
    while (retry > 0) {
      try {
        const testBucket = await newBucket(token, testBucketKey, 'transient');
        const { permissions: [{ access }] } = testBucket;
        expect(access).toBe('full');
        break;
      } catch (e: unknown) {
        const eRes = e as any;
        const { status } = eRes;
        console.warn('new bucket exception', { status });
        expect(status).toBe(409);

        await sleep(1000);
        retry -= 1;
      }
    }

    {
      const details = await getBucketDetails(token, testBucketKey);
      const { bucketKey: resBucketKey, policyKey, permissions: [{access}] } = details;
      expect(resBucketKey).toBe(testBucketKey);
      expect(policyKey).toBe('transient');
      expect(access).toBe('full');
    }

    const objectPath = './resources/output.zip';
    const data = fs.readFileSync(objectPath);
    const fileBlob = new Blob([data]);
    const objectKey = objectPath.substring(objectPath.lastIndexOf('/') + 1);

    const { objectKey: resObjectKey, objectId } = await newObject(token, testBucketKey, objectKey, fileBlob);
    expect(resObjectKey).toBe(objectKey);

    {
      const { objectKey: resObjectKey } = await getObjectDetails(token, testBucketKey, objectKey);
      expect(resObjectKey).toBe(objectKey);
    }
    
    const urn = encodeUrlSafeBase64(objectId);

    try {
      const res = await translateToSvf2(token, {
        urn,
        rootFilename: 'result2.rvt',
        compressedUrn: true,
      });

      const { result } = res;
      if (result !== 'success') {
        throw res;
      }

      const status = await waitForTranslate(token, urn);
      expect(status).toBe('success');

    } catch (e: unknown) {
      const { status } = e as any;
      console.error('catch translate', { status });
      expect(false).toBeTruthy();
    }
  }, 300_000);
});
