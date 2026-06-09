export function decodeToken(token) {
	if (!token) return null;

	try {
		const base64 = token.split(".")[1];
		return JSON.parse(atob(base64));
	} catch (e) {
		return null;
	}
}

export function getAuth() {
	const token = localStorage.getItem("token");
	if (!token) return null;

	const payload = decodeToken(token);
	if (!payload) return null;

	return {
		token,
		role: payload.role,
		userId: payload.id,
		partnerId: payload.partnerId,
		exp: payload.exp,
	};
}
