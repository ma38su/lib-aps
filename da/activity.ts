import { Alias, DA_URL, pickAppName } from ".";

type NewActivityBody = {
  /** Activity Id */
  id: string | null,
  commandLine: string[],
  engine: string,
  appbundles: string[],
  description: string,
  parameters: ActivityParameters,
}

type ActivityParameters = { [key: string]: ActivityParameter }

type ActivityParameter = {
  // default: false,
  zip: boolean,
  localName: string,
  // default: false,
  ondemand: boolean,
  verb: 'get' | 'head' | 'put' | 'post' | 'patch' | 'read',
  description: string,
  // default: false,
  required: boolean,
}

type NewActivityVersionRes = {
  appbundles: string[],
  commandLine: string[],
  description: string,
  engine: string,
  id: string,
  version: number,
  parameters: {
    [key: string]: {
      description: string,
      localName: string,
      required: boolean,
      verb: 'get' | 'put',
      zip?: boolean
    },
  }
}

function getActivitesUrl(page?: string) {
  const url = `${DA_URL}/activities`;
  if (page) {
    return `${url}?page=${page}`;
  } else {
    return url;
  }
}

async function getActivitesPage(list: string[], token: string, page?: string) {
  if (!token) {
    throw new Error("token is required.");
  }

  const url = getActivitesUrl(page);
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    }
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

  const { data, paginationToken } = await res.json() as { data: string[], paginationToken: string };
  list.push(...data);
  return paginationToken;
}

async function getActivites(token: string) {
  if (!token) {
    throw new Error("token is required.");
  }

  const list: string[] = [];
  let page = await getActivitesPage(list, token);
  while (page) {
    page = await getActivitesPage(list, token, page);
  }
  return list;
}

// alias is required.
async function getActivityDetails(token: string, id: string) {
  const url = `${DA_URL}/activities/${id}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    }
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
  console.log('getActivityDetails', { result });
}

async function getActivityDetailsByVersion(token: string, name: string, version: number) {
  const url = `${DA_URL}/activities/${name}/versions/${version}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    }
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
  return result;
}

function getActivityVersionsUrl(name: string, page?: string) {
  const url = `${DA_URL}/activities/${name}/versions`;
  if (page) {
    return `${url}?page=${page}`;
  } else {
    return url;
  }
}

async function getActivityVersionsPage(list: number[], token: string, name: string, page?: string): Promise<string> {
  if (!token) {
    throw new Error("token is required.");
  }

  const url = getActivityVersionsUrl(name, page);
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    }
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

  const { data, paginationToken } = await res.json() as { data: number[], paginationToken: string };
  list.push(...data);
  return paginationToken;
}

async function getActivityVersions(token: string, name: string): Promise<number[]> {
  if (!token) {
    throw new Error("token is required.");
  }

  const list: number[] = [];
  let page = await getActivityVersionsPage(list, token, name);
  while (page) {
    page = await getActivityVersionsPage(list, token, name, page);
  }
  return list;
}


function getActivityAliasesUrl(name: string, page?: string) {
  const url = `${DA_URL}/activities/${name}/aliases`;
  if (page) {
    return `${url}?page=${page}`;
  } else {
    return url;
  }
}

async function getActivityAliasesPage(list: Alias[], token: string, name: string, page?: string): Promise<string> {
  if (!token) {
    throw new Error("token is required.");
  }

  const url = getActivityAliasesUrl(name, page);
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    }
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

  const { data, paginationToken } = await res.json() as { data: Alias[], paginationToken: string };
  list.push(...data);
  return paginationToken;
}

async function getActivityAliases(token: string, name: string): Promise<Alias[]> {
  if (!token) {
    throw new Error("token is required.");
  }

  const list: Alias[] = [];
  let page = await getActivityAliasesPage(list, token, name);
  while (page) {
    page = await getActivityAliasesPage(list, token, name, page);
  }
  return list;
}

function newActivityDataForLayoutGenerator(activityName: string | null, appbundle: string, engine: string, command: string, description: string): NewActivityBody {
  // command = `$(engine.path)\\revitcoreconsole.exe /i "$(args[rvtFile].path)" /al "$(appbundles[${appName}].path)"`;

  const data = {
    id: activityName,
    commandLine: [command],
    engine,
    appbundles: [appbundle],
    description,
    parameters: {
      rvtFile: {
        zip: false,
        ondemand: false,
        verb: 'get',
        description: 'Input Revit template model',
        required: true,
        localName: "$(rvtFile)",
      },
      unitFile: {
        zip: false,
        ondemand: false,
        verb: 'get',
        description: 'Input Revit unit model',
        required: true,
        localName: "unit.rvt",
      },
      jsonFile: {
        zip: false,
        ondemand: false,
        verb: 'get',
        description: 'Input Json',
        required: true,
        localName: "layout.json",
      },
      result: {
        zip: true,
        ondemand: false,
        verb: 'put',
        description: 'Results',
        required: true,
        localName: 'output',
      },
    },
  } satisfies NewActivityBody
  return data;
}

async function newActivity(token: string, data: NewActivityBody): Promise<void> {
  if (!token) {
    throw new Error("token is required.");
  }

  const url = `${DA_URL}/activities`;
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
      console.log({ res, data });
      const msg = await res.json();
      throw new Error(`${status}: ${JSON.stringify(msg)}`);
  }
}


async function newActivityAlias(token: string, name: string, version: number, label: string): Promise<void> {
  if (!token) {
    throw new Error("token is required.");
  }
  if (!name) {
    throw new Error("ActivityId is required.");
  }
  if (!label) {
    throw new Error("label is required.");
  }

  const data = {
    version: version,
    id: label,
  };
  const url = `${DA_URL}/activities/${name}/aliases`;
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

async function newActivityVersion(token: string, activityId: string, data: NewActivityBody): Promise<NewActivityVersionRes> {
  
  if (!token) {
    throw new Error("token is required.");
  }

  const url = `${DA_URL}/activities/${activityId}/versions`;
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

async function deleteActivity(token: string, name: string) {
  if (!token) {
    throw new Error("token is required.");
  }

  const url = `${DA_URL}/activities/${name}`
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
      console.error({ res, url });
      const msg = await res.json();
      throw new Error(`${status}: ${JSON.stringify(msg)}`);
  }
}

async function deleteActivityAlias(token: string, name: string, label: string) {
  if (!token) {
    throw new Error("token is required.");
  }

  const url = `${DA_URL}/activities/${name}/aliases/${label}`;
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

async function deleteActivityVersion(token: string, name: string, version: number) {
  if (!token) {
    throw new Error("token is required.");
  }

  const url = `${DA_URL}/activities/${name}/versions/${version}`;
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
  NewActivityBody,
  ActivityParameters,
  ActivityParameter,
  NewActivityVersionRes,
}

export {
  getActivites,
  getActivityAliases,
  getActivityVersions,

  getActivityDetails,
  getActivityDetailsByVersion,

  newActivity,
  newActivityVersion,
  newActivityAlias,

  newActivityDataForLayoutGenerator,

  deleteActivity,
  deleteActivityVersion,
  deleteActivityAlias,
}