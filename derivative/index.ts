import { BASE_URL } from "../index"

const DERIVATIVE_BASE_URL = `${BASE_URL}/modelderivative/v2`;

async function translateZipToSvf2(token: string, inputUrn: string, rootFilename: string) {
  const url = `${DERIVATIVE_BASE_URL}/designdata/job`

  const data = {
    input: {
      urn: inputUrn,
      rootFilename: rootFilename,
      compressedUrn: true
    },
    output: {
      destination: {
        region: 'us'
      },
    },
    formats: [
      {
        type: 'svf',
        views: [
          "2d",
          "3d"
        ]
      },
      {
        type: 'svf2',
        views: [
          "2d",
          "3d"
        ]
      }
    ],
  };

  await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
}

async function fetchManifest(token: string, urlSafeUrnOfSourceFile: string) {
  const url = `${DERIVATIVE_BASE_URL}/designdata/${urlSafeUrnOfSourceFile}/manifest`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export { translateZipToSvf2, fetchManifest }