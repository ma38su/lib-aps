"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAppBundleVersion = exports.deleteAppBundleAlias = exports.deleteAppBundle = exports.newAppBundleAlias = exports.newAppBundleVersion = exports.newAppBundle = exports.getAppBundleDetailsByVersion = exports.getAppBundleDetails2 = exports.getAppBundleDetails = exports.getAppBundleVersions = exports.getAppBundleAliases = exports.getAppBundles = void 0;
const index_1 = require("./index");
function getAppBundlesUrl(page) {
    const url = `${index_1.DA_URL}/appbundles`;
    if (page) {
        return url + `?page=${page}`;
    }
    else {
        return url;
    }
}
async function getAppBundlesPage(list, token, page) {
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
    const { data, paginationToken } = await res.json();
    list.push(...data);
    return paginationToken;
}
async function getAppBundles(token) {
    if (!token) {
        throw new Error("token is required.");
    }
    const list = [];
    let page = await getAppBundlesPage(list, token);
    while (page) {
        page = await getAppBundlesPage(list, token, page);
    }
    return list;
}
exports.getAppBundles = getAppBundles;
async function getAppBundleDetails(token, id) {
    if (!token) {
        throw new Error("token is required.");
    }
    const url = `${index_1.DA_URL}/appbundles/${id}`;
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
    const { package: pkg, uploadParameters, id: id1, engine, appbundles, settings, description, version, } = await res.json();
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
exports.getAppBundleDetails = getAppBundleDetails;
async function getAppBundleDetails2(token, id) {
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
exports.getAppBundleDetails2 = getAppBundleDetails2;
async function getAppBundleDetailsByVersion(token, name, version) {
    if (!token) {
        throw new Error("token is required.");
    }
    const url = `${index_1.DA_URL}/appbundles/${name}/versions/${version}`;
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
    return result;
}
exports.getAppBundleDetailsByVersion = getAppBundleDetailsByVersion;
function getAppBundleVersionsUrl(name, page) {
    const url = `${index_1.DA_URL}/appbundles/${name}/versions`;
    if (page) {
        return `${url}?page=${page}`;
    }
    else {
        return url;
    }
}
async function getAppBundleVersionsPage(list, token, name, page) {
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
    const { data, paginationToken } = await res.json();
    list.push(...data);
    return paginationToken;
}
async function getAppBundleVersions(token, name) {
    if (!token) {
        throw new Error("token is required.");
    }
    const list = [];
    let page = await getAppBundleVersionsPage(list, token, name);
    while (page) {
        page = await getAppBundleVersionsPage(list, token, name, page);
    }
    return list;
}
exports.getAppBundleVersions = getAppBundleVersions;
function getAppBundleAliasUrl(name, page) {
    const url = `${index_1.DA_URL}/appbundles/${name}/aliases`;
    if (page) {
        return `${url}?page=${page}`;
    }
    else {
        return url;
    }
}
async function getAppBundleAliasesPage(list, token, name, page) {
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
    const { data, paginationToken } = await res.json();
    list.push(...data);
    return paginationToken;
}
async function getAppBundleAliases(token, name) {
    if (!token) {
        throw new Error("token is required.");
    }
    const list = [];
    let page = await getAppBundleAliasesPage(list, token, name);
    while (page) {
        page = await getAppBundleAliasesPage(list, token, name, page);
    }
    return list;
}
exports.getAppBundleAliases = getAppBundleAliases;
async function newAppBundle(token, id, engine, description) {
    if (!token) {
        throw new Error("Token is required.");
    }
    if (!id) {
        throw new Error("AppBundle id is required.");
    }
    if (!engine) {
        throw new Error("Engine is required.");
    }
    const url = `${index_1.DA_URL}/appbundles`;
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
exports.newAppBundle = newAppBundle;
async function newAppBundleVersion(token, appBundleId, engine, description) {
    if (!token) {
        throw new Error("token is required.");
    }
    if (!appBundleId) {
        throw new Error("AppBundle Id is required.");
    }
    const url = `${index_1.DA_URL}/appbundles/${appBundleId}/versions`;
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
exports.newAppBundleVersion = newAppBundleVersion;
async function newAppBundleAlias(token, name, version, label) {
    if (!token) {
        throw new Error("token is required.");
    }
    const data = {
        version: version,
        id: label,
    };
    const url = `${index_1.DA_URL}/appbundles/${name}/aliases`;
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
exports.newAppBundleAlias = newAppBundleAlias;
async function deleteAppBundle(token, name) {
    if (!token) {
        throw new Error("token is required.");
    }
    const url = `${index_1.DA_URL}/appbundles/${name}`;
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
exports.deleteAppBundle = deleteAppBundle;
async function deleteAppBundleAlias(token, name, label) {
    if (!token) {
        throw new Error("token is required.");
    }
    const url = `${index_1.DA_URL}/appbundles/${name}/aliases/${label}`;
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
exports.deleteAppBundleAlias = deleteAppBundleAlias;
async function deleteAppBundleVersion(token, name, version) {
    if (!token) {
        throw new Error("token is required.");
    }
    const url = `${index_1.DA_URL}/appbundles/${name}/versions/${version}`;
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
exports.deleteAppBundleVersion = deleteAppBundleVersion;
