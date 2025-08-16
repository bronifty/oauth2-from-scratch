import { JWT } from "@edgefirst-dev/jwt";
import { ID_TOKEN_TTL } from "../config";
import env from "../helpers/env";
import type { Client } from "./client";
import type { Subject } from "./subject";

export class IdToken extends JWT {
	static generate(subject: Subject, client: Client) {
		return new IdToken({
			sub: subject.id,
			email: subject.email,
			iss: env.issuer,
			audience: client.id,
			jti: crypto.randomUUID(),
			exp: Date.now() + ID_TOKEN_TTL,
			iat: Date.now(),
		});
	}
}
