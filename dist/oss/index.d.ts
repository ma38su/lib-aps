type PolicyVal = 'transient' | 'temporary' | 'persistent';
declare const POLICY_LIST: PolicyVal[];
/** default value is 'read'. */
type AccessVal = 'read' | 'write' | 'readwrite';
type IBucket = {
    bucketKey: string;
    createdDate: Date;
    policyKey: string;
};
type IObject = {
    bucketKey: string;
    objectId: string;
    objectKey: string;
    sha1: string;
    size: number;
    location: string;
    next: string;
};
type SignedUrls = {
    signedUrl: string;
};
declare function castPolicyVal(val: string): PolicyVal;
declare function getBuckets(token: string): Promise<IBucket[]>;
declare function newBucket(token: string, bucketKey: string, policyKey: PolicyVal): Promise<any>;
declare function deleteBucket(token: string, bucketKey: string): Promise<void>;
declare function getObjects(token: string, bucketKey: string): Promise<IObject[]>;
declare function getObjectDetails(token: string, bucketKey: string, objectKey: string): Promise<any>;
declare function getObjectTemporaryUrl(token: string, bucketKey: string, objectKey: string, access?: AccessVal): Promise<SignedUrls>;
declare function toUrn(bucketKey: string, objectKey: string): string;
declare function deleteObject(token: string, bucketKey: string, objectKey: string): Promise<void>;
declare function uploadBlobToS3(url: string, formData: any, blob: Blob): Promise<void>;
export type { IBucket, IObject, PolicyVal, };
export { POLICY_LIST, castPolicyVal, uploadBlobToS3, getBuckets, newBucket, deleteBucket, toUrn, getObjects, getObjectTemporaryUrl, getObjectDetails, deleteObject, };
