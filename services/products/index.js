const app = require("./app");
const connectDB = require("../../common/db");
const config = require("../../common/config");

(async () => {
	await connectDB();

	app.listen(config.PRODUCTS_PORT, () => {
		console.log(`Products service running on ${config.PRODUCTS_PORT}`);
	});
})();
