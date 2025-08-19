/**
 * This rute is used to initiate the authentication process. It's also used to
 * handle the authentication callback from the OAuth provider.
 *
 * The loader function is called when the user is redirected to the /auth route
 * after the user has authenticated with the OAuth provider. The function will
 * receive the tokens from the OAuth strategy, and will store the refresh token
 * and email address in the session.
 * @module
 * @author Sergio Xalambrí
 * @copyright
 */
import { href, redirect } from "react-router";
import auth from "~/auth";
import { IDToken } from "~/entities/id-token";
import { getSession } from "~/middlewares/session";
import type { Route } from "./+types/auth";

export async function loader({ request, context }: Route.LoaderArgs) {
	let tokens = await auth.authenticate(request);
	let session = getSession(context);

	if (tokens.hasRefreshToken()) session.set("refresh", tokens.refreshToken());

	let idToken = IDToken.decode(tokens.idToken());
	session.set("email", idToken.email);

	return redirect(href("/contacts"));
}
