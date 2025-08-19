/**
 * @module
 * @author Sergio Xalambrí
 * @copyright
 */
import { JWT } from "@edgefirst-dev/jwt";

export class AccessTokenJWT extends JWT {
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
}
