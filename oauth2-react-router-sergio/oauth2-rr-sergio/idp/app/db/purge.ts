/**
 * @module
 * @author Sergio Xalambrí
 * @copyright
 */
import type Database from "bun:sqlite";

export function purge(db: Database) {
	db.exec("PRAGMA foreign_keys=OFF;");

	db.exec("DROP TABLE IF EXISTS authorization_codes;");
	db.exec("DROP TABLE IF EXISTS clients;");
	db.exec("DROP TABLE IF EXISTS refresh_tokens;");
	db.exec("DROP TABLE IF EXISTS subject_credentials;");
	db.exec("DROP TABLE IF EXISTS subject_providers;");
	db.exec("DROP TABLE IF EXISTS subjects;");

	db.exec("PRAGMA foreign_keys=ON;");
}
