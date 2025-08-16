/**
 * @module
 * @author Sergio Xalambrí
 * @copyright
 */
import { Database } from "bun:sqlite";
import { beforeEach, describe, expect, test } from "bun:test";
import { run } from "../db";
import migrate from "../db/migrate";
import subjects from "../db/mocks/subjects";
import { purge } from "../db/purge";
import seed from "../db/seed";
import { Subject } from "./subject";

const db = new Database(":memory:");

beforeEach(() => {
	purge(db);
	migrate(db);
	seed(db);
});

describe(Subject, () => {
	describe(Subject.find, () => {
		test("returns the subject when found", () => {
			run(db, () => {
				let subject = Subject.find("64e199d1-519e-4b44-9486-d4e88ee84815");
				if (!subject) throw new Error("Subject not found");
				let mockSubject = subjects[0];

				expect(subject).toBeInstanceOf(Subject);

				expect(subject.id).toBe(mockSubject.id);
				expect(subject.email).toBe(mockSubject.emailAddress);
				expect(subject.createdAt).toBeDate();
				expect(subject.updatedAt).toBeDate();
			});
		});

		test("returns null when the subject is not found", () => {
			run(db, () => {
				let subject = Subject.find("FAKE");
				expect(subject).toBeNull();
			});
		});
	});

	describe(Subject.findByEmail, () => {
		test("returns the subject when found", () => {
			run(db, () => {
				let subject = Subject.findByEmail("hello@sergiodxa.com");
				if (!subject) throw new Error("Subject not found");

				let mockSubject = subjects[0];

				expect(subject).toBeInstanceOf(Subject);

				expect(subject.id).toBe(mockSubject.id);
				expect(subject.email).toBe(mockSubject.emailAddress);
				expect(subject.createdAt).toBeDate();
				expect(subject.updatedAt).toBeDate();
			});

			test("returns null when the subject is not found", () => {
				run(db, () => {
					let subject = Subject.findByEmail("FAKE");
					expect(subject).toBeNull();
				});
			});
		});
	});

	describe(Subject.register, () => {
		test("returns the subject when registered", () => {
			run(db, () => {
				let subject = Subject.register("test@example.com");
				expect(subject).toBeInstanceOf(Subject);
				expect(subject.id).toBeString();
				expect(subject.email).toBe("test@example.com");
				expect(subject.createdAt).toBeDate();
				expect(subject.updatedAt).toBeDate();
			});
		});
	});

	test("updates the email address", () => {
		run(db, () => {
			let subject = Subject.register("test@example.com");
			let initialUpdatedAt = subject.updatedAt;

			subject.email = "updated@example.com";

			expect(subject.email).toBe("updated@example.com");
			expect(subject.updatedAt).toBeDate();
			expect(subject.updatedAt).not.toBe(initialUpdatedAt);
			expect(subject.updatedAt > initialUpdatedAt).toBeTruthy();

			expect(Subject.find(subject.id)?.email).toBe("updated@example.com");
		});
	});
});
