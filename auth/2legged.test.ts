import * as dotenv from 'dotenv'

import { describe, expect, test } from 'vitest'
import { getAccessToken } from './2legged';

describe.skip('2Legged auth', () => {
  dotenv.config();

  const apsClientId = process.env.APS_CLIENT_ID ?? '';
  const apsClientSecret = process.env.APS_CLIENT_SECRET ?? '';
  expect(apsClientId, `APS Client Id: ${apsClientId}`).toBeTruthy();
  expect(apsClientSecret, `APS Client Secret: ${apsClientId}`).toBeTruthy();
  
  test('2legged auth', async () => {
    const token = await getAccessToken(apsClientId, apsClientSecret);
    expect(token, `2Legged Access Token: ${token}`).toBeTruthy();
  });
});
