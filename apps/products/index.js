const express = require("express");
const cors = require("cors");
const connectDB = require("../../common/db");
const { PRODUCTS_PORT } = require("../../common/config");
const productRoutes = require("./routes/product.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
	res.json({ service: "products", status: "ok" });
});

app.use("/products", productRoutes);

app.use((req, res) => {
	res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
	console.error("Unhandled error:", err.message);
	res.status(500).json({ error: "Internal server error" });
});

connectDB().then(() => {
	app.listen(PRODUCTS_PORT, () => {
		console.log(
			`Products service running -> http://localhost:${PRODUCTS_PORT}`,
		);
	});
});
