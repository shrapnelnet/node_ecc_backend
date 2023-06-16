declare module "express-session" {
    interface SessionData {
        isLoggedIn: boolean;
        username: string;
    }
}
export {};
