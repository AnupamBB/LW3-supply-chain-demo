const app = require("./app");
const connectDB = require("../../common/db");
const config = require("../../common/config");

(async () => {
	try {
		await connectDB();

		const servicePort = config.PRODUCTS_SERVICE_PORT;

		app.listen(servicePort, () => {
			console.log(
				`Products service running -> http://localhost:${servicePort}`,
			);
		});
	} catch (err) {
		console.error("Products service failed to start:", err);
		process.exit(1);
	}
})();
