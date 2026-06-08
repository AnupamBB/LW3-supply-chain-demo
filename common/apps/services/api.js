const axios = require("axios");
const config = require("../../config");

const serviceUrls = {
	products: `http://localhost:${config.PRODUCTS_SERVICE_PORT}`,
	auth: `http://localhost:${config.AUTH_SERVICE_PORT}`,
};

let api = {};

api.makeRest = async function (serviceName, method, path, data = {}) {
	const baseUrl = serviceUrls[serviceName];
	const url = `${baseUrl}${path}`;

	try {
		const response = await axios({
			method,
			url,
			...(method === "GET" ? { params: data } : { data }),
		});

		return response.data;
	} catch (err) {
		if (err.response) {
			const normalized = new Error(
				err.response.data?.error || err.message,
			);
			normalized.statusCode = err.response.status;
			throw normalized;
		}
		const unavailable = new Error(
			`Upstream service "${serviceName}" is unavailable`,
		);
		unavailable.statusCode = 503;
		throw unavailable;
	}
};

module.exports = api;
