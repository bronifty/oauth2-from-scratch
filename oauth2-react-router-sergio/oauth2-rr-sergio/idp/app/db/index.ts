/**
 * @module
 * @author Sergio Xalambrí
 * @copyright
 */
import type { Database } from "bun:sqlite";
import { AsyncLocalStorage } from "node:async_hooks";

const storage = new AsyncLocalStorage<Database>();

export function run<T>(db: Database, cb: () => T) {
	return storage.run(db, cb);
}

export default function db() {
	const db = storage.getStore();
	if (!db) throw new Error("Database not found");
	return db;
}
