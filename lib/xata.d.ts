import type { BaseClientOptions, SchemaInference, XataRecord } from "@xata.io/client";
declare const tables: readonly [{
    readonly name: "SESSION_PUBLIC_KEYS";
    readonly columns: readonly [{
        readonly name: "key";
        readonly type: "string";
    }];
}, {
    readonly name: "users";
    readonly columns: readonly [{
        readonly name: "username";
        readonly type: "string";
        readonly unique: true;
    }, {
        readonly name: "hash";
        readonly type: "string";
    }];
}, {
    readonly name: "friends";
    readonly columns: readonly [{
        readonly name: "user1";
        readonly type: "link";
        readonly link: {
            readonly table: "users";
        };
        readonly unique: true;
    }, {
        readonly name: "user2";
        readonly type: "link";
        readonly link: {
            readonly table: "users";
        };
        readonly unique: true;
    }];
}];
export type SchemaTables = typeof tables;
export type InferredTypes = SchemaInference<SchemaTables>;
export type SessionPublicKeys = InferredTypes["SESSION_PUBLIC_KEYS"];
export type SessionPublicKeysRecord = SessionPublicKeys & XataRecord;
export type Users = InferredTypes["users"];
export type UsersRecord = Users & XataRecord;
export type Friends = InferredTypes["friends"];
export type FriendsRecord = Friends & XataRecord;
export type DatabaseSchema = {
    SESSION_PUBLIC_KEYS: SessionPublicKeysRecord;
    users: UsersRecord;
    friends: FriendsRecord;
};
declare const DatabaseClient: import("@xata.io/client").ClientConstructor<{}>;
export declare class XataClient extends DatabaseClient<DatabaseSchema> {
    constructor(options?: BaseClientOptions);
}
export declare const getXataClient: () => XataClient;
export {};
