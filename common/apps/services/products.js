const service = require("./api");

let api = {};

api.createProduct = async function (data) {
	let result = await service.makeRest("products", "POST", "/products", data);
	return result;
};

api.addEvent = async function (productId, data) {
	let result = await service.makeRest(
		"products",
		"POST",
		`/products/${productId}/events`,
		data,
	);
	return result;
};

api.listProducts = async function (filters, pagination) {
	let result = await service.makeRest("products", "GET", "/products", {
		...filters,
		...pagination,
	});
	return result;
};

api.getProductById = async function (id) {
	let result = await service.makeRest("products", "GET", `/products/${id}`);
	return result;
};

api.verifyChain = async function (id) {
	let result = await service.makeRest(
		"products",
		"GET",
		`/products/${id}/verify`,
	);
	return result;
};

module.exports = api;
