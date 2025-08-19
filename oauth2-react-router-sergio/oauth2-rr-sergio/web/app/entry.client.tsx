import { StrictMode, startTransition } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

startTransition(() => {
	hydrateRoot(
		document,
		<StrictMode>
			<HydratedRouter />
		</StrictMode>,
	);
});

/**
 * This block of code subscribes the browser to the `session` broadcast channel
 * and reloads the page when a "logout" message is received.
 *
 * This way, if the user has multiple tabs open and logs out in one of them,
 * the other tabs will also log out automatically.
 *
 * See `web/app/routes/logout.ts:36` to see where events are emitted.
 */
new BroadcastChannel("session").addEventListener(
	"message",
	(event: MessageEvent) => {
		if (event.data === "logout") window.location.reload();
	},
);
