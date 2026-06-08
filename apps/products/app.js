const express = require("express");
const cors = require("cors");
const { PRODUCTS_PORT } = require("../../common/config");
const productRoutes = require("./routes/product.routes");

const app = express();
console.log("product app started");

app.use(cors());
app.use(express.json());

app.use("/products", productRoutes);

app.use((req, res) => {
	res.status(404).json({ error: "Route not found" });
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

app.listen(PRODUCTS_PORT, () => {
	console.log(
		`Products service running -> http://localhost:${PRODUCTS_PORT}`,
	);
});
