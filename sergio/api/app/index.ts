/**
 * @module
 * @author Sergio Xalambrí
 * @copyright
 */
import { Database } from "bun:sqlite";
import { ObjectParser } from "@edgefirst-dev/data/parser";
import db, { run } from "./db";
import migrate from "./db/migrate";
import seed from "./db/seed";
import { Contact } from "./entities/contact";
import { authenticate, authorize } from "./helpers/auth";
import env from "./helpers/env";
import { handleError } from "./helpers/error";
import { logRequest } from "./helpers/logger";

const database = (await Bun.file("./db.sqlite").exists())
	? new Database("./db.sqlite")
	: new Database(":memory:");

run(database, () => {
	Bun.serve({
		port: env.PORT,
		routes: {
			/**
			 * The healthcheck endpoint is used to check if the server is running, it
			 * also runs the database migration and seeds the database with initial
			 * data.
			 */
			"/healthcheck": {
				async GET() {
					migrate(db());
					seed(db());
					return Response.json({ status: "ok" });
				},
			},

			/**
			 * The /contacts endpoint is used to manage contacts
			 */
			"/contacts": {
				/**
				 * This handles both listing and reading a contact.
				 * If a `?id` search param is provided, it will return the contact with
				 * that id, otherwise it will return all the contacts.
				 */
				async GET(request: Bun.BunRequest) {
					logRequest(request);

					try {
						let jwt = await authenticate(request);
						await authorize(jwt, "contacts:read:own");

						let url = new URL(request.url);

						if (url.searchParams.has("id")) {
							let id = Number(url.searchParams.get("id"));

							if (Contact.exists(jwt.subject, id)) {
								return Response.json({
									contact: Contact.findBy(jwt.subject, id),
								});
							}

							return Response.json(
								{ error: "Contact not found" },
								{ status: 404, statusText: "Not found" },
							);
						}

						let query = url.searchParams.get("q");
						return Response.json({
							contacts: Contact.findMany(jwt.subject, query),
						});
					} catch (error) {
						return handleError(error);
					}
				},

				async POST(request: Bun.BunRequest) {
					logRequest(request);

					try {
						let jwt = await authenticate(request);
						await authorize(jwt, "contacts:write:own");

						let body = await request.json();
						let input = new Contact.MutationInput(new ObjectParser(body));
						let contact = Contact.create(jwt.subject, input);

						return Response.json({ contact }, { status: 201 });
					} catch (error) {
						return handleError(error);
					}
				},

				async PATCH(request: Bun.BunRequest) {
					logRequest(request);

					try {
						let jwt = await authenticate(request);
						await authorize(jwt, "contacts:write:own");

						let url = new URL(request.url);
						let id = Number(url.searchParams.get("id"));

						if (!Contact.exists(jwt.subject, id)) {
							return Response.json(
								{ error: "Contact not found" },
								{ status: 404, statusText: "Not found" },
							);
						}

						let body = await request.json();
						let input = new Contact.MutationInput(new ObjectParser(body));

						let contact = Contact.findBy(jwt.subject, id);
						contact.update(input);

						return Response.json({ contact }, { status: 200 });
					} catch (error) {
						return handleError(error);
					}
				},

				async DELETE(request: Bun.BunRequest) {
					logRequest(request);

					try {
						let jwt = await authenticate(request);
						await authorize(jwt, "contacts:write:own");

						let url = new URL(request.url);
						let id = Number(url.searchParams.get("id"));

						if (!Contact.exists(jwt.subject, id)) {
							return Response.json(
								{ error: "Contact not found" },
								{ status: 404, statusText: "Not found" },
							);
						}

						Contact.destroyBy(jwt.subject, id);

						return Response.json(null, { status: 204 });
					} catch (error) {
						return handleError(error);
					}
				},
			},
		},
	});
});
