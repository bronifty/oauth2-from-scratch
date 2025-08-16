/**
 * @module
 * @author Sergio Xalambrí
 * @copyright
 */
import { Data } from "@edgefirst-dev/data";
import { ObjectParser } from "@edgefirst-dev/data/parser";
import db from "../db";
import { Subject } from "./subject";

export class SubjectProvider extends Data<ObjectParser> {
	get id() {
		return this.parser.number("id");
	}

	get subjectId() {
		return this.parser.string("subject_id");
	}

	get externalId() {
		return this.parser.string("external_id");
	}

	get providerName() {
		return this.parser.string("provider_name");
	}

	get createdAt() {
		return new Date(this.parser.string("created_at"));
	}

	get updatedAt() {
		return new Date(this.parser.string("updated_at"));
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
			externalId: this.externalId,
			providerName: this.providerName,
			createdAt: this.createdAt,
			updatedAt: this.updatedAt,
		};
	}

	static find(id: number) {
		let [row] = db()
			.query("SELECT * FROM subject_providers WHERE id = ?")
			.all(id);
		if (!row) throw ReferenceError(`SubjectProvider "${id}" not found`);
		return new SubjectProvider(new ObjectParser(row));
	}

	static findBySubject(subject: Subject) {
		let rows = db()
			.query("SELECT * FROM subject_providers WHERE subject_id = ?")
			.all(subject.id);
		return rows.map((row) => new SubjectProvider(new ObjectParser(row)));
	}

	static findByProvider(externalId: string, providerName: string) {
		let [row] = db()
			.query(
				"SELECT * FROM subject_providers WHERE external_id = ? AND provider_name = ?",
			)
			.all(externalId, providerName);
		if (!row) return null;
		return new SubjectProvider(new ObjectParser(row));
	}

	static assign(subject: Subject, externalId: string, providerName: string) {
		let now = Date.now();
		let result = db()
			.query(
				"INSERT INTO subject_providers (subject_id, external_id, provider_name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
			)
			.run(subject.id, externalId, providerName, now, now);

		if (result.lastInsertRowid === 0) {
			throw new Error("Failed to assign provider");
		}

		return new SubjectProvider(
			new ObjectParser({
				id: result.lastInsertRowid,
				subject_id: subject.id,
				external_id: externalId,
				provider_name: providerName,
				created_at: now,
				updated_at: now,
			}),
		);
	}
}
