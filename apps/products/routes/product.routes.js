const express = require("express");
const router = express.Router();
const product = require("../controllers/product.controller");

router.post("/", product.createProduct);
router.post("/:id/events", product.addEvent);

router.get("/", product.listProducts);
router.get("/:id", product.getProduct);
router.get("/:id/verify", product.verifyChain);

module.exports = router;
