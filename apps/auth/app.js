const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");

const { AUTH_PORT } = require("../../common/config");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/", authRoutes);

app.use((req, res) => {
	res.status(404).json({
		error: "Route not found",
	});
});

app.use((err, req, res, next) => {
	const status = err.statusCode || 500;
	if (status >= 500) {
		console.error("unhandled service error:", err);
	}
	res.status(status).json({
		error: err.message || "Internal server error",
	});
});

app.listen(AUTH_PORT, () => {
	console.log(`Auth service running -> http://localhost:${AUTH_PORT}`);
});
