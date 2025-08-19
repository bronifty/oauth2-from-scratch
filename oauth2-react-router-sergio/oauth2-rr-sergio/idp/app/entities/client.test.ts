/**
 * @module
 * @author Sergio Xalambrí
 * @copyright
 */
import { Database } from "bun:sqlite";
import { beforeEach, describe, expect, test } from "bun:test";
import { run } from "../db";
import migrate from "../db/migrate";
import clients from "../db/mocks/clients";
import { purge } from "../db/purge";
import seed from "../db/seed";
import { Client } from "./client";

const db = new Database(":memory:");

beforeEach(() => {
	purge(db);
	migrate(db);
	seed(db);
});

describe(Client, () => {
	describe(Client.find, () => {
		test("returns client details when found", () => {
			run(db, () => {
				let client = Client.find("56f0fee7-a73e-41f5-9a75-310e5bb340ee");
				if (!client) throw new Error("Client not found");
				let mockClient = clients[0];
				expect(client).toBeInstanceOf(Client);
				expect(client.id).toBe(mockClient.id);
				expect(client.name).toBe(mockClient.name);
				expect(client.secret).toBe(mockClient.secret);
				expect(client.callbacks).toEqual([...mockClient.callbacks]);
				expect(client.isFirstParty).toBe(mockClient.isFirstParty);
				expect(client.allowedScopes).toEqual([...mockClient.allowedScopes]);
				expect(client.allowedAudiences).toEqual([
					...mockClient.allowedAudiences,
				]);
				expect(client.createdAt).toBeDate();
				expect(client.updatedAt).toBeDate();
			});
		});

		test("returns null when client not found", () => {
			run(db, () => {
				let client = Client.find("invalid-id");
				expect(client).toBeNull();
			});
		});
	});

	describe(Client.register, () => {
		test("registers a new client and returns the client object", () => {
			run(db, () => {
				let client = Client.register({
					name: "Test Client",
					callbacks: ["https://example.com/callback"],
					allowedScopes: ["read", "write"],
					allowedAudiences: ["audience1", "audience2"],
				});

				expect(client).toBeInstanceOf(Client);
				expect(client.name).toBe("Test Client");
				expect(client.callbacks).toEqual(["https://example.com/callback"]);
				expect(client.isFirstParty).toBe(false);
				expect(client.allowedScopes).toEqual(["read", "write"]);
				expect(client.allowedAudiences).toEqual(["audience1", "audience2"]);
				expect(client.createdAt).toBeDate();
				expect(client.updatedAt).toBeDate();
			});
		});
	});
});
