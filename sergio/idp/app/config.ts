/**
 * Here it's centralized the configuration of the Authorization Server.
 *
 * Feel free to change the values of the configuration to adapt it to your
 * needs.
 * @module
 * @author Sergio Xalambrí
 * @copyright
 */
import { JWK } from "@edgefirst-dev/jwt";
import ms from "ms";
import env from "./helpers/env";

export const ACCESS_TOKEN_TTL = ms("5 seconds");
export const REFRESH_TOKEN_TTL = ms("30 days");
export const AUTHORIZATION_CODE_TTL = ms("1 minutes");
export const ID_TOKEN_TTL = ms("1 hour");

export const SCOPES = [
	{ id: "openid", name: "OpenID Connect" },
	{ id: "contacts:read:own", name: "Read own contacts" },
	{ id: "contacts:write:own", name: "Write own contacts" },
] as const;

/**
 * This is the public information about how to connect and use the Authorization
 * Server, while most of these configurations are only for the clients to know
 * how to connect to the server, some of them are also used by the server
 * itself to configure the server, particularly the endpoints.
 */
export const WELL_KNOWN = {
	issuer: env.issuer,
	authorization_endpoint: new URL("/authorize", env.issuerHost),
	claims_supported: ["aud", "exp", "iat", "iss", "sub", "email"],
	code_challenge_methods_supported: ["S256", "plain"],
	id_token_signing_alg_values_supported: [JWK.Algoritm.ES256],
	jwks_uri: new URL("/.well-known/jwks.json", env.issuerHost),
	registration_endpoint: new URL("/oidc/register", env.issuerHost),
	request_parameter_supported: false,
	request_uri_parameter_supported: false,
	response_modes_supported: ["query"],
	response_types_supported: ["code", "token"],
	revocation_endpoint: new URL("/oauth/revoke", env.issuerHost),
	scopes_supported: SCOPES.map((scope) => scope.id),
	subject_types_supported: ["public"],
	token_endpoint_auth_methods_supported: ["client_secret_basic"],
	token_endpoint: new URL("/oauth/token", env.issuerHost),
	token_introspection_endpoint: new URL("/oauth/introspect", env.issuerHost),
	userinfo_endpoint: new URL("/userinfo", env.issuerHost),
};
