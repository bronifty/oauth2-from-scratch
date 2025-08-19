/**
 * If the user goes to /contacts, we get the first contact and redirect to
 * the detail route (/contacts/:contactId). If there are no contacts, we
 * redirect to the new contact route (/contacts/new).
 * @module
 * @author Sergio Xalambrí
 * @copyright
 */
import { href, redirect } from "react-router";
import { getAPIClient } from "~/middlewares/api-client";
import type { Route } from "./+types/index";

export async function loader({ context }: Route.LoaderArgs) {
	let api = getAPIClient(context);
	let contacts = await api.contacts();
	let contact = contacts.at(0);
	if (!contact) return redirect(href("/contacts/new"));
	return redirect(
		href("/contacts/:contactId", { contactId: contact.id.toString() }),
	);
}
