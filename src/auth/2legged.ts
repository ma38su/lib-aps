import { BASE_URL } from "../index";

async function getAccessToken(clientId: string, clientSecret: string): Promise<string> {
  if (!clientId || !clientSecret) {
    throw new Error("Client Id & Client Secret are required.");
  }

  const params = new URLSearchParams();
  params.set('client_id', clientId);
  params.set('client_secret', clientSecret);
  params.set('grant_type', 'client_credentials');
  params.set('scope', 'code:all data:write data:read bucket:read bucket:create bucket:delete');

  const url = `${BASE_URL}/authentication/v1/authenticate`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });

  const { status } = res;
  switch (status) {
    case 200:
      break;
    default:
      console.error({ res });
      const msg = await res.json();
      throw new Error(`${status}: ${JSON.stringify(msg)}`);
  }

  const result = await res.json();
  const { access_token: token } = result as { access_token: string };
  return token;
}

export { getAccessToken };