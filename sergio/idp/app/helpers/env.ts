/**
 * @module
 * @author Sergio Xalambrí
 * @copyright
 */
import { Data } from "@edgefirst-dev/data";
import { ObjectParser } from "@edgefirst-dev/data/parser";

class Enviroment extends Data<ObjectParser> {
	get port() {
		if (this.parser.has("PORT")) return Number(this.parser.string("PORT"));
		return 4001;
	}

	get resourceHost() {
		return this.parser.string("RESOURCE_HOST");
	}

	get audience() {
		return this.parser.string("AUDIENCE");
	}

	get issuer() {
		return this.parser.string("ISSUER");
	}

	get issuerHost() {
		return this.parser.string("ISSUER_HOST");
	}

	get github() {
		return {
			clientId: this.parser.string("GH_CLIENT_ID"),
			clientSecret: this.parser.string("GH_CLIENT_SECRET"),
		};
	}
}

export default new Enviroment(new ObjectParser(process.env));
