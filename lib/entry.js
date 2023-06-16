// shr4pnel.js entrypoint
// im where stuff runs!!
// implementation of x25519 ECDH
// (the easy bits)
// 14/06/23
import express from "express";
import cors from "cors";
import session from "express-session";
import path from "path";
import { cwd } from "process";
import { getXataClient } from "./xata.js";
import { hash, compare } from "bcrypt";
import { createClient } from "redis";
import RedisStore from "connect-redis";
const saltRounds = 10;
let redisClient = createClient();
redisClient
    .connect()
    .then(() => {
    console.log("connected to redis-server");
})
    .catch((err) => {
    console.error(err);
});
// fucking piece of shit fuck you typescript this shit works fine fuck you
// @ts-ignore
let redisStore = new RedisStore({
    // @ts-ignore
    client: redisClient,
    prefix: "shr4pnel:"
});
const app = express();
// @ts-ignore
const xata = getXataClient({ apiKey: process.env.XATA_API_KEY });
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: process.env.EXPRESS_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        sameSite: "strict",
        secure: false
    },
    store: redisStore
}));
app.use("/static", express.static(path.join(cwd(), "src/static")));
async function userExists(username) {
    try {
        let exists = await xata
            .db["users"]
            .select(["username", "id"])
            .filter({ username })
            .getFirst();
        return Boolean(exists);
    }
    catch {
        return false;
    }
}
async function getUID(username) {
    try {
        let uidQuery = await xata
            .db["users"]
            .select(["id"])
            .filter({ username })
            .getFirst();
        if (!uidQuery) {
            return "";
        }
        return uidQuery.id;
    }
    catch {
        return "";
    }
}
async function checkIfAlreadyFriends(uid1, uid2) {
    try {
        let friendQuery = await xata
            .db["friends"]
            .filter({
            $all: {
                "user1.id": { $any: [uid1, uid2] },
                "user2.id": { $any: [uid1, uid2] }
            }
        })
            .getMany();
        return Boolean(friendQuery.toArray().length);
    }
    catch (err) {
        console.error(err);
        return false;
    }
}
app.get("/", async (req, res) => {
    if (!(await userExists(req.session.username))) {
        req.session.destroy(() => { });
    }
    return res.sendFile(path.join(cwd(), "src/static/index.html"));
});
app.post("/api/login", async (req, res) => {
    const body = req.body;
    if (!(body.username && body.password)) {
        return res.status(401).json({ success: false, reason: "Credentials were empty or incorrect" });
    }
    let databaseQuery = await xata
        .db["users"]
        .select(["username", "hash"])
        .filter({ username: body.username })
        .getFirst();
    if (!databaseQuery) {
        return res.status(401).json({ success: false, reason: "Credentials were incorrect" });
    }
    if (await compare(body.password, databaseQuery.hash)) {
        req.session.isLoggedIn = true;
        req.session.username = body.username;
        return res.redirect("/");
    }
    return res.json({ success: false, reason: "Password was incorrect" });
});
app.post("/api/signup", async (req, res) => {
    req.session.destroy(() => { });
    const passwordPattern = new RegExp(/^.{8,}$/);
    const usernamePattern = new RegExp(/^.{3,}$/);
    const body = req.body;
    console.log(body);
    if (!(body.username && body.password)) {
        return res.status(401).json({ success: false, reason: "Fields were left empty" });
    }
    if (!((passwordPattern.test(body.password)) && usernamePattern.test(body.username))) {
        return res.status(401).json({ success: false, reason: "Password needs to be 8 characters or longer. Username needs to be 3 or longer" });
    }
    const passwordHash = await hash(body.password, saltRounds);
    try {
        await xata
            .db["users"]
            .create({ "username": body.username, hash: passwordHash });
        return res.redirect("/");
    }
    catch {
        return res.status(401).json({ success: false, reason: "Username already exists" });
    }
});
app.post("/api/friendRequest", async (req, res) => {
    const body = req.body;
    const friendUsername = body.username;
    if (!friendUsername) {
        return res.status(401).json({ success: false, reason: "fields were left empty" });
    }
    const currentUsername = req.session.username;
    if (await userExists(friendUsername)) {
        try {
            const initiatingUID = await getUID(currentUsername);
            const friendUID = await getUID(friendUsername);
            if (!(initiatingUID || friendUID)) {
                throw Error("UID empty");
            }
            const alreadyFriends = await checkIfAlreadyFriends(initiatingUID, friendUID);
            if (!alreadyFriends) {
                let friendRequestQuery = await xata
                    .db["friends"]
                    .create({ user1: initiatingUID, user2: friendUID });
                if (!friendRequestQuery) {
                    return res.status(500).json({ success: false, reason: "an unknown error occured while adding your friend" });
                }
                return res.redirect(`/?message=successfully%20added%20${friendUsername}`);
            }
            else {
                return res.status(401).json({ success: false, reason: "You're already friends" });
            }
        }
        catch (err) {
            console.error(err);
            res.status(401).json({ success: false, reason: "This user likely does not exist, you're already friends or your request was malformed." });
        }
    }
});
app.get("/api/isLoggedIn", (req, res) => {
    return res.json({ isLoggedIn: req.session.isLoggedIn, username: req.session.username });
});
app.get("/api/logOut", (req, res) => {
    req.session.destroy(() => {
        return res.redirect("/");
    });
});
app.get("/api/getFriends", async (req, res) => {
    const username = req.session.username;
    const UID = await getUID(username);
    try {
        let friends = await xata
            .db["friends"]
            .select(["user1.username", "user2.username"])
            .filter({
            $any: [
                { "user1.id": UID },
                { "user2.id": UID }
            ]
        })
            .getMany();
        let friendArray = [];
        friends.forEach((node) => {
            // @ts-ignore
            let innerUsername = node.user1.username === username ? node.user2.username : node.user1.username;
            friendArray.push(innerUsername);
        });
        return res.json(friendArray);
    }
    catch (err) {
        console.error(err);
        return res.json([]);
    }
});
app.listen(8080, () => {
    console.log("express.js listening on port 8080");
});
