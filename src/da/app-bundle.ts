import { DA_URL } from ".";
import { Alias } from "../versions";

function getAppBundlesUrl(page?: string): string {
  const url = `${DA_URL}/appbundles`;
  if (page) {
    return url + `?page=${page}`;
  } else {
    return url;
  }
}

async function getAppBundlesPage(list: string[], token: string, page?: string): Promise<string> {
  if (!token) {
    throw new Error("token is required.");
  }

  const url = getAppBundlesUrl(page);
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

async function getAppBundles(token: string): Promise<string[]> {
  if (!token) {
    throw new Error("token is required.");
  }

  const list: string[] = [];
  let page = await getAppBundlesPage(list, token);
  while (page) {
    page = await getAppBundlesPage(list, token, page);
  }
  return list;
}

async function getAppBundleDetails(token: string, id: string) {
  if (!token) {
    throw new Error("token is required.");
  }

  const url = `${DA_URL}/appbundles/${id}`;
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

  const {
    package: pkg,
    uploadParameters,
    id: id1,
    engine,
    appbundles,
    settings,
    description,
    version,
  } = await res.json() as {
    package: string,
    uploadParameters: any,
    id: string,
    engine: string,
    appbundles: string[],
    settings: any,
    description: string,
    version: number,
  };

  if (id === id1) {
    throw new Error(`invalid id: ${id} != ${id1}`);
  }

  console.log({
    pkg,
    uploadParameters,
    id,
    engine,
    appbundles,
    settings,
    description,
    version,
  });
}

async function getAppBundleDetails2(token: string, id: string) {
  if (!token) {
    throw new Error("token is required.");
  }

  const i = id.indexOf('.');
  const j = id.indexOf('+');
  const name = id.substring(i + 1, j);
  const label = id.substring(j + 1);

  const aliases = await getAppBundleAliases(token, name);
  const version = aliases.find(a => a.id === label)?.version;

  if (!version) {
    throw new Error(`${label} is invalid alias.`);
  }
  const result = await getAppBundleDetailsByVersion(token, name, version);
  return result;
}

async function getAppBundleDetailsByVersion(token: string, name: string, version: number) {
  if (!token) {
    throw new Error("token is required.");
  }

  const url = `${DA_URL}/appbundles/${name}/versions/${version}`;
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

  const result = await res.json();
  const { version: version1 } = result;

  if (version !== version1) {
    const msg = `invalid id: ${version} != ${version1}`;
    alert(msg);
    throw new Error(msg);
  }

  return result as {
    package: string,
    uploadParameters: any,
    id: string,
    engine: string,
    appbundles: string[],
    settings: any,
    description: string,
    version: number,
  };
}

function getAppBundleVersionsUrl(name: string, page?: string): string {
  const url = `${DA_URL}/appbundles/${name}/versions`;
  if (page) {
    return `${url}?page=${page}`;
  } else {
    return url;
  }
}

async function getAppBundleVersionsPage(list: number[], token: string, name: string, page?: string): Promise<string> {
  if (!token) {
    throw new Error("token is required.");
  }

  const url = getAppBundleVersionsUrl(name, page);
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

  const { data, paginationToken } = await res.json() as { paginationToken: string, data: number[] };
  list.push(...data);
  return paginationToken;
}


async function getAppBundleVersions(token: string, name: string): Promise<number[]> {
  if (!token) {
    throw new Error("token is required.");
  }

  const list: number[] = [];
  let page = await getAppBundleVersionsPage(list, token, name);
  while (page) {
    page = await getAppBundleVersionsPage(list, token, name, page);
  }
  return list;
}

function getAppBundleAliasUrl(name: string, page?: string): string {
  const url = `${DA_URL}/appbundles/${name}/aliases`;
  if (page) {
    return `${url}?page=${page}`;
  } else {
    return url;
  }
}

async function getAppBundleAliasesPage(list: Alias[], token: string, name: string, page?: string): Promise<string> {
  if (!token) {
    throw new Error("token is required.");
  }

  const url = getAppBundleAliasUrl(name, page);
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
      console.error({ url, res });
      const msg = await res.json();
      throw new Error(`${status}: ${JSON.stringify(msg)}`);
  }

  const { data, paginationToken } = await res.json() as { paginationToken: string, data: Alias[] };
  list.push(...data);
  return paginationToken;
}

