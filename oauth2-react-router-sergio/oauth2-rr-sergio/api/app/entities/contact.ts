/**
 * @module
 * @author Sergio Xalambrí
 * @copyright
 */
import { Data } from "@edgefirst-dev/data";
import { ObjectParser } from "@edgefirst-dev/data/parser";
import sortBy from "sort-by";
import db from "../db";

export class Contact extends Data<ObjectParser> {
	get id() {
		return this.parser.number("id");
	}

	get subjectId() {
		return this.parser.string("subject_id");
	}

	get first() {
		return this.parser.string("first");
	}

	get last() {
		return this.parser.string("last");
	}

	get avatar() {
		return this.parser.string("avatar");
	}

	get github() {
		return this.parser.string("github");
	}

	get notes() {
		return this.parser.string("notes");
	}

	get favorite() {
		return this.parser.number("favorite") === 1;
	}

	get createdAt() {
		return new Date(this.parser.string("created_at"));
	}

	get updatedAt() {
		return new Date(this.parser.string("updated_at"));
	}

	override toJSON() {
		return {
			id: this.id,
			first: this.first,
			last: this.last,
			avatar: this.avatar,
			github: this.github,
			notes: this.notes,
			favorite: this.favorite,
			createdAt: this.createdAt,
		};
	}

	update(input: Contact.MutationInput) {
		db()
			.query(
				"UPDATE contacts SET first = ?, last = ?, avatar = ?, github = ?, notes = ?, favorite = ?, updated_at = ? WHERE id = ?",
			)
			.run(
				input.first ?? this.first,
				input.last ?? this.last,
				input.avatar ?? this.avatar,
				input.github ?? this.github,
				input.notes ?? this.notes,
				input.favorite ? 1 : 0,
				new Date().toISOString(),
				this.id,
			);

		this.parser = new ObjectParser(
			db()
				.query("SELECT * FROM contacts WHERE id = ? AND subject_id = ?")
				.get(this.id, this.subjectId),
		);

		return this;
	}

	static findBy(subjectId: string, id: number) {
		let data = db()
			.query("SELECT * FROM contacts WHERE id = ? AND subject_id = ?")
			.get(id, subjectId);
		return new Contact(new ObjectParser(data));
	}

	static findMany(subjectId: string, query: string | null) {
		let data = db()
			.query("SELECT * FROM contacts WHERE subject_id = ?")
			.all(subjectId);
		let contacts = data.map((row) => new Contact(new ObjectParser(row)));
		if (!query) return contacts.sort(sortBy("last", "createdAt"));
		return contacts
			.filter((contact) => {
				return (
					contact.first.toLowerCase().includes(query.toLowerCase()) ||
					contact.last.toLowerCase().includes(query.toLowerCase())
				);
			})
			.sort(sortBy("last", "createdAt"));
	}

	static create(subjectId: string, input: Contact.MutationInput) {
		let id = db()
			.query(
				"INSERT INTO contacts (subject_id, first, last, avatar, github, notes, favorite) VALUES (?, ?, ?, ?, ?, ?, ?)",
			)
			.run(
				subjectId,
				input.first ?? "",
				input.last ?? "",
				input.avatar ?? "",
				input.github ?? "",
				input.notes ?? "",
				input.favorite ? 1 : 0,
			).lastInsertRowid as number;
		return Contact.findBy(subjectId, id);
	}

	static destroyBy(subjectId: string, id: number) {
		db()
			.query("DELETE FROM contacts WHERE id = ? AND subject_id = ?")
			.run(id, subjectId);
	}

	static exists(subjectId: string, id: number) {
		let result = db()
			.query("SELECT COUNT(*) FROM contacts WHERE id = ? AND subject_id = ?")
			.get(id, subjectId);
		let parser = new ObjectParser(result);
		return parser.number("COUNT(*)") > 0;
	}
}

export namespace Contact {
	export class MutationInput extends Data<ObjectParser> {
		get id() {
			if (this.parser.has("id")) return this.parser.number("id");
			return null;
		}

		get first() {
			if (this.parser.has("first") && !this.parser.isNull("first")) {
				return this.parser.string("first");
			}
			return null;
		}

		get last() {
			if (this.parser.has("last") && !this.parser.isNull("last")) {
				return this.parser.string("last");
			}
			return null;
		}

		get avatar() {
			if (this.parser.has("avatar") && !this.parser.isNull("avatar")) {
				return this.parser.string("avatar");
			}
			return null;
		}

		get github() {
			if (this.parser.has("github") && !this.parser.isNull("github")) {
				return this.parser.string("github");
			}
			return null;
		}

		get notes() {
			if (this.parser.has("notes") && !this.parser.isNull("notes")) {
				return this.parser.string("notes");
			}
			return null;
		}

		get favorite() {
			if (this.parser.has("favorite") && !this.parser.isNull("favorite")) {
				return this.parser.boolean("favorite");
			}
			return null;
		}
	}
}
