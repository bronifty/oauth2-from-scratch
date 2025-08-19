/**
 * @module
 * @author Sergio Xalambrí
 * @copyright
 */
import { Data } from "@edgefirst-dev/data";
import { SearchParamsParser } from "@edgefirst-dev/data/parser";

export class AuthorizeParams extends Data<SearchParamsParser> {
	constructor(searchParams: URLSearchParams) {
		super(new SearchParamsParser(searchParams));
	}

	get provider() {
		if (this.parser.has("provider")) return this.parser.get("provider");
		return null;
	}

	get responseType() {
		return this.parser.get("response_type");
	}

	get redirectUri() {
		return this.parser.get("redirect_uri");
	}

	get state() {
		return this.parser.get("state");
	}

	get clientId() {
		return this.parser.get("client_id");
	}

	get audience() {
		return this.parser.get("audience");
	}

	get codeChallenge() {
		return this.parser.get("code_challenge");
	}

	get codeChallengeMethod() {
		let method = this.parser.get("code_challenge_method");
		return method === "S256" || method === "plain" ? method : "plain";
	}

	get scopes() {
		if (!this.parser.has("scope")) return [];
		return this.parser.get("scope").split(" ");
	}
}
