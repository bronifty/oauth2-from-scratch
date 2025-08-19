/**
 * @module
 * @author Sergio Xalambrí
 * @copyright
 */
export function validateArrayOfStrings(value: unknown): string[] {
	if (!Array.isArray(value)) {
		throw new TypeError("Value is not an array");
	}
	if (value.some((item) => typeof item !== "string")) {
		throw new TypeError("Value is not an array of strings");
	}
	return value as string[];
}
