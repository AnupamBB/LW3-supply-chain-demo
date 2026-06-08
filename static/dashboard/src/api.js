const AUTH = "http://localhost:3001";
const PRODUCTS = "http://localhost:3002";

export function api(base, path, options = {}) {
	return fetch(base + path, {
		method: options.method || "GET",
		headers: {
			"Content-Type": "application/json",
			...(options.token
				? { Authorization: "Bearer " + options.token }
				: {}),
		},
		body: options.body ? JSON.stringify(options.body) : undefined,
	}).then(async (r) => {
		const data = await r.json().catch(() => ({}));
		if (!r.ok) throw new Error(data.error || "Request failed");
		return data;
	});
}

export { AUTH, PRODUCTS };
