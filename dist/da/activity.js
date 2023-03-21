import { DA_URL } from "./index";
function getActivitesUrl(page) {
    const url = `${DA_URL}/activities`;
    if (page) {
        return `${url}?page=${page}`;
    }
    else {
        return url;
    }
}
async function getActivitesPage(list, token, page) {
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
    const { data, paginationToken } = await res.json();
    list.push(...data);
    return paginationToken;
}
async function getActivites(token) {
    if (!token) {
        throw new Error("token is required.");
    }
    const list = [];
    let page = await getActivitesPage(list, token);
    while (page) {
        page = await getActivitesPage(list, token, page);
    }
    return list;
}
// alias is required.
async function getActivityDetails(token, id) {
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
async function getActivityDetailsByVersion(token, name, version) {
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
function getActivityVersionsUrl(name, page) {
    const url = `${DA_URL}/activities/${name}/versions`;
    if (page) {
        return `${url}?page=${page}`;
    }
    else {
        return url;
    }
}
async function getActivityVersionsPage(list, token, name, page) {
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
    const { data, paginationToken } = await res.json();
    list.push(...data);
    return paginationToken;
}
async function getActivityVersions(token, name) {
    if (!token) {
        throw new Error("token is required.");
    }
    const list = [];
    let page = await getActivityVersionsPage(list, token, name);
    while (page) {
        page = await getActivityVersionsPage(list, token, name, page);
    }
    return list;
}
function getActivityAliasesUrl(name, page) {
    const url = `${DA_URL}/activities/${name}/aliases`;
    if (page) {
        return `${url}?page=${page}`;
    }
    else {
        return url;
    }
}
async function getActivityAliasesPage(list, token, name, page) {
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
    const { data, paginationToken } = await res.json();
    list.push(...data);
    return paginationToken;
}
async function getActivityAliases(token, name) {
    if (!token) {
        throw new Error("token is required.");
    }
    const list = [];
    let page = await getActivityAliasesPage(list, token, name);
    while (page) {
        page = await getActivityAliasesPage(list, token, name, page);
    }
    return list;
}
function newActivityDataForLayoutGenerator(activityName, appbundle, engine, command, description) {
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
    };
    return data;
}
async function newActivity(token, data) {
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
async function newActivityAlias(token, name, version, label) {
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
async function newActivityVersion(token, activityId, data) {
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
async function deleteActivity(token, name) {
    if (!token) {
        throw new Error("token is required.");
    }
    const url = `${DA_URL}/activities/${name}`;
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
async function deleteActivityAlias(token, name, label) {
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
async function deleteActivityVersion(token, name, version) {
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
export { getActivites, getActivityAliases, getActivityVersions, getActivityDetails, getActivityDetailsByVersion, newActivity, newActivityVersion, newActivityAlias, newActivityDataForLayoutGenerator, deleteActivity, deleteActivityVersion, deleteActivityAlias, };
