interface VersionCollection {
    versions: number[];
    aliases: Alias[];
}
declare const EMPTY_VERSION_COLLECTION: {
    versions: never[];
    aliases: never[];
};
type Alias = {
    version: number;
    receiver?: string;
    id: string;
};
export type { VersionCollection, Alias };
export { EMPTY_VERSION_COLLECTION };
