const service = require("./api");

let api = {};

api.login = async function ({ email, password }) {
	return service.makeRest("auth", "POST", "/login", { email, password });
};

module.exports = api;
