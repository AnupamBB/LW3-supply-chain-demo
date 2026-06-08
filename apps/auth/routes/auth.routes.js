const express = require("express");
const controller = require("../controllers/auth.controller");
const authenticate = require("../../../common/middleware/authenticate");

const router = express.Router();

router.post("/login", controller.login);

router.get("/me", authenticate, controller.me);

module.exports = router;
