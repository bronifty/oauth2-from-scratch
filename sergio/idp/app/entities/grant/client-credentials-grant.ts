/**
 * @module
 * @author Sergio Xalambrí
 * @copyright
 */
import { Grant } from "./base";

export class ClientCredentialsGrant extends Grant {
	override get grantType() {
		if (super.grantType === "client_credentials") return super.grantType;
		throw new Error("Invalid grant type");
	}

	get audience() {
		return this.parser.string("audience");
	}

	get scopes() {
		if (!this.parser.has("scope")) return [];
		return this.parser.string("scope").split(" ");
	}
}
