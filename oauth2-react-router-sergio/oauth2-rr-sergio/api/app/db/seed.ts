/**
 * @module
 * @author Sergio Xalambrí
 * @copyright
 */
import type Database from "bun:sqlite";
import contacts from "./mocks/contacts";

export default function seed(db: Database) {
	for (let contact of contacts) {
		db.query(
			"INSERT INTO contacts (subject_id, first, last, avatar, github, notes, favorite) VALUES (?, ?, ?, ?, ?, ?, ?)",
		).run(
			contact.subjectId,
			contact.first ?? "",
			contact.last ?? "",
			contact.avatar ?? "",
			contact.github ?? "",
			"",
			contact.favorite ? 1 : 0,
		);
	}
}
