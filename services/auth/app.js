const express = require("express");
const authRoutes = require("./routes/auth.routes");
const log = require("../../common/log").child({ module: "services/auth/app" });

const app = express();

app.use(express.json());

app.use("/", authRoutes);

app.use((req, res) => {
	res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
	const status = err.statusCode || 500;
	if (status >= 500) {
		log.error(err, "unhandled service error");
	}
	res.status(status).json({ error: err.message || "Internal server error" });
});

module.exports = app;
