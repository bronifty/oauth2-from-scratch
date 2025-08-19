/**
 * @module
 * @author Sergio Xalambrí
 * @copyright
 */
import { Data } from "@edgefirst-dev/data";
import { ObjectParser } from "@edgefirst-dev/data/parser";
import db from "../db";
import { validateArrayOfStrings } from "../helpers/validations";

export class Client extends Data<ObjectParser> {
	get id() {
		return this.parser.string("id");
	}

	get name() {
		return this.parser.string("name");
	}

	get secret() {
		return this.parser.string("secret");
	}

	get callbacks() {
		return validateArrayOfStrings(JSON.parse(this.parser.string("callbacks")));
	}

	get isFirstParty() {
		return this.parser.number("is_first_party") === 1;
	}

	get allowedScopes() {
		return validateArrayOfStrings(
			JSON.parse(this.parser.string("allowed_scopes")),
		);
	}

	get allowedAudiences() {
		return validateArrayOfStrings(
			JSON.parse(this.parser.string("allowed_audiences")),
		);
	}

	get createdAt() {
		return new Date(this.parser.string("created_at"));
	}

	get updatedAt() {
		return new Date(this.parser.string("updated_at"));
	}

	override toJSON() {
		return {
			id: this.id,
			name: this.name,
			secret: this.secret,
			callbacks: this.callbacks,
			isFirstParty: this.isFirstParty,
			allowedScopes: this.allowedScopes,
			allowedAudiences: this.allowedAudiences,
			createdAt: this.createdAt,
			updatedAt: this.updatedAt,
		};
	}

	static find(id: string) {
		let [row] = db().query("SELECT * FROM clients WHERE id = ?").all(id);
		if (!row) return null;
		return new Client(new ObjectParser(row));
	}

	static register(options: {
		name: string;
		callbacks: string[];
		allowedScopes: string[];
		allowedAudiences: string[];
	}) {
		let id = crypto.randomUUID();

		db()
			.query(
				"INSERT INTO clients (id, name, secret, callbacks, is_first_party, allowed_scopes, allowed_audiences) VALUES (?, ?, ?, ?, ?, ?, ?)",
			)
			.run(
				id,
				options.name,
				crypto.randomUUID(),
				JSON.stringify(options.callbacks),
				0,
				JSON.stringify(options.allowedScopes),
				JSON.stringify(options.allowedAudiences),
			);

		let client = Client.find(id);
		if (client) return client;
		throw new Error("Client registration failed");
	}
}
