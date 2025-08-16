/**
 * @module
 * @author Sergio Xalambrí
 * @copyright
 */
import { ACCESS_TOKEN_TTL } from "../config";
import type { RefreshToken } from "../entities/refresh-token";

export function badRequest(code: string, description: string) {
	return Response.json(
		{
			error: code,
			error_description: description,
		},
		{ status: 400, statusText: "Bad Request" },
	);
}

export function tokens(tokens: {
	accessToken: string;
	refreshToken?: RefreshToken;
	idToken?: string;
}) {
	return Response.json(
		{
			access_token: tokens.accessToken,
			token_type: "Bearer",
			expires_in: ACCESS_TOKEN_TTL,
			refresh_token: tokens.refreshToken?.id,
			id_token: tokens.idToken,
		},
		{ status: 200, statusText: "Created" },
	);
}
