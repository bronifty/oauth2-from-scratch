/**
 * @module
 * @author Sergio Xalambrí
 * @copyright
 */
import { crud, index, route } from "@edgefirst-dev/crud-routes";
import type { RouteConfig } from "@react-router/dev/routes";

export default [
	...crud("contacts"),

	route("healthcheck", "routes/healthcheck.ts"),

	route("auth", "routes/auth.ts"),
	route("logout", "routes/logout.ts"),

	index("routes/index.ts"),
] satisfies RouteConfig;
