/**
 * The IDToken class is a JWT that represents the payload of an ID token
 * received from the Authorization Server.
 *
 * Here we define extra properties that we want to extract from the JWT payload,
 * like the issuer, subject, and email address of the user.
 * @module
 * @author Sergio Xalambrí
 * @copyright
 */
import { JWT } from "@edgefirst-dev/jwt";

export class IDToken extends JWT {
	override get issuer() {
		return this.parser.string("iss");
	}

	override get subject() {
		return this.parser.string("sub");
	}

	get email() {
		return this.parser.string("email");
	}
}
