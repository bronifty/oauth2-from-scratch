/**
 * We use this to redirect users from / to /contacts, that's it.
 * @module
 * @author Sergio Xalambrí
 * @copyright
 */
import { href, redirect } from "react-router";
import type { Route } from "./+types";

export async function loader(_: Route.LoaderArgs) {
	return redirect(href("/contacts"));
}
