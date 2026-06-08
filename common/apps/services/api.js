const axios = require("axios");
const config = require("../../config");

const serviceUrls = {
	products: `http://localhost:${config.PRODUCTS_PORT}`,
	auth: `http://localhost:${config.AUTH_PORT}`,
};

let api = {};

api.makeRest = async function (serviceName, method, path, data = {}) {
	const baseUrl = serviceUrls[serviceName];
	const url = `${baseUrl}${path}`;

	const response = await axios({
		method,
		url,
		...(method === "GET" ? { params: data } : { data }),
	});

	return response.data;
};

api.get = async function (serviceName, path, params = {}) {
	return api.makeRest(serviceName, "GET", path, params);
};

api.post = async function (serviceName, path, data = {}) {
	return api.makeRest(serviceName, "POST", path, data);
};

module.exports = api;
