/**
 * @module
 * @author Sergio Xalambrí
 * @copyright
 */
import { Grant } from "./base";

export class RefreshTokenGrant extends Grant {
	override get grantType() {
		if (super.grantType === "refresh_token") return super.grantType;
		throw new Error("Invalid grant type");
	}

	get refreshToken() {
		return this.parser.string("refresh_token");
	}

	get scopes() {
		if (!this.parser.has("scope")) return [];
		return this.parser.string("scope").split(" ");
	}
}
