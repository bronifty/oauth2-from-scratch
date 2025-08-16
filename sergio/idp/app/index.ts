/**
 * @module
 * @author Sergio Xalambrí
 * @copyright
 */
import Database from "bun:sqlite";
import {
	FormParser,
	ObjectParser,
	SearchParamsParser,
} from "@edgefirst-dev/data/parser";
import { JWK } from "@edgefirst-dev/jwt";
import { base64url } from "jose";
import { SCOPES, WELL_KNOWN } from "./config";
import db, { run } from "./db";
import migrate from "./db/migrate";
import seed from "./db/seed";
import { AccessToken } from "./entities/access-token";
import { AuthorizationCode } from "./entities/authorization-code";
import { AuthorizeCookie } from "./entities/authorize-cookie";
import { AuthorizeParams } from "./entities/authorize-params";
import { Client } from "./entities/client";
import { CodeChallenge } from "./entities/code-challenge";
import { AuthorizationCodeGrant } from "./entities/grant/authorization-code-grant";
import { Grant } from "./entities/grant/base";
import { ClientCredentialsGrant } from "./entities/grant/client-credentials-grant";
import { RefreshTokenGrant } from "./entities/grant/refresh-token-grant";
import { IdToken } from "./entities/id-token";
import { RefreshToken } from "./entities/refresh-token";
import { RegistrationParams } from "./entities/registration-params";
import { Subject } from "./entities/subject";
import { authenticate } from "./helpers/auth";
import env from "./helpers/env";
import { sign, signingKeys } from "./helpers/keys";
import { logRequest } from "./helpers/logger";
import { badRequest, tokens } from "./helpers/response";
import login from "./templates/login.html";
import notFound from "./templates/not-found.html";

const database = (await Bun.file("./db.sqlite").exists())
	? new Database("./db.sqlite")
	: new Database(":memory:");

