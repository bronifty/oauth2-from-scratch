/**
 * @module
 * @author Sergio Xalambrí
 * @copyright
 */
import type Database from "bun:sqlite";

export default function migrate(db: Database) {
	db.run(`CREATE TABLE IF NOT EXISTS subjects (
    id TEXT PRIMARY KEY,
    email_address TEXT NOT NULL UNIQUE,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

	db.run(`CREATE TABLE IF NOT EXISTS subject_credentials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject_id TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

	db.run(`CREATE TABLE IF NOT EXISTS subject_providers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject_id TEXT NOT NULL,
    external_id TEXT NOT NULL UNIQUE,
    provider_name TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

	db.run(`CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    secret TEXT NOT NULL,
    callbacks TEXT NOT NULL,
    is_first_party BOOLEAN NOT NULL,
    allowed_scopes TEXT NOT NULL,
    allowed_audiences TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

	db.run(`CREATE TABLE IF NOT EXISTS authorization_codes (
    id TEXT PRIMARY KEY,
    subject_id TEXT NOT NULL,
    audience TEXT NOT NULL,
    redirect_uri TEXT NOT NULL,
    client_id TEXT NOT NULL,
    pkce_challenge TEXT NOT NULL,
    pkce_method TEXT NOT NULL,
    scope TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

	db.run(`CREATE TABLE IF NOT EXISTS refresh_tokens (
    id TEXT PRIMARY KEY,
    subject_id TEXT NOT NULL,
    client_id TEXT NOT NULL,
    audience TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);
}
