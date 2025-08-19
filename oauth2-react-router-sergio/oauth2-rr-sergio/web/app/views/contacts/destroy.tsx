/**
 * @module
 * @author Sergio Xalambrí
 * @copyright
 */
import { href, redirect } from "react-router";
import { getAPIClient } from "~/middlewares/api-client";
import type { Route } from "./+types/destroy";

export async function action({ context, params }: Route.ActionArgs) {
	let api = getAPIClient(context);
	await api.deleteContact(Number(params.contactId));
	return redirect(href("/contacts"));
}
