declare const DA_URL: string;
declare const DEFAULT_ENGINE = "Autodesk.Revit+2023";
declare function fetchNickname(token: string): Promise<string>;
declare function patchNickname(token: string, nickname: string): Promise<void>;
declare function fetchEngines(token: string): Promise<string[]>;
declare function fetchServiceLimits(token: string): Promise<{
    frontendLimits: any;
    backendLimits: any;
}>;
declare function parseAppName(id: string): string;
declare function deleteNickname(token: string): Promise<void>;
declare function fetchShares(token: string): Promise<void>;
export { DA_URL, DEFAULT_ENGINE, fetchNickname, patchNickname, deleteNickname, fetchEngines, fetchServiceLimits, fetchShares, parseAppName, };
