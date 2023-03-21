import { BASE_URL } from "../index";
const DA_URL = `${BASE_URL}/da/us-east/v3`;
const DEFAULT_ENGINE = 'Autodesk.Revit+2023';
async function fetchNickname(token) {
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
    const nickname = await res.json();
    return nickname;
}
async function patchNickname(token, nickname) {
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
function getEngineUrl(page) {
    const url = `${DA_URL}/engines`;
    if (page) {
        return `${url}?page=${page}`;
    }
    else {
        return url;
    }
}
async function getEnginePage(list, token, page) {
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
    const { data, paginationToken } = await res.json();
    list.push(...data);
    return paginationToken;
}
async function fetchEngines(token) {
    if (!token) {
        throw new Error("token is required.");
    }
    const list = [];
    let page = await getEnginePage(list, token);
    while (page) {
        page = await getEnginePage(list, token, page);
    }
    return list;
}
async function fetchServiceLimits(token) {
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
    return await res.json();
}
function parseAppName(id) {
    const i = id.indexOf('.');
    const j = id.indexOf('+');
    const name = id.substring(i + 1, j);
    return name;
}
async function deleteNickname(token) {
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
async function fetchShares(token) {
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
export { DA_URL, DEFAULT_ENGINE, fetchNickname, patchNickname, deleteNickname, fetchEngines, fetchServiceLimits, fetchShares, parseAppName, };
