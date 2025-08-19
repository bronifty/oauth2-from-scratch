/**
 * When the user logs out, we revoke the refresh token and clear the session.
 * It's important to revoke the refresh token to prevent the user from getting
 * a new access token after logging out.
 * @module
 * @author Sergio Xalambrí
 * @copyright
 */
import { href, redirectDocument } from "react-router";
import auth from "~/auth";
import { getSession } from "~/middlewares/session";
import type { Route } from "./+types/logout";

export async function action({ context }: Route.ActionArgs) {
	let session = getSession(context);

	let token = session.get("refresh");
	if (token) await auth.revokeToken(token);

	session.unset("refresh");

	return redirectDocument(href("/"), { headers: { "Clear-Site-Data": "*" } });
}

export async function clientAction({ serverAction }: Route.ClientActionArgs) {
	try {
		return await serverAction();
	} finally {
		/**
		 * This is a nice little trick to improve the UX of the logout.
		 *
		 * After the action is done, we will post a message to every tab to logout.
		 * See `web/app/entry.client.tsx:14` to see where we listen to this message
		 * and reload the page.
		 */
		new BroadcastChannel("session").postMessage("logout");
	}
}
