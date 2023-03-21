import { BASE_URL } from "..";
import { getActivites } from "./activity";
import { getAppBundles } from "./app-bundle";
import { WorkItemEntry } from "./work-item";
import { getBuckets, IBucket } from "../oss";
import { Alias } from "../versions";

const DA_URL = `${BASE_URL}/da/us-east/v3`;

interface ForgeConfig {
  token: string,
  appBundles: string[],
  activities: string[],
  workItems: WorkItemEntry[],
  nickname: string,
  engines: string[],
  buckets: IBucket[],
};

async function fetchApsConfig(token: string, config: ForgeConfig): Promise<ForgeConfig> {
  const [nickname, engines, appBundles, activities, buckets] = await Promise.all([
    getNickname(token),
    getEngines(token),
    getAppBundles(token),
    getActivites(token),
    getBuckets(token),
  ]);

  return {
    ...config,
    token,
    nickname,
    engines,
    appBundles,
    activities,
    buckets,
  }
}

async function getNickname(token: string): Promise<string> {
  if (!token) {
    throw new Error("token is required.");
  }

  const url = `${DA_URL}/forgeapps/me`;
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
      console.error({ res });
      const msg = await res.json();
      throw new Error(`${status}: ${JSON.stringify(msg)}`);
  }

  const nickname = await res.json() as string;
  return nickname;
}

async function setNickname(token: string, nickname: string): Promise<void> {
  if (!token) {
    throw new Error("token is required.");
  }
  if (!nickname) {
    throw new Error("nickname is required.");
  }

  const url = `${DA_URL}/forgeapps/me`;
  const data = {
    nickname,
  };
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
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
}

function getEngineUrl(page?: string): string {
  const url = `${DA_URL}/engines`;
  if (page) {
    return `${url}?page=${page}`;
  } else {
    return url;
  }
}

async function getEnginePage(list: string[], token: string, page?: string) {
  if (!token) {
    throw new Error("token is required.");
  }

  const url = getEngineUrl(page);
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
      console.error({ res });
      const msg = await res.json();
      throw new Error(`${status}: ${JSON.stringify(msg)}`);
  }

  const { data, paginationToken } = await res.json() as { paginationToken: string, data: string[] };
  list.push(...data);
  return paginationToken;
}

async function getEngines(token: string) {
  if (!token) {
    throw new Error("token is required.");
  }

  const list: string[] = [];
  let page = await getEnginePage(list, token);
  while (page) {
    page = await getEnginePage(list, token, page);
  }
  return list;
}

async function getServiceLimits(token: string) {
  if (!token) {
    throw new Error("token is required.");
  }

  const url = `${DA_URL}/servicelimits/me`;
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
      console.error({ res });
      const msg = await res.json();
      throw new Error(`${status}: ${JSON.stringify(msg)}`);
  }

  return await res.json() as { frontendLimits: any, backendLimits: any };
}

function pickAppName(id: string) {
  const i = id.indexOf('.');
  const j = id.indexOf('+');
  const name = id.substring(i + 1, j);
  return name;
}

async function deleteNickname(token: string): Promise<void> {
  if (!token) {
    throw new Error("token is required.");
  }

  const url = `${DA_URL}/forgeapps/me`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    cache: 'no-cache',
  });
  const { status } = res;
  switch (status) {
    case 200:
    case 204:
      break;
    default:
      console.error({ res });
      const msg = await res.json();
      throw new Error(`${status}: ${JSON.stringify(msg)}`);
  }
}

async function uploadZipToS3(url: string, formData: any, file: File) {
  const fd = new FormData();
  for (const [key, value] of Object.entries(formData)) {
    fd.set(key, value as string);
  }
  fd.set('file', file);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Cache-Control': 'no-cache',
    },
    body: fd,
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
}

async function getShares(token: string) {
  const url = `${DA_URL}/shares`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    },
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
}

export type {
  Alias,
  ForgeConfig,
};
export {
  getNickname as fetchNickname,
  setNickname,
  deleteNickname,

  getEngines as fetchEngines,
  getServiceLimits,
  getShares,

  uploadZipToS3,

  pickAppName,

  DA_URL,
};
