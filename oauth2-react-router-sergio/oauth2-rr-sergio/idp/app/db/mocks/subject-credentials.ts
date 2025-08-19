/**
 * @module
 * @author Sergio Xalambrí
 * @copyright
 */
import subjects from "./subjects";

export default [
	{
		subjectId: subjects[0].id,
		passwordHash: await Bun.password.hash("abcDEF123$%^"),
	},
] as const;
