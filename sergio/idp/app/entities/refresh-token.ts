/**
 * @module
 * @author Sergio Xalambrí
 * @copyright
 */
import { Data } from "@edgefirst-dev/data";
import { ObjectParser } from "@edgefirst-dev/data/parser";
import { REFRESH_TOKEN_TTL } from "../config";
import db from "../db";
import { Client } from "./client";
import { Subject } from "./subject";

export class RefreshToken extends Data<ObjectParser> {
	get id() {
		return this.parser.string("id");
	}

	get subjectId() {
		return this.parser.string("subject_id");
	}

	get audience() {
		return this.parser.string("audience");
	}

	get clientId() {
		return this.parser.string("client_id");
	}

	get expiresAt() {
		return new Date(this.parser.string("expires_at"));
	}

	get createdAt() {
		return new Date(this.parser.string("created_at"));
	}

	get updatedAt() {
		return new Date(this.parser.string("updated_at"));
	}

	#client: Client | null = null;
	get client() {
		if (this.#client) return this.#client;
		this.#client = Client.find(this.clientId);
		if (this.#client) return this.#client;
		throw new Error("Client not found");
	}

	#subject: Subject | null = null;
	get subject() {
		if (this.#subject) return this.#subject;
		this.#subject = Subject.find(this.subjectId);
		if (this.#subject) return this.#subject;
		throw new Error("Subject not found");
	}

	override toJSON() {
		return {
			id: this.id,
			subjectId: this.subjectId,
			audience: this.audience,
			clientId: this.clientId,
			expiresAt: this.expiresAt,
			createdAt: this.createdAt,
			updatedAt: this.updatedAt,
		};
	}

	static find(id: string) {
		let [row] = db().query("SELECT * FROM refresh_tokens WHERE id = ?").all(id);
		if (!row) throw ReferenceError(`RefreshToken "${id}" not found`);
		return new RefreshToken(new ObjectParser(row));
	}

	static generate(
		subject: Subject,
		client: Client,
		data: { audience: string },
	) {
		let id = crypto.randomUUID();
		let now = Date.now();
		let result = db()
			.query(
				"INSERT INTO refresh_tokens (id, subject_id, audience, client_id, expires_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
			)
			.run(
				id,
				subject.id,
				data.audience,
				client.id,
				now + REFRESH_TOKEN_TTL,
				now,
				now,
			);
		if (result.lastInsertRowid === 0) {
			throw new Error("Failed to create refresh token");
		}
		return RefreshToken.find(id);
	}

	static revoke(id: string) {
		db().query("DELETE FROM refresh_tokens WHERE id = ?").run(id);
	}

	revoke() {
		RefreshToken.revoke(this.id);
	}
}