async function getAppBundleAliases(token: string, name: string): Promise<Alias[]> {
  if (!token) {
    throw new Error("token is required.");
  }

  const list: Alias[] = [];
  let page = await getAppBundleAliasesPage(list, token, name);
  while (page) {
    page = await getAppBundleAliasesPage(list, token, name, page);
  }
  return list;
}

type NewAppBundleRes = {
  endpointURL: string,
  formData: any,
};

async function newAppBundle(token: string, id: string, engine: string, description: string): Promise<NewAppBundleRes> {
  if (!token) {
    throw new Error("Token is required.");
  }
  if (!id) {
    throw new Error("AppBundle id is required.");
  }
  if (!engine) {
    throw new Error("Engine is required.");
  }

  const url = `${DA_URL}/appbundles`;
  const data = {
    id,
    engine,
    description
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    cache: 'no-cache',
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

  const { uploadParameters } = await res.json();
  return uploadParameters;
}

type NewAppBundleVersionRes = {
  id: string,
  version: number,
  engine: string,
  uploadParameters: {
    endpointURL: string,
    formData: any,
  }
}

async function newAppBundleVersion(token: string, appBundleId: string, engine: string, description: string): Promise<NewAppBundleVersionRes> {
  if (!token) {
    throw new Error("token is required.");
  }
  if (!appBundleId) {
    throw new Error("AppBundle Id is required.");
  }

  const url = `${DA_URL}/appbundles/${appBundleId}/versions`;
  const data = {
    engine,
    description,
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    cache: 'no-cache',
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

  return await res.json();
}

async function newAppBundleAlias(token: string, name: string, version: number, label: string): Promise<void> {
  if (!token) {
    throw new Error("token is required.");
  }

  const data = {
    version: version,
    id: label,
  };
  const url = `${DA_URL}/appbundles/${name}/aliases`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    cache: 'no-cache',
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


async function deleteAppBundle(token: string, name: string): Promise<void> {
  if (!token) {
    throw new Error("token is required.");
  }

  const url = `${DA_URL}/appbundles/${name}`
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    cache: 'no-cache',
  });
  const { status } = res;
  switch (status) {
    case 204:
      break;
    default:
      console.error({ res });
      const msg = await res.json();
      throw new Error(`${status}: ${JSON.stringify(msg)}`);
  }
}

async function deleteAppBundleAlias(token: string, name: string, label: string) {
  if (!token) {
    throw new Error("token is required.");
  }

  const url = `${DA_URL}/appbundles/${name}/aliases/${label}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    cache: 'no-cache',
  });

  const { status } = res;
  switch (status) {
    case 204:
      break;
    default:
      console.error({ res });
      const msg = await res.json();
      throw new Error(`${status}: ${JSON.stringify(msg)}`);
  }
}

async function deleteAppBundleVersion(token: string, name: string, version: number) {
  if (!token) {
    throw new Error("token is required.");
  }

  const url = `${DA_URL}/appbundles/${name}/versions/${version}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    cache: 'no-cache',
  });

  const { status } = res;
  switch (status) {
    case 204:
      break;
    default:
      console.error({ res });
      const msg = await res.json();
      throw new Error(`${status}: ${JSON.stringify(msg)}`);
  }
}

export type {
  NewAppBundleRes,
}

export {
  getAppBundles,
  getAppBundleAliases,
  getAppBundleVersions,

  getAppBundleDetails,
  getAppBundleDetails2,
  getAppBundleDetailsByVersion,

  newAppBundle,
  newAppBundleVersion,
  newAppBundleAlias,

  deleteAppBundle,
  deleteAppBundleAlias,
  deleteAppBundleVersion,
}