import { BASE_URL } from "../index"

const DERIVATIVE_BASE_URL = `${BASE_URL}/modelderivative/v2`;

function encodeUrlSafeBase64(str: string) {
  const base64 = Buffer.from(str).toString('base64'); // Base64エンコード
  const base64Url = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, ''); // URL SafeなBase64に変換
  return base64Url;
}

async function translateToSvf2(token: string, inputUrn: string) {
  const url = `${DERIVATIVE_BASE_URL}/designdata/job`

  const data = {
    input: {
      urn: inputUrn,
    },
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
  };

  console.log('job post', {data});
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'x-ads-force': 'true',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const { status} = res;
    throw new Error(`status: ${status}`);
  }
  const json = await res.json();
  console.log({json});
}

async function translateZipToSvf2(token: string, inputUrn: string, rootFilename: string) {
  const url = `${DERIVATIVE_BASE_URL}/designdata/job`

  const data = {
    input: {
      urn: inputUrn,
      rootFilename: rootFilename,
      compressedUrn: true
    },
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
  };

  console.log('job post', {data});
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'x-ads-force': 'true',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const { status} = res;
    throw new Error(`status: ${status}`);
  }
  const json = await res.json();
  console.log({json});
}

async function fetchManifest(token: string, urlSafeUrnOfSourceFile: string) {
  const url = `${DERIVATIVE_BASE_URL}/designdata/${urlSafeUrnOfSourceFile}/manifest`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return await res.json();
}

export {
  encodeUrlSafeBase64,
  translateToSvf2,
  translateZipToSvf2,
  fetchManifest,
}