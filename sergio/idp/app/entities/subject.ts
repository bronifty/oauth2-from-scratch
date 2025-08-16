/**
 * @module
 * @author Sergio Xalambrí
 * @copyright
 */
import { Data } from "@edgefirst-dev/data";
import { ObjectParser } from "@edgefirst-dev/data/parser";
import db from "../db";
import { SubjectCredential } from "./subject-credential";
import { SubjectProvider } from "./subject-provider";

export class Subject extends Data<ObjectParser> {
	get id() {
		return this.parser.string("id");
	}

	get email() {
		return this.parser.string("email_address");
	}

	set email(email: string) {
		let updatedAt = new Date().toISOString();
		let result = db().run(
			"UPDATE subjects SET email_address = ?, updated_at = ? WHERE id = ?",
			[email, updatedAt, this.id],
		);
		if (result.changes > 0) {
			this.parser.set("email_address", email);
			this.parser.set("updated_at", updatedAt);
		}
	}

	get createdAt() {
		return new Date(this.parser.string("created_at"));
	}

	get updatedAt() {
		return new Date(this.parser.string("updated_at"));
	}

	get credentials() {
		return SubjectCredential.findBySubject(this);
	}

	get providers() {
		return SubjectProvider.findBySubject(this);
	}

	override toJSON() {
		return {
			id: this.id,
			createdAt: this.createdAt,
			updatedAt: this.updatedAt,
			credentials: this.credentials,
			providers: this.providers,
		};
	}

	static findByEmail(email: string) {
		let [row] = db()
			.query("SELECT * FROM subjects WHERE email_address = ?")
			.all(email);
		if (!row) return null;
		return new Subject(new ObjectParser(row));
	}

	static find(id: string) {
		let [row] = db().query("SELECT * FROM subjects WHERE id = ?").all(id);
		if (!row) return null;
		return new Subject(new ObjectParser(row));
	}

	static register(email: string) {
		let id = crypto.randomUUID();
		db()
			.query("INSERT INTO subjects (id, email_address) VALUES (?, ?)")
			.run(id, email);

		let subject = Subject.find(id);
		if (subject) return subject;
		throw new Error("Failed to register subject");
	}
}
