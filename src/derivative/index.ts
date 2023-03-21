import { BASE_URL } from "../../dist"

const DERIVATIVE_BASE_URL = `${BASE_URL}/modelderivative/v2`;

async function translateToSvf2(token: string, inputUrn: string) {
  const url = `${DERIVATIVE_BASE_URL}/designdata/job`

  const data = {
    input: {
      urn: inputUrn,
      rootFilename: "Tuner.iam",
      compressedUrn: true
    },
    output: {
      destination: {
        region: 'us'
      },
    },
    formats: [
      {
        type: 'stl',
        advanced: {
          format : 'binary',
          exportColor: true,
          exportFileStructure: 'single',
        }
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