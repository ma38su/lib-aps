import { BASE_URL } from "../index"
import { sleep } from "../test";

const DERIVATIVE_BASE_URL = `${BASE_URL}/modelderivative/v2`;

type ResponseTranslate = {
  result: 'success' | 'created' | string,
  urn: string,
  acceptedJobs: {
    output: TranslateOutput,
  }[],
};

type TranslateInput = TranslateInputCompressed | TranslateInputNoCompressed;

type TranslateInputNoCompressed = {
  urn: string,
  compressedUrn?: false,
}

type TranslateInputCompressed = {
  urn: string,
  rootFilename: string,
  compressedUrn: true,
}

type TranslateOutput = {
  destination?: {
    region: 'us' | 'emea' | 'US' | 'EMEA',
  },
  formats: {
    type: 'dwg' | 'fbx' | 'ifc' | 'iges' | 'obj' | 'step' | 'stl' | 'svf' | 'svf2' | 'thumbnail'
    views: ('2d' | '3d')[],
    advanced?: any,
  }[],
}

type TranslateJobRequestBody = {
  input: TranslateInput,
  output: TranslateOutput,
  misc?: any,
}

type JobStatus = 'pending' | 'success' | 'inprogress' | 'failed' | 'timeout';

type ResponseManifest = {
  urn: string,
  hasThumbnail: 'false' | 'true' | boolean,
  progress: 'complate' | string, // '(\d)+% complete',
  type: 'manifest' | string,
  region: 'US' | 'EMEA' | 'us' | 'emea',
  version: '1.0' | string,
  derivatives: {
    name: string,
    hasThumbnail: boolean,
    outputType: 'dwg' | 'fbx' | 'ifc' | 'iges' | 'obj' | 'step' | 'stl' | 'svf' | 'svf2' | 'thumbnail',
    status: JobStatus,
    progress: string,
    children: {
      guid: string,
      role: string,
      type?: string,
      urn: string,
      mime: string,
    }[],
  }[],
  status: JobStatus,
}

function encodeUrlSafeBase64(str: string) {
  const base64 = Buffer.from(str).toString('base64'); // Base64エンコード
  const base64Url = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, ''); // URL SafeなBase64に変換
  return base64Url;
}

async function translate(token: string, job: TranslateJobRequestBody): Promise<ResponseTranslate> {
  const url = `${DERIVATIVE_BASE_URL}/designdata/job`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'x-ads-force': 'true',
    },
    body: JSON.stringify(job),
  });
  if (!res.ok) {
    const { status } = res;
    if (status === 400) {
      const { diagnostic } = await res.json();
      console.error('translateZipToSvf2', { status, diagnostic});
    }
    throw res;
  }
  return await res.json();
}

async function translateToSvf2(token: string, input: TranslateInput): Promise<ResponseTranslate> {
  return await translate(token, {
    input,
    output: {
      formats: [
        {
          type: 'svf2',
          views: [
            "2d",
            "3d"
          ]
        }
      ],
    },
  } satisfies TranslateJobRequestBody);
}

async function fetchManifest(token: string, urlSafeUrnOfSourceFile: string): Promise<ResponseManifest> {
  const url = `${DERIVATIVE_BASE_URL}/designdata/${urlSafeUrnOfSourceFile}/manifest`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return await res.json();
}

async function waitForTranslate(token: string, urn: string): Promise<'success' | 'failed' | 'timeout'> {
  while (true) {
    const manifest = await fetchManifest(token, urn);
    const { status, progress } = manifest;
    console.debug({status, progress});
    if (status !== 'inprogress' && status !== 'pending') {
      return status;
    }
    await sleep(15000);
  }
}

export {
  encodeUrlSafeBase64,
  translate,
  translateToSvf2,
  fetchManifest,
  waitForTranslate,
}