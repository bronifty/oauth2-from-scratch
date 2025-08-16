/**
 * @module
 * @author Sergio Xalambrí
 * @copyright
 */
import { expect, test } from "@playwright/test";

test("can login using email and password", async ({ page }) => {
	await page.goto("/auth");

	await page.waitForLoadState("domcontentloaded");

	await expect(page).toHaveTitle("Login into Address Book");

	await page.getByPlaceholder("Email").fill("hello@sergiodxa.com");
	await page.getByPlaceholder("Password").fill("abcDEF123$%^");
	await page.getByRole("button", { name: "Login", exact: true }).click();

	await page.waitForLoadState("domcontentloaded");
});
