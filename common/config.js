require("dotenv").config();

module.exports = {
	MONGODB_URI: process.env.MONGODB_URI,
	JWT_SECRET: process.env.JWT_SECRET,
	AUTH_PORT: process.env.AUTH_PORT || 3001,
	PRODUCTS_PORT: process.env.PRODUCTS_PORT || 3002,
};
