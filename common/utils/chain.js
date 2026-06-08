const crypto = require("crypto");

function stableStringify(value) {
	if (value === null || typeof value !== "object") {
		return JSON.stringify(value);
	}
	if (Array.isArray(value)) {
		return `[${value.map(stableStringify).join(",")}]`;
	}
	const keys = Object.keys(value).sort();
	return `{${keys
		.map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`)
		.join(",")}}`;
}

function computeEventHash({
	productId,
	type,
	payload,
	sequence,
	previousHash,
	createdAt,
}) {
	const canonical = stableStringify({
		productId: String(productId),
		type,
		payload: payload || {},
		sequence,
		previousHash: previousHash || null,
		createdAt: new Date(createdAt).toISOString(),
	});

	return crypto.createHash("sha256").update(canonical).digest("hex");
}

module.exports = { computeEventHash, stableStringify };
