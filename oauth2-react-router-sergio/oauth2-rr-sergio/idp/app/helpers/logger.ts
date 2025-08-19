export function logRequest(request: Bun.BunRequest) {
	let url = new URL(request.url);
	console.info(`IDP: ${request.method} ${url.pathname}${url.search}`);
}
