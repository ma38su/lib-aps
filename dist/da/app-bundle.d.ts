import { Alias } from "../versions";
declare function getAppBundles(token: string): Promise<string[]>;
declare function getAppBundleDetails(token: string, id: string): Promise<void>;
declare function getAppBundleDetails2(token: string, id: string): Promise<{
    package: string;
    uploadParameters: any;
    id: string;
    engine: string;
    appbundles: string[];
    settings: any;
    description: string;
    version: number;
}>;
declare function getAppBundleDetailsByVersion(token: string, name: string, version: number): Promise<{
    package: string;
    uploadParameters: any;
    id: string;
    engine: string;
    appbundles: string[];
    settings: any;
    description: string;
    version: number;
}>;
declare function getAppBundleVersions(token: string, name: string): Promise<number[]>;
declare function getAppBundleAliases(token: string, name: string): Promise<Alias[]>;
type NewAppBundleRes = {
    endpointURL: string;
    formData: any;
};
declare function newAppBundle(token: string, id: string, engine: string, description: string): Promise<NewAppBundleRes>;
type NewAppBundleVersionRes = {
    id: string;
    version: number;
    engine: string;
    uploadParameters: {
        endpointURL: string;
        formData: any;
    };
};
declare function newAppBundleVersion(token: string, appBundleId: string, engine: string, description: string): Promise<NewAppBundleVersionRes>;
declare function newAppBundleAlias(token: string, name: string, version: number, label: string): Promise<void>;
declare function deleteAppBundle(token: string, name: string): Promise<void>;
declare function deleteAppBundleAlias(token: string, name: string, label: string): Promise<void>;
declare function deleteAppBundleVersion(token: string, name: string, version: number): Promise<void>;
export type { NewAppBundleRes, };
export { getAppBundles, getAppBundleAliases, getAppBundleVersions, getAppBundleDetails, getAppBundleDetails2, getAppBundleDetailsByVersion, newAppBundle, newAppBundleVersion, newAppBundleAlias, deleteAppBundle, deleteAppBundleAlias, deleteAppBundleVersion, };
