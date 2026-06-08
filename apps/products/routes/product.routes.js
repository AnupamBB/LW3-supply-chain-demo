const express = require("express");
const router = express.Router();
const authenticate = require("../../../common/middleware/authenticate");
const authorize = require("../../../common/middleware/authorize");
const { apiLimiter } = require("../../../common/middleware/rateLimiter");
const product = require("../controllers/product.controller");

router.use(authenticate);
router.use(apiLimiter);

router.post("/", authorize("internal"), product.createProduct);
router.post("/:id/events", authorize("internal"), product.addEvent);

router.get("/", product.listProducts);
router.get("/:id", product.getProduct);
router.get("/:id/verify", product.verifyChain);

module.exports = router;
