/**
 * The /healthcheck route is used to check the application is working correctly.
 *
 * Here we check the health of the issuer and resource servers, as our web app
 * depends on them to work correctly. If any of them is down, we return a 503
 * error. This is useful for load balancers and monitoring tools to check the
 * health of the application.
 * @module
 * @author Sergio Xalambrí
 * @copyright
 */
import env from "~/env";

export async function loader() {
	let responses = await Promise.all([
		fetch(new URL("/healthcheck", env.ISSUER_HOST)),
		fetch(new URL("/healthcheck", env.RESOURCE_HOST)),
	]);

	for (let response of responses) {
		if (response.ok) continue;
		return Response.json(
			{ message: "Healthcheck failed" },
			{ status: 503, statusText: "Service Unavailable" },
		);
	}

	return Response.json({ message: "Healthcheck successful" });
}
