/**
 * @module
 * @author Sergio Xalambrí
 * @copyright
 */
import { Form, redirect, useNavigate } from "react-router";
import * as Contact from "~/entities/contact";
import { getAPIClient } from "~/middlewares/api-client";
import type { Route } from "./+types/new";

export async function action({ request, context }: Route.ActionArgs) {
	let api = getAPIClient(context);
	let formData = await request.formData();
	let input = Contact.InputSchema.parse(Object.fromEntries(formData));
	let contact = await api.createContact(input);
	return redirect(`/contacts/${contact.id}`);
}

export default function Component(_: Route.ComponentProps) {
	let navigate = useNavigate();
	return (
		<Form key="new" id="contact-form" method="post">
			<p>
				<span>Name</span>
				<input
					aria-label="First name"
					name="first"
					placeholder="First"
					type="text"
				/>
				<input
					aria-label="Last name"
					name="last"
					placeholder="Last"
					type="text"
				/>
			</p>
			<label>
				<span>Github</span>
				<input name="github" placeholder="sergiodxa" type="text" />
			</label>
			<label>
				<span>Avatar URL</span>
				<input
					aria-label="Avatar URL"
					name="avatar"
					placeholder="https://example.com/avatar.jpg"
					type="text"
				/>
			</label>
			<label>
				<span>Notes</span>
				<textarea name="notes" rows={6} />
			</label>
			<p>
				<button type="submit">Save</button>
				<button type="submit" onClick={() => navigate(-1)}>
					Cancel
				</button>
			</p>
		</Form>
	);
}
