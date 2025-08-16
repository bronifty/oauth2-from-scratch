/**
 * @module
 * @author Sergio Xalambrí
 * @copyright
 */
import type Database from "bun:sqlite";

export default function migrate(db: Database) {
	db.run(`CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject_id TEXT,
    first TEXT NOT NULL,
    last TEXT NOT NULL,
    avatar TEXT,
    github TEXT,
    notes TEXT,
    favorite BOOLEAN DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);
}
