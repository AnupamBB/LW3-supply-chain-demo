const router = require("express").Router();

const controller = require("../controllers/product.controller");

router.post("/products", controller.createProduct);
router.post("/products/:id/events", controller.addEvent);

router.get("/products", controller.listProducts);
router.get("/products/:id", controller.getProductById);
router.get("/products/:id/verify", controller.verifyChain);

module.exports = router;
