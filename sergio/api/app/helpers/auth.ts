/**
 * This module contains the code for authenticating and authorizing users
 * using JWT tokens.
 *
 * The `authenticate` function gets the Authorization header from the request,
 * extracts the token, and verifies it using the JWKs from the issuer.
 * If the token is valid, it returns the decoded token.
 *
 * The `authorize` function checks if the token has the required scopes
 * to access the requested resource. If not, it throws an AuthorizationError.
 * @module
 * @author Sergio Xalambrí
 * @copyright
 */
import { JWK } from "@edgefirst-dev/jwt";
import { AccessTokenJWT } from "../entities/access-token";
import env from "./env";

export async function authenticate(request: Request) {
	let header = request.headers.get("Authorization");
	if (!header) throw new AuthenticationError("Missing Authorization header");

	let [type, token] = header.split(" ");

	if (type !== "Bearer") throw new AuthenticationError("Invalid type");
	if (!token) throw new AuthenticationError("Missing token");

	const jwks = await JWK.importRemote(
		new URL("/.well-known/jwks.json", env.ISSUER_HOST),
		{ alg: JWK.Algoritm.ES256 },
	);

	return await AccessTokenJWT.verify(token, jwks, {
		issuer: env.ISSUER,
		audience: env.AUDIENCE,
	});
}

export async function authorize(
	accessToken: AccessTokenJWT,
	...scopes: string[]
) {
	if (!scopes.every((scope) => accessToken.scopes.includes(scope))) {
		throw new AuthorizationError("Insufficient permissions");
	}
}

export class AuthenticationError extends Error {
	override name = "AuthenticationError";
}

export class AuthorizationError extends Error {
	override name = "AuthorizationError";
}
