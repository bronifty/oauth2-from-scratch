/**
 * This middleware is used to create an authenticated API client instance.
 *
 * It uses the access token stored in the context to create the client and
 * store it in the context so we can use it in the rest of the app to do
 * authenticated requests to the API.
 *
 * This could easily be done in each loader or action too, but there's a benefit
 * to do it here. Since the API client instance is shared between all the
 * loaders and actions, we can implement caching and other optimizations in the
 * API client itself.
 *
 * This is useful for example to avoid doing the same request multiple times in
 * the same request cycle, useful if multiple loaders may need to read the same
 * data from the API because they run all in parallel.
 * @module
 * @author Sergio Xalambrí
 * @copyright
 */
import type { unstable_MiddlewareFunction } from "react-router";
import {
	unstable_RouterContextProvider,
	unstable_createContext,
} from "react-router";
import { APIClient } from "~/clients/api";
import { getAccessToken } from "./refresh";

const apiContext = unstable_createContext<APIClient>();

export const apiClientMiddleware: unstable_MiddlewareFunction<
	Response
> = async ({ context }, next) => {
	let accessToken = getAccessToken(context);
	context.set(apiContext, new APIClient(accessToken));
	return await next();
};

export function getAPIClient(context: unstable_RouterContextProvider) {
	return context.get(apiContext);
}
