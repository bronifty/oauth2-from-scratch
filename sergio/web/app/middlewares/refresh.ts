/**
 * This middleware is where part of the authentication process is done.
 *
 * Here we get the session from the context, previously set there by the
 * session middleware we created in ~/middlewares/session.ts.
 *
 * Once we have the session instance, we will get the refresh token we stored
 * there when the user logged in. If there's no refresh token, we will consider
 * the user is not logged in and redirect to the login page.
 *
 * If we have a refresh token, we will use it to get a new access token, and
 * in case we got a new refresh token from the auth server we will store it in
 * the session.
 *
 * Finally, we will store the access token in the context so we can use it in
 * a subsequent middleware to create a new API client instance.
 * @module
 * @author Sergio Xalambrí
 * @copyright
 */
import type { unstable_MiddlewareFunction } from "react-router";
import {
	href,
	redirect,
	unstable_RouterContextProvider,
	unstable_createContext,
} from "react-router";
import auth, { type Tokens } from "~/auth";
import { getSession } from "./session";

const accessTokenContext = unstable_createContext<string>();

export const refreshMiddleware: unstable_MiddlewareFunction<Response> = async (
	{ context },
	next,
) => {
	let session = getSession(context);

	let refreshToken = session.get("refresh");

	if (!refreshToken) throw redirect(href("/auth"));

	let tokens: Tokens | null = null;

	try {
		tokens = await auth.refreshToken(refreshToken);
	} catch {
		// If the refresh token is invalid, we need to redirect to the login page
		// to get a new one.
		session.unset("refresh");
		session.unset("email");
		throw redirect(href("/auth"));
	}

	if (tokens.hasRefreshToken()) {
		session.set("refresh", tokens.refreshToken());
	}

	context.set(accessTokenContext, tokens.accessToken());

	return await next();
};

export function getAccessToken(context: unstable_RouterContextProvider) {
	return context.get(accessTokenContext);
}
