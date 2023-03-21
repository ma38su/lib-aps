interface VersionCollection {
  versions: number[],
  aliases: Alias[],
};

const EMPTY_VERSION_COLLECTION = { versions: [], aliases: [] };

type Alias = {
  version: number,
  receiver?: string,
  id: string,
};

export type { VersionCollection, Alias };
export { EMPTY_VERSION_COLLECTION };