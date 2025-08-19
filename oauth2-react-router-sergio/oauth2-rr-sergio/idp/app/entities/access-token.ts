/**
 * @module
 * @author Sergio Xalambrí
 * @copyright
 */
import { JWT } from "@edgefirst-dev/jwt";
import { ACCESS_TOKEN_TTL } from "../config";
import env from "../helpers/env";

export class AccessToken extends JWT {
	override get id() {
		return this.parser.string("jti");
	}

	override get audience() {
		return this.parser.string("aud");
	}

	override get expiresIn() {
		return this.parser.number("exp");
	}

	override get issuedAt() {
		return new Date(this.parser.number("iat"));
	}

	override get issuer() {
		return this.parser.string("iss");
	}

	override get subject() {
		return this.parser.string("sub");
	}

	get scope() {
		if (!this.parser.has("scope")) return null;
		return this.parser.string("scope");
	}

	get scopes() {
		if (!this.scope) return [];
		return this.scope.split(" ");
	}

	static generate(audience: string, userId: string, scopes?: string[]) {
		return new AccessToken({
			aud: audience,
			exp: Date.now() + ACCESS_TOKEN_TTL,
			iat: Date.now(),
			iss: env.issuer,
			jti: crypto.randomUUID(),
			sub: userId,
			scope: scopes?.join(" "),
		});
	}
}
