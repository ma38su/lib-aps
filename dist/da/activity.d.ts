import { Alias } from "../versions";
type NewActivityBody = {
    /** Activity Id */
    id: string | null;
    commandLine: string[];
    engine: string;
    appbundles: string[];
    description: string;
    parameters: ActivityParameters;
};
type ActivityParameters = {
    [key: string]: ActivityParameter;
};
type ActivityParameter = {
    zip: boolean;
    localName: string;
    ondemand: boolean;
    verb: 'get' | 'head' | 'put' | 'post' | 'patch' | 'read';
    description: string;
    required: boolean;
};
type NewActivityVersionRes = {
    appbundles: string[];
    commandLine: string[];
    description: string;
    engine: string;
    id: string;
    version: number;
    parameters: {
        [key: string]: {
            description: string;
            localName: string;
            required: boolean;
            verb: 'get' | 'put';
            zip?: boolean;
        };
    };
};
declare function getActivites(token: string): Promise<string[]>;
declare function getActivityDetails(token: string, id: string): Promise<void>;
declare function getActivityDetailsByVersion(token: string, name: string, version: number): Promise<any>;
declare function getActivityVersions(token: string, name: string): Promise<number[]>;
declare function getActivityAliases(token: string, name: string): Promise<Alias[]>;
declare function newActivityDataForLayoutGenerator(activityName: string | null, appbundle: string, engine: string, command: string, description: string): NewActivityBody;
declare function newActivity(token: string, data: NewActivityBody): Promise<void>;
declare function newActivityAlias(token: string, name: string, version: number, label: string): Promise<void>;
declare function newActivityVersion(token: string, activityId: string, data: NewActivityBody): Promise<NewActivityVersionRes>;
declare function deleteActivity(token: string, name: string): Promise<void>;
declare function deleteActivityAlias(token: string, name: string, label: string): Promise<void>;
declare function deleteActivityVersion(token: string, name: string, version: number): Promise<void>;
export type { NewActivityBody, ActivityParameters, ActivityParameter, NewActivityVersionRes, };
export { getActivites, getActivityAliases, getActivityVersions, getActivityDetails, getActivityDetailsByVersion, newActivity, newActivityVersion, newActivityAlias, newActivityDataForLayoutGenerator, deleteActivity, deleteActivityVersion, deleteActivityAlias, };
