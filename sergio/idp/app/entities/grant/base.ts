/**
 * @module
 * @author Sergio Xalambrí
 * @copyright
 */
import { Data } from "@edgefirst-dev/data";
import { FormParser } from "@edgefirst-dev/data/parser";

export class Grant extends Data<FormParser> {
	private supportedGrants = new Set([
		"authorization_code",
		"refresh_token",
		"client_credentials",
	]);

	get grantType() {
		let value = this.parser.string("grant_type");
		if (this.supportedGrants.has(value)) {
			return value as
				| "authorization_code"
				| "refresh_token"
				| "client_credentials";
		}
		throw new Error("Invalid grant type");
	}

	get clientID() {
		return this.parser.string("client_id");
	}

	get clientSecret() {
		return this.parser.string("client_secret");
	}
}
