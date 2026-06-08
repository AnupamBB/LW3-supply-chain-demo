const express = require("express");
const cors = require("cors");
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
