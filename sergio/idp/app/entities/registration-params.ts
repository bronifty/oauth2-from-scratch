/**
 * @module
 * @author Sergio Xalambrí
 * @copyright
 */
import { Data } from "@edgefirst-dev/data";
import { SearchParamsParser } from "@edgefirst-dev/data/parser";
import { WELL_KNOWN } from "../config";
import { validateArrayOfStrings } from "../helpers/validations";

export class RegistrationParams extends Data<SearchParamsParser> {
	constructor(searchParams: URLSearchParams) {
		super(new SearchParamsParser(searchParams));
	}

	get redirectUris() {
		if (!this.parser.has("redirect_uris")) return [];
		return validateArrayOfStrings(JSON.parse(this.parser.get("redirect_uris")));
	}

	get clientName() {
		return this.parser.get("client_name");
	}

	get tokenEndpointAuthMethod() {
		let value = this.parser.get("token_endpoint_auth_method");
		if (WELL_KNOWN.token_endpoint_auth_methods_supported.includes(value)) {
			return value;
		}
		let list = new Intl.ListFormat("en", {
			type: "disjunction",
		});
		throw new Error(
			`Invalid token_endpoint_auth_method value: "${value}". Supported methods: ${list.format(
				WELL_KNOWN.token_endpoint_auth_methods_supported,
			)}`,
		);
	}

	get scope() {
		return this.parser.get("scope");
	}
}
