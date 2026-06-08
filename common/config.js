const path = require("path");

require("dotenv").config({
	path: path.resolve(__dirname, "../.env"),
});

module.exports = {
	MONGODB_URI:
		process.env.MONGODB_URI || "mongodb://localhost:27017/supply-chain",
	JWT_SECRET: process.env.JWT_SECRET || "dev-secret-change-me",

	AUTH_PORT: process.env.AUTH_PORT || 3001,
	PRODUCTS_PORT: process.env.PRODUCTS_PORT || 3002,

	PRODUCTS_SERVICE_PORT: process.env.PRODUCTS_SERVICE_PORT || 3003,
	AUTH_SERVICE_PORT: process.env.AUTH_SERVICE_PORT || 3004,
};
