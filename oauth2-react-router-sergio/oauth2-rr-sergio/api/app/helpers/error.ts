/**
 * @module
 * @author Sergio Xalambrí
 * @copyright
 */
import { JWTExpired } from "jose/errors";
import { AuthenticationError, AuthorizationError } from "./auth";

export function handleError(error: unknown): Response {
	if (error instanceof AuthenticationError) {
		return Response.json(
			{ error: error.message },
			{ status: 401, statusText: "Unauthorized" },
		);
	}

	if (error instanceof AuthorizationError) {
		return Response.json(
			{ error: error.message },
			{ status: 403, statusText: "Forbidden" },
		);
	}

	if (error instanceof JWTExpired) {
		return Response.json(
			{ error: "Token expired" },
			{ status: 401, statusText: "Unauthorized" },
		);
	}

	console.error(error);

	if (error instanceof Error) {
		return Response.json(
			{ error: error.message },
			{ status: 500, statusText: "Internal Server Error" },
		);
	}

	return Response.json(
		{ error: "Unknown error" },
		{ status: 500, statusText: "Internal Server Error" },
	);
}
