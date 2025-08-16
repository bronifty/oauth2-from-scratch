/**
 * @module
 * @author Sergio Xalambrí
 * @copyright
 */
import { Data } from "@edgefirst-dev/data";
import { ObjectParser } from "@edgefirst-dev/data/parser";

export class AuthorizeCookie extends Data<ObjectParser> {
	get clientId() {
		return this.parser.string("clientId");
	}

	set clientId(value: string) {
		this.parser.set("clientId", value);
	}

	get redirectUri() {
		return this.parser.string("redirectUri");
	}

	set redirectUri(value: string) {
		this.parser.set("redirectUri", value);
	}

	get state() {
		return this.parser.string("state");
	}

	set state(value: string) {
		this.parser.set("state", value);
	}

	get audience() {
		return this.parser.string("audience");
	}

	set audience(value: string) {
		this.parser.set("audience", value);
	}

	get pkce() {
		return new AuthorizeCookie.PKCE(this.parser.object("pkce"));
	}

	set pkce(value: AuthorizeCookie.PKCE) {
		this.parser.set("pkce", value);
	}

	get scopes() {
		return this.parser.array("scopes").map((scope) => scope.toString());
	}

	set scopes(value: string[]) {
		this.parser.set("scopes", value);
	}

	override toJSON() {
		return {
			clientId: this.clientId,
			redirectUri: this.redirectUri,
			state: this.state,
			audience: this.audience,
			pkce: this.pkce,
			scopes: this.scopes,
		};
	}

	override toString() {
		return JSON.stringify(this.toJSON());
	}

	static fromRequest(request: Bun.BunRequest) {
		let cookie = request.cookies.get("idp:authorize");
		if (cookie) {
			return new AuthorizeCookie(new ObjectParser(JSON.parse(cookie)));
		}
		return null;
	}
}

export namespace AuthorizeCookie {
	export class PKCE extends Data<ObjectParser> {
		get challenge() {
			return this.parser.string("challenge");
		}

		set challenge(value: string) {
			this.parser.set("challenge", value);
		}

		get method() {
			let value = this.parser.string("method");
			if (value === "S256" || value === "plain") return value;
			throw new Error("Invalid PKCE method");
		}

		set method(value: "S256" | "plain") {
			this.parser.set("method", value);
		}

		override toJSON() {
			return { challenge: this.challenge, method: this.method };
		}

		override toString() {
			return JSON.stringify(this.toJSON());
		}
	}
}
