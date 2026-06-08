const express = require("express");
const productRoutes = require("./routes/product.routes");

const app = express();

app.use(express.json());

app.use("/", productRoutes);

module.exports = app;
