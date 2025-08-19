/**
 * @module
 * @author Sergio Xalambrí
 * @copyright
 */
import { Form, data, href, redirect, useNavigate } from "react-router";
import * as Contact from "~/entities/contact";
import { getAPIClient } from "~/middlewares/api-client";
import type { Route } from "./+types/edit";

export async function loader({ params, context }: Route.LoaderArgs) {
	let api = getAPIClient(context);
	let contact = await api.contact(Number(params.contactId));
	return data({ contact });
}

export async function action({ request, params, context }: Route.ActionArgs) {
	let api = getAPIClient(context);
	let formData = await request.formData();
	let input = Contact.InputSchema.parse(Object.fromEntries(formData));
	let contact = await api.updateContact(Number(params.contactId), input);
	return redirect(
		href("/contacts/:contactId", { contactId: contact.id.toString() }),
	);
}

export default function Component({ loaderData }: Route.ComponentProps) {
	let { contact } = loaderData;

	let navigate = useNavigate();

	return (
		<Form key={contact.id} id="contact-form" method="post">
			<p>
				<span>Name</span>
				<input
					aria-label="First name"
					defaultValue={contact.first}
					name="first"
					placeholder="First"
					type="text"
				/>
				<input
					aria-label="Last name"
					defaultValue={contact.last}
					name="last"
					placeholder="Last"
					type="text"
				/>
			</p>
			<label>
				<span>Github</span>
				<input
					defaultValue={contact.github}
					name="github"
					placeholder="sergiodxa"
					type="text"
				/>
			</label>
			<label>
				<span>Avatar URL</span>
				<input
					aria-label="Avatar URL"
					defaultValue={contact.avatar}
					name="avatar"
					placeholder="https://example.com/avatar.jpg"
					type="text"
				/>
			</label>
			<label>
				<span>Notes</span>
				<textarea defaultValue={contact.notes} name="notes" rows={6} />
			</label>
			<p>
				<button type="submit">Save</button>
				<button type="button" onClick={() => navigate(-1)}>
					Cancel
				</button>
			</p>
		</Form>
	);
}
