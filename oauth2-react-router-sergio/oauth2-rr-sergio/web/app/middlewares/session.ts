/**
 * This module is where we create the session middleware for the app.
 *
 * This midddleware comes from the remix-utils package, but we could create our
 * own middleware quite easily if we want, all this does is to get the session
 * from the Request cookies using the sessionStorage and store it in the
 * context.
 *
 * Then it detects if the session data has changed at the end of the request and
 * if so, it will commit it and add the Set-Cookie header to the response.
 * @module
 * @author Sergio Xalambrí
 * @copyright
 */
import { createCookie, createCookieSessionStorage } from "react-router";
import { unstable_createSessionMiddleware } from "remix-utils/middleware/session";
import env from "../env";

interface SessionData {
	refresh: string;
	email: string;
}

const cookie = createCookie("session", {
	httpOnly: true,
	maxAge: 60 * 60 * 24 * 7, // 1 week
	path: "/",
	sameSite: "lax",
	secrets: [env.SESSION_SECRET],
	secure: import.meta.env.PROD,
});

const sessionStorage = createCookieSessionStorage<SessionData>({
	cookie,
});

export const [sessionMiddleware, getSession] =
	unstable_createSessionMiddleware(sessionStorage);
