/**
 * @module
 * @author Sergio Xalambrí
 * @copyright
 */
import { base64url } from "jose";

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class CodeChallenge {
	private static async generate(verifier: string, method: "S256" | "plain") {
		if (method === "plain") return verifier;
		let encoder = new TextEncoder();
		let data = encoder.encode(verifier);
		let hash = await crypto.subtle.digest("SHA-256", data);
		return base64url.encode(new Uint8Array(hash));
	}

	static async validate(
		verifier: string,
		challenge: string,
		method: "S256" | "plain" = "S256",
	) {
		let generatedChallenge = await CodeChallenge.generate(verifier, method);
		return generatedChallenge === challenge;
	}
}
