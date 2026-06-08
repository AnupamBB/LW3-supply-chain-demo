const app = require("./app");
const connectDB = require("../../common/db");
const config = require("../../common/config");

(async () => {
	await connectDB();

	const servicePort = config.AUTH_SERVICE_PORT;
	app.listen(servicePort, () => {
		console.log(`Auth service running on ${servicePort}`);
	});
})();
