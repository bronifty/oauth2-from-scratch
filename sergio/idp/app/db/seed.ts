/**
 * @module
 * @author Sergio Xalambrí
 * @copyright
 */
import type Database from "bun:sqlite";

import clients from "./mocks/clients";
import subjectCredentials from "./mocks/subject-credentials";
import subjects from "./mocks/subjects";

export default function seed(db: Database) {
	for (let subject of subjects) {
		db.run("INSERT OR IGNORE INTO subjects (id, email_address) VALUES (?, ?)", [
			subject.id,
			subject.emailAddress,
		]);
	}

	for (let subjectCredential of subjectCredentials) {
		db.run(
			"INSERT OR IGNORE INTO subject_credentials (subject_id, password_hash) VALUES (?, ?)",
			[subjectCredential.subjectId, subjectCredential.passwordHash],
		);
	}

	for (let client of clients) {
		db.run(
			"INSERT OR IGNORE INTO clients (id, name, secret, callbacks, is_first_party, allowed_scopes, allowed_audiences) VALUES (?, ?, ?, ?, ?, ?, ?)",
			[
				client.id,
				client.name,
				client.secret,
				JSON.stringify(client.callbacks),
				client.isFirstParty,
				JSON.stringify(client.allowedScopes),
				JSON.stringify(client.allowedAudiences),
			],
		);
	}
}
