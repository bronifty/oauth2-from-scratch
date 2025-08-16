import { defineConfig, devices } from "@playwright/test";
import "dotenv/config";

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
	testDir: "./tests",
	testMatch: "**/*.e2e.ts",
	fullyParallel: false,
	quiet: !!process.env.CI,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: "html",
	use: {
		baseURL: "http:/localhost:3000",
		trace: "on-first-retry",
		video: "retry-with-video",
	},
	projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