run(database, () => {
	Bun.serve({
		port: env.port,
		routes: {
			"/healthcheck": {
				GET() {
					migrate(db());
					seed(db());
					return Response.json("OK", { status: 200, statusText: "OK" });
				},
			},

			[WELL_KNOWN.jwks_uri.pathname]: Response.json(JWK.toJSON(signingKeys)),
			"/.well-known/oauth-authorization-server": Response.json(WELL_KNOWN),

			"/login": login,
			"/": notFound,
			"/*": notFound,

			"/provider": {
				async GET(request: Bun.BunRequest) {
					logRequest(request);

					let authorizeCookie = AuthorizeCookie.fromRequest(request);
					if (!authorizeCookie) return Response.redirect("/login");

					let { searchParams } = new URL(request.url);
					let provider = searchParams.get("id") as "github";

					let subject = await authenticate(request, provider);
					if (subject instanceof Response) return subject;

					let code = AuthorizationCode.generate(subject, {
						audience: authorizeCookie.audience,
						redirectUri: authorizeCookie.redirectUri,
						clientId: authorizeCookie.clientId,
						pkce: {
							challenge: authorizeCookie.pkce.challenge,
							method: authorizeCookie.pkce.method,
						},
						scopes: authorizeCookie.scopes,
					});

					let url = new URL(authorizeCookie.redirectUri);
					url.searchParams.set("state", authorizeCookie.state);
					url.searchParams.set("code", code.id);

					return Response.redirect(url);
				},
			},

			[WELL_KNOWN.authorization_endpoint.pathname]: {
				async GET(request: Bun.BunRequest) {
					logRequest(request);

					let url = new URL(request.url);
					let params = new AuthorizeParams(url.searchParams);

					let client = Client.find(params.clientId);

					if (!client) {
						return badRequest(
							"invalid_request",
							"The client is not registered.",
						);
					}

					if (!client.callbacks.includes(params.redirectUri)) {
						return badRequest(
							"invalid_request",
							"The redirect URI does not match the client's registered redirect URI.",
						);
					}

					if (!client.allowedAudiences.includes(params.audience)) {
						return badRequest(
							"invalid_request",
							"The audience is not allowed.",
						);
					}

					if (params.scopes.length === 0) {
						return badRequest("invalid_request", "The scope is required.");
					}

					let hasOnlyAllowedScopes = params.scopes.every((scope) => {
						return client.allowedScopes.includes(scope);
					});

					if (!hasOnlyAllowedScopes) {
						return badRequest("invalid_request", "The scope is not allowed.");
					}

					let authorizeCookie = new AuthorizeCookie(
						new ObjectParser({
							clientId: client.id,
							redirectUri: params.redirectUri,
							state: params.state,
							audience: params.audience,
							pkce: {
								challenge: params.codeChallenge,
								method: params.codeChallengeMethod,
							},
							scopes: params.scopes,
						}),
					);

					request.cookies.set("idp:authorize", authorizeCookie.toString(), {
						path: "/",
						sameSite: "lax",
						httpOnly: true,
					});

					if (params.provider && params.provider === "github") {
						return Response.redirect("/provider?id=github");
					}

					return Response.redirect("/login");
				},

				async POST(request: Bun.BunRequest) {
					console.info("POST /authorize");

					let authorizeCookie = AuthorizeCookie.fromRequest(request);
					if (!authorizeCookie) return Response.redirect("/login");

					let subject = await authenticate(request, "form");
					if (subject instanceof Response) return subject;

					let code = AuthorizationCode.generate(subject, {
						audience: authorizeCookie.audience,
						redirectUri: authorizeCookie.redirectUri,
						clientId: authorizeCookie.clientId,
						pkce: {
							challenge: authorizeCookie.pkce.challenge,
							method: authorizeCookie.pkce.method,
						},
						scopes: authorizeCookie.scopes,
					});

					let url = new URL(authorizeCookie.redirectUri);
					url.searchParams.set("state", authorizeCookie.state);
					url.searchParams.set("code", code.id);

					return Response.redirect(url);
				},
			},

			[WELL_KNOWN.revocation_endpoint.pathname]: {
				async POST(request: Bun.BunRequest) {
					logRequest(request);

					let parser = new SearchParamsParser(
						new URLSearchParams(await request.text()),
					);

					let token = parser.has("token") ? parser.get("token") : null;

					if (!token) {
						return badRequest("invalid_request", "The token is required.");
					}

					let client = authorize(request);

					if (!client) {
						return badRequest("invalid_client", "The client is invalid.");
					}

					try {
						RefreshToken.revoke(token);
					} catch {
						// Ignore errors, we don't care if the token doesn't exist
					}

					return new Response(null, { status: 200 });
				},
			},

			[WELL_KNOWN.token_endpoint.pathname]: {
				async POST(request: Bun.BunRequest) {
					logRequest(request);

					let formData = await request.formData();
					let parser = new FormParser(formData);
					let body = new Grant(parser);

					if (body.grantType === "authorization_code") {
						let { code, redirectURI, codeVerifier } =
							new AuthorizationCodeGrant(parser);

						if (!code) return badRequest("invalid_request", "Missing code");

						let authorizationCode = AuthorizationCode.find(code);

						if (authorizationCode.isExpired) {
							return badRequest("invalid_grant", "Code has expired");
						}

						if (authorizationCode.redirectUri !== redirectURI) {
							return badRequest(
								"invalid_redirect_uri",
								"Redirect URI mismatch",
							);
						}

						if (authorizationCode.pkce) {
							if (!codeVerifier) {
								return badRequest("invalid_grant", "Missing code_verifier");
							}

							let isValid = await CodeChallenge.validate(
								codeVerifier,
								authorizationCode.pkce.challenge,
								authorizationCode.pkce.method,
							);

							if (!isValid) {
								return badRequest(
									"invalid_grant",
									"Code verifier does not match",
								);
							}
						}

						let subject = Subject.find(authorizationCode.subjectId);
						if (!subject) {
							return badRequest("invalid_grant", "Subject not found");
						}

						let client = Client.find(authorizationCode.clientId);
						if (!client) {
							return badRequest("invalid_grant", "Client not found");
						}

						let refreshToken = RefreshToken.generate(subject, client, {
							audience: authorizationCode.audience,
						});

						let accessToken = await sign(
							AccessToken.generate(
								authorizationCode.audience,
								authorizationCode.subjectId,
								authorizationCode.scope.split(" "),
							),
						);

						let idToken = authorizationCode.scope.includes("openid")
							? await sign(IdToken.generate(subject, client))
							: undefined;

						return tokens({ accessToken, refreshToken, idToken });
					}

					if (body.grantType === "refresh_token") {
						let { refreshToken, scopes } = new RefreshTokenGrant(parser);

						if (!refreshToken) {
							return badRequest("invalid_request", "Missing refresh_token");
						}

						let token: RefreshToken | null = null;
						try {
							token = RefreshToken.find(refreshToken);
						} catch {
							return badRequest("invalid_grant", "Refresh token not found");
						}

						if (token) token.revoke();
						else {
							return badRequest("invalid_grant", "Refresh token not found");
						}

						let accessToken = await sign(
							AccessToken.generate(token.audience, token.subject.id, scopes),
						);

						let newRefreshToken = RefreshToken.generate(
							token.subject,
							token.client,
							{ audience: token.audience },
						);

						return tokens({ accessToken, refreshToken: newRefreshToken });
					}

					if (body.grantType === "client_credentials") {
						let { audience, scopes } = new ClientCredentialsGrant(parser);
						if (!audience)
							return badRequest("invalid_request", "Missing audience");

						let authorization = request.headers.get("Authorization");

						if (!authorization) {
							return badRequest(
								"invalid_request",
								"Missing Authorization header",
							);
						}

						let [type, token] = authorization.split(" ");

						if (type !== "Basic") {
							return badRequest(
								"invalid_request",
								"Invalid Authorization type",
							);
						}

						if (!token) {
							return badRequest("invalid_request", "Missing token");
						}

						let [clientId, clientSecret] = new TextDecoder()
							.decode(base64url.decode(token))
							.split(":");

						if (!clientId || !clientSecret) {
							return badRequest("invalid_request", "Invalid token");
						}

						let client = Client.find(clientId);
						if (!client) return badRequest("invalid_client", "Invalid client");
						if (client.secret !== clientSecret) {
							return badRequest("invalid_client", "Invalid client");
						}

						if (!client.allowedAudiences.includes(audience)) {
							return badRequest("invalid_client", "Invalid audience");
						}

						if (scopes) {
							let allowedScopes = client.allowedScopes ?? [];
							let invalidScopes = scopes.filter(
								(scope) => !allowedScopes.includes(scope),
							);

							if (invalidScopes.length > 0) {
								let list = new Intl.ListFormat("en", {
									style: "long",
									type: "conjunction",
								});

								return badRequest(
									"invalid_scope",
									`Invalid scopes ${list.format(invalidScopes)}`,
								);
							}
						}

						let accessToken = await sign(
							AccessToken.generate(audience, clientId, scopes),
						);

						return tokens({ accessToken });
					}

					return badRequest(
						"unsupported_grant_type",
						"The grant type is not supported.",
					);
				},
			},

			[WELL_KNOWN.token_introspection_endpoint.pathname]: {
				async POST(request: Bun.BunRequest) {
					logRequest(request);

					let parser = new SearchParamsParser(
						new URLSearchParams(await request.text()),
					);

					let token = parser.has("token") ? parser.get("token") : null;
					let tokenTypeHint = parser.has("token_type_hint")
						? parser.get("token_type_hint")
						: null;

					if (tokenTypeHint !== "access_token") {
						return badRequest("invalid_request", "Invalid token type hint");
					}

					if (!token) {
						return badRequest("invalid_request", "The token is required.");
					}

					let client = authorize(request);

					if (!client) {
						return badRequest("invalid_client", "The client is invalid.");
					}

					if (!client.allowedScopes.includes("introspect")) {
						return badRequest(
							"invalid_scope",
							"The client is not allowed to introspect tokens.",
						);
					}

					try {
						let jwt = await AccessToken.verify(token, signingKeys, {
							audience: env.audience,
							issuer: env.issuer,
						});

						return Response.json({
							active: true,
							aud: jwt.audience,
							exp: jwt.expirationTime,
							iat: jwt.issuedAt.getTime(),
							iss: jwt.issuer,
							jti: jwt.id,
							nbf: jwt.notBefore?.getTime(),
							sub: jwt.subject,
							scope: jwt.scope,
						});
					} catch (error) {
						return Response.json({ active: false });
					}
				},
			},

			[WELL_KNOWN.userinfo_endpoint.pathname]: {
				async GET(request: Bun.BunRequest) {
					logRequest(request);

					let header = request.headers.get("Authorization");
					if (!header) return badRequest("invalid_request", "Missing token");

					let [type, token] = header.split(" ");

					if (type !== "Bearer") {
						return badRequest("invalid_request", "Invalid token");
					}

					if (!token) return badRequest("invalid_request", "Missing token");

					try {
						let jwt = await AccessToken.verify(token, signingKeys, {
							audience: env.audience,
							issuer: env.issuer,
						});

						let subject = Subject.find(jwt.subject);
						if (!subject) return Response.json({ active: false });

						return Response.json({ sub: subject.id, email: subject.email });
					} catch (error) {
						return badRequest("invalid_token", "Invalid token");
					}
				},
			},

			[WELL_KNOWN.registration_endpoint.pathname]: {
				async POST(request: Bun.BunRequest) {
					logRequest(request);

					let params = new RegistrationParams(
						new URLSearchParams(await request.text()),
					);

					if (
						!params.scope
							.split(" ")
							.every((scope) => SCOPES.some((s) => s.id === scope))
					) {
						return badRequest(
							"invalid_scope",
							"One or more scopes are invalid.",
						);
					}

					let client = Client.register({
						name: params.clientName,
						callbacks: params.redirectUris,
						allowedScopes: params.scope.split(" "),
						allowedAudiences: [env.audience],
					});

					return Response.json({
						client_id: client.id,
						client_secret: client.secret,
						client_id_issued_at: client.createdAt,
						client_secret_expires_at: 0,
						redirect_uris: client.callbacks,
						token_endpoint_auth_method: "client_secret_basic",
						grant_types: ["authorization_code"],
						response_types: ["code", "token"],
						scope: client.allowedScopes.join(" "),
					});
				},
			},
		},
	});

	function authorize(request: Request) {
		let authorization = request.headers.get("Authorization");
		if (!authorization) return null;

		let [scheme, token] = authorization.split(" ");

		if (scheme !== "Basic") return null;
		if (!token) return null;

		let decoded = new TextDecoder().decode(base64url.decode(token));

		let [id, secret] = decoded.split(":");

		if (!id || !secret) return null;

		let client = Client.find(id);
		if (!client) return null;

		if (client.secret === secret) return client;
		return null;
	}
});
