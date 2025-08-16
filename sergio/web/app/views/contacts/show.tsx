/**
 * @module
 * @author Sergio Xalambrí
 * @copyright
 */
import { useRef, useState } from "react";
import { Form, data, useFetcher } from "react-router";
import * as Contact from "~/entities/contact";
import { getAPIClient } from "~/middlewares/api-client";
import type { Route } from "./+types/show";

export async function loader({ context, params }: Route.LoaderArgs) {
	let api = getAPIClient(context);
	let contact = await api.contact(Number(params.contactId));
	return data({ contact });
}

export async function action({ request, params, context }: Route.ActionArgs) {
	let api = getAPIClient(context);
	let formData = await request.formData();

	if (formData.get("favorite")) {
		let input = Contact.InputSchema.parse({
			favorite: formData.get("favorite") === "true",
		});
		try {
			await api.updateContact(Number(params.contactId), input);
		} catch (error) {
			if (
				error instanceof Error &&
				error.message === "Insufficient permissions"
			) {
				return data(
					{
						ok: false as const,
						id: crypto.randomUUID(),
						message: "You do not have permission to update this contact.",
					},
					{ status: 403, statusText: "Forbidden" },
				);
			}

			throw error; // Unexpected error
		}
	}

	return data({ ok: true as const });
}

export default function Component({ loaderData }: Route.ComponentProps) {
	let { contact } = loaderData;

	let fetcher = useFetcher<typeof action>({ key: `favorite:${contact.id}` });

	return (
		<div id="contact">
			<div>
				<img
					alt={`${contact.first} ${contact.last} avatar`}
					key={contact.avatar}
					src={contact.avatar}
				/>
			</div>

			<div>
				<h1>
					{contact.first || contact.last ? (
						<>
							{contact.first} {contact.last}
						</>
					) : (
						<i>No Name</i>
					)}
					<Favorite contact={contact} />
				</h1>

				{contact.github ? (
					<p>
						<a href={`https://github.com/${contact.github}`}>
							{contact.github}
						</a>
					</p>
				) : null}

				{contact.notes ? <p>{contact.notes}</p> : null}

				<div>
					<Form action="edit">
						<button type="submit">Edit</button>
					</Form>

					<Form
						fetcherKey={`destroy:${contact.id}`}
						navigate={false}
						action="destroy"
						method="post"
						onSubmit={(event) => {
							let response = confirm(
								"Please confirm you want to delete this record.",
							);
							if (!response) event.preventDefault();
						}}
					>
						<button type="submit">Delete</button>
					</Form>
				</div>

				{fetcher.data?.ok === false && (
					<ErrorMessage key={fetcher.data.id} message={fetcher.data.message} />
				)}
			</div>
		</div>
	);
}

function Favorite({
	contact,
}: { contact: Pick<Contact.Type, "id" | "favorite"> }) {
	let fetcher = useFetcher<typeof action>({ key: `favorite:${contact.id}` });
	let favorite = fetcher.formData
		? fetcher.formData.get("favorite") === "true"
		: contact.favorite;

	return (
		<fetcher.Form method="post">
			<button
				type="submit"
				aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
				name="favorite"
				value={favorite ? "false" : "true"}
			>
				{favorite ? "★" : "☆"}
			</button>
		</fetcher.Form>
	);
}

function ErrorMessage({ message }: { message: string }) {
	let [show, setState] = useState(true);
	let timer = useRef<NodeJS.Timeout | null>(null);

	if (!show) return null;
	return (
		<p
			style={{ color: "red" }}
			ref={(ref) => {
				if (ref) timer.current = setTimeout(setState, 4001, false);
				else if (timer.current) {
					clearTimeout(timer.current);
				}
			}}
		>
			{message}
		</p>
	);
}
