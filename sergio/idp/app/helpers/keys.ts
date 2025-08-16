/**
 * @module
 * @author Sergio Xalambrí
 * @copyright
 */
import { JWK, JWT } from "@edgefirst-dev/jwt";
import storage from "./storage";

/**
 * These are the signing keys that we will use to sign the JWTs.
 */
export const signingKeys = await JWK.signingKeys(storage);

export function sign(jwt: JWT) {
	return jwt.sign(JWK.Algoritm.ES256, signingKeys);
}
