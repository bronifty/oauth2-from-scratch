/**
 * @module
 * @author Sergio Xalambrí
 * @copyright
 */
import {
	Outlet,
	Scripts,
	ScrollRestoration,
	isRouteErrorResponse,
} from "react-router";
import type { Route } from "./+types/root";
import "~/styles.css";
import { sessionMiddleware } from "./middlewares/session";

/**
 * Here we're configuring the session middleware we create in the file
 * `web/app/middlewares/session.ts`. Because this is the `app/root` it means we
 * are always getting the session from the request for any possible route.
 */
export const unstable_middleware = [sessionMiddleware];

export default function App() {
	return <Outlet />;
}

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
			</head>
			<body>
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	let message = "Oops!";
	let details = "An unexpected error occurred.";
	let stack: string | undefined;

	if (isRouteErrorResponse(error)) {
		message = error.status === 404 ? "404" : "Error";
		details =
			error.status === 404
				? "The requested page could not be found."
				: error.statusText || details;
	} else if (import.meta.env.DEV && error && error instanceof Error) {
		details = error.message;
		stack = error.stack;
	}

	return (
		<main id="error-page">
			<h1>{message}</h1>
			<p>{details}</p>
			{stack && (
				<pre>
					<code>{stack}</code>
				</pre>
			)}
		</main>
	);
}
