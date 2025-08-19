/**
 * @module
 * @author Sergio Xalambrí
 * @copyright
 */
import { Grant } from "./base";

export class AuthorizationCodeGrant extends Grant {
	override get grantType() {
		if (super.grantType === "authorization_code") return super.grantType;
		throw new Error("Invalid grant type");
	}

	get code() {
		if (this.parser.has("code")) return this.parser.string("code");
		return null;
	}

	get redirectURI() {
		if (this.parser.has("redirect_uri")) {
			return this.parser.string("redirect_uri");
		}
		return null;
	}

	get codeVerifier() {
		if (this.parser.has("code_verifier")) {
			return this.parser.string("code_verifier");
		}
		return null;
	}
}
