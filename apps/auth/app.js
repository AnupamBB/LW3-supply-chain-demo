const express = require("express");
const cors = require("cors");
const connectDB = require("../../common/db");
const { AUTH_PORT } = require("../../common/config");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
	res.json({ service: "auth", status: "ok" });
});

app.use((req, res) => {
	res.status(404).json({ error: "Route not found" });
});

connectDB().then(() => {
	app.listen(AUTH_PORT, () => {
		console.log(`Auth service running -> http://localhost:${AUTH_PORT}`);
	});
});
