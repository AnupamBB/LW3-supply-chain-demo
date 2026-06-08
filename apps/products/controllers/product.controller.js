const productService = require("../../../common/apps/services/products");
const log = require("../../../common/log").child({
	module: "controllers/product",
});
const makeError = require("../utils/error");

let controller = {};

controller.createProduct = async function (req, res) {
	try {
		const { name, description, partnerId } = req.body;

		if (!name || !partnerId) {
			return res.status(400).send(
				makeError({
					message: "name and partnerId are required",
					statusCode: 400,
				}),
			);
		}

		const product = await productService.createProduct({
			name,
			description,
			partnerId,
		});
		return res.status(201).send(product);
	} catch (err) {
		log.error({ err: err, stack: err.stack }, "createProduct error");
		return res.status(err.statusCode || 500).send(makeError(err));
	}
};

controller.addEvent = async function (req, res) {
	try {
		const { id } = req.params;
		const { type, payload } = req.body;

		if (!type) {
			return res.status(400).send(
				makeError({
					message: "event type is required",
					statusCode: 400,
				}),
			);
		}

		const event = await productService.addEvent(id, { type, payload });
		return res.status(201).send(event);
	} catch (err) {
		log.error({ err: err, stack: err.stack }, "addEvent error");
		return res.status(err.statusCode || 500).send(makeError(err));
	}
};

controller.listProducts = async function (req, res) {
	try {
		const { status, partnerId, from, to, page = 1, limit = 20 } = req.query;

		const resolvedPartnerId =
			req.user.role === "partner" ? req.user.partnerId : partnerId;

		const filters = {
			...(status && { status }),
			...(resolvedPartnerId && { partnerId: resolvedPartnerId }),
			...((from || to) && {
				createdAt: {
					...(from && { $gte: new Date(from) }),
					...(to && { $lte: new Date(to) }),
				},
			}),
		};

		const result = await productService.listProducts(filters, {
			page: parseInt(page),
			limit: parseInt(limit),
		});

		return res.send(result);
	} catch (err) {
		log.error({ err: err, stack: err.stack }, "listProducts error");
		return res.status(err.statusCode || 500).send(makeError(err));
	}
};

controller.getProduct = async function (req, res) {
	try {
		const { id } = req.params;
		const product = await productService.getProductById(id);

		if (!product) {
			return res.status(404).send(
				makeError({
					message: "Product not found",
					statusCode: 404,
				}),
			);
		}

		if (
			req.user.role === "partner" &&
			product.partnerId !== req.user.partnerId
		) {
			return res
				.status(403)
				.send(makeError({ message: "Forbidden", statusCode: 403 }));
		}

		return res.send(product);
	} catch (err) {
		log.error({ err: err, stack: err.stack }, "getProduct error");
		return res.status(err.statusCode || 500).send(makeError(err));
	}
};

controller.verifyChain = async function (req, res) {
	try {
		const { id } = req.params;
		const product = await productService.getProductById(id);

		if (!product) {
			return res.status(404).send(
				makeError({
					message: "Product not found",
					statusCode: 404,
				}),
			);
		}

		if (
			req.user.role === "partner" &&
			product.partnerId !== req.user.partnerId
		) {
			return res
				.status(403)
				.send(makeError({ message: "Forbidden", statusCode: 403 }));
		}

		const result = await productService.verifyChain(id);
		return res.send(result);
	} catch (err) {
		log.error({ err: err, stack: err.stack }, "verifyChain error");
		return res.status(err.statusCode || 500).send(makeError(err));
	}
};

module.exports = controller;
