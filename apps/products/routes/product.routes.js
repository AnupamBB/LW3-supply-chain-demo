const express = require("express");
const router = express.Router();
const authenticate = require("../../../common/middleware/authenticate");
const authorize = require("../../../common/middleware/authorize");
const {
	partnerLimiter,
	internalLimiter,
} = require("../../../common/middleware/rateLimiter");
const product = require("../controllers/product.controller");

router.use("/", authenticate);

router.post("/", internalLimiter, authorize("internal"), product.createProduct);
router.post(
	"/:id/events",
	internalLimiter,
	authorize("internal"),
	product.addEvent,
);
router.get("/", partnerLimiter, product.listProducts);
router.get("/:id", partnerLimiter, product.getProduct);
router.get("/:id/verify", partnerLimiter, product.verifyChain);

module.exports = router;
