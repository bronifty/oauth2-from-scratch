/**
 * @module
 * @author Sergio Xalambrí
 * @copyright
 */
import { Data } from "@edgefirst-dev/data";
import { ObjectParser } from "@edgefirst-dev/data/parser";
import db from "../db";
import { Subject } from "./subject";

export class SubjectCredential extends Data<ObjectParser> {
	get id() {
		return this.parser.number("id");
	}

	get subjectId() {
		return this.parser.string("subject_id");
	}

	get passwordHash() {
		return this.parser.string("password_hash");
	}

	get createdAt() {
		return new Date(Date.now() + this.parser.number("created_at"));
	}

	get updatedAt() {
		return new Date(Date.now() + this.parser.number("updated_at"));
	}

	#subject: Subject | null = null;
	get subject() {
		if (this.#subject) return this.#subject;
		this.#subject = Subject.find(this.subjectId);
		if (this.#subject) return this.#subject;
		throw new Error("Subject not found");
	}

	static find(email: string) {
		let [row] = db()
			.query("SELECT * FROM subject_credentials WHERE email_address = ?")
			.all(email);
		if (!row) return null;
		return new SubjectCredential(new ObjectParser(row));
	}

	static findBySubject(subject: Subject) {
		let rows = db()
			.query("SELECT * FROM subject_credentials WHERE subject_id = ?")
			.all(subject.id);
		return rows.map((row) => new SubjectCredential(new ObjectParser(row)));
	}

	static assign(subject: Subject, passwordHash: string) {
		let now = Date.now();
		let result = db()
			.query(
				"INSERT INTO subject_credentials (subject_id, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?)",
			)
			.run(subject.id, passwordHash, now, now);

		if (result.lastInsertRowid === 0) {
			throw new Error("Failed to assign credential");
		}

		return new SubjectCredential(
			new ObjectParser({
				id: result.lastInsertRowid,
				subject_id: subject.id,
				password_hash: passwordHash,
				created_at: now,
				updated_at: now,
			}),
		);
	}
}
