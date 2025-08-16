/**
 * @module
 * @author Sergio Xalambrí
 * @copyright
 */
import { Data } from "@edgefirst-dev/data";
import { ObjectParser } from "@edgefirst-dev/data/parser";
import { AUTHORIZATION_CODE_TTL } from "../config";
import db from "../db";
import { Client } from "./client";
import { Subject } from "./subject";

export class AuthorizationCode extends Data<ObjectParser> {
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

	get redirectUri() {
		return this.parser.string("redirect_uri");
	}

	get pkceChallenge() {
		return this.parser.string("pkce_challenge");
	}

	get pkceMethod() {
		let method = this.parser.string("pkce_method");
		if (method === "S256") return "S256";
		if (method === "plain") return "plain";
		throw new Error(`Invalid PKCE method: ${method}`);
	}

	get scope() {
		return this.parser.string("scope");
	}

	get expiresAt() {
		return new Date(this.parser.string("expires_at"));
	}

	get isExpired() {
		return this.expiresAt.getTime() < Date.now();
	}

	get createdAt() {
		return new Date(this.parser.string("created_at"));
	}

	get updatedAt() {
		return new Date(this.parser.string("updated_at"));
	}

	get pkce() {
		return {
			challenge: this.pkceChallenge,
			method: this.pkceMethod,
		} as const;
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
			pkceChallenge: this.pkceChallenge,
			pkceMethod: this.pkceMethod,
			scope: this.scope,
			redirectUri: this.redirectUri,
			expiresAt: this.expiresAt.toISOString(),
			createdAt: this.createdAt.toISOString(),
			updatedAt: this.updatedAt.toISOString(),
		};
	}

	static find(id: string) {
		let [row] = db()
			.query("SELECT * FROM authorization_codes WHERE id = ?")
			.all(id);
		if (!row) throw ReferenceError(`AuthorizationCode "${id}" not found`);
		return new AuthorizationCode(new ObjectParser(row));
	}

	static generate(
		subject: Subject,
		data: {
			audience: string;
			redirectUri: string;
			clientId: string;
			pkce: { challenge: string; method: "S256" | "plain" };
			scopes: string[];
		},
	) {
		let id = crypto.randomUUID();
		let now = Date.now();

		db()
			.query(
				"INSERT INTO authorization_codes (id, subject_id, audience, client_id, redirect_uri, pkce_challenge, pkce_method, scope, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
			)
			.run(
				id,
				subject.id,
				data.audience,
				data.clientId,
				data.redirectUri,
				data.pkce.challenge,
				data.pkce.method,
				data.scopes.join(" "),
				new Date(now + AUTHORIZATION_CODE_TTL).toISOString(),
			);

		let authorizationCode = AuthorizationCode.find(id);
		if (authorizationCode) return authorizationCode;
		throw new Error("Failed to generate authorization code");
	}
}
