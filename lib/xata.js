// Generated by Xata Codegen 0.23.5. Please do not edit.
import { buildClient } from "@xata.io/client";
const tables = [
    { name: "SESSION_PUBLIC_KEYS", columns: [{ name: "key", type: "string" }] },
    {
        name: "users",
        columns: [
            { name: "username", type: "string", unique: true },
            { name: "hash", type: "string" },
        ],
    },
    {
        name: "friends",
        columns: [
            { name: "user1", type: "link", link: { table: "users" }, unique: true },
            { name: "user2", type: "link", link: { table: "users" }, unique: true },
        ],
    },
];
const DatabaseClient = buildClient();
const defaultOptions = {
    databaseURL: "https://shr4pnel-s-workspace-vkimoc.eu-west-1.xata.sh/db/shr4pneljs",
};
export class XataClient extends DatabaseClient {
    constructor(options) {
        super({ ...defaultOptions, ...options }, tables);
    }
}
let instance = undefined;
export const getXataClient = () => {
    if (instance)
        return instance;
    instance = new XataClient();
    return instance;
};