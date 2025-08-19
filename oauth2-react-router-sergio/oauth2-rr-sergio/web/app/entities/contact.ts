/**
 * This represents a contact entity in the application.
 *
 * The modules defines the schema for a contact entity using Zod, a
 * TypeScript-first schema declaration and validation library.
 *
 * There's also an input schema for creating or updating a contact, which allows
 * for optional fields.
 * @module
 * @author Sergio Xalambrí
 * @copyright
 */
import { z } from "zod";

export const Schema = z.object({
	id: z.number(),
	first: z.string(),
	last: z.string(),
	avatar: z.string().url(),
	github: z.string(),
	notes: z.string(),
	favorite: z.coerce.boolean().default(false),
	createdAt: z.string().datetime(),
});

export const InputSchema = z.object({
	id: z.number().optional(),
	first: z.string().optional(),
	last: z.string().optional(),
	avatar: z.string().optional(),
	github: z.string().optional(),
	notes: z.string().optional(),
	favorite: z.boolean().optional(),
});

export type Type = z.infer<typeof Schema>;
export type InputType = z.infer<typeof InputSchema>;
