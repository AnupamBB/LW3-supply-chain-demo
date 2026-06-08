const Product = require("../models/product.model");
const Event = require("../models/event.model");
const { computeEventHash } = require("../../../common/utils/chain");
const log = require("../../../common/log").child({
	module: "services/products/controllers/product",
});

let controller = {};

controller.createProduct = async function (req, res, next) {
	try {
		const { name, description, partnerId } = req.body;
		const product = new Product({ name, description, partnerId });
		await product.save();
		res.status(201).json(product);
	} catch (err) {
		log.error(err, "createProduct error");
		next(err);
	}
};

controller.addEvent = async function (req, res, next) {
	try {
		const { id: productId } = req.params;
		const { type, payload } = req.body;

		const product = await Product.findById(productId).lean();
		if (!product) {
			return res.status(404).json({ error: "Product not found" });
		}

		const lastEvent = await Event.findOne({ productId })
			.sort({ sequence: -1 })
			.lean();

		const sequence = lastEvent ? lastEvent.sequence + 1 : 0;
		const previousHash = lastEvent ? lastEvent.hash : null;
		const previousEventId = lastEvent ? lastEvent._id : null;
		const createdAt = new Date();

		const hash = computeEventHash({
			productId,
			type,
			payload: payload || {},
			sequence,
			previousHash,
			createdAt,
		});

		const event = new Event({
			productId,
			type,
			payload: payload || {},
			sequence,
			previousEventId,
			previousHash,
			hash,
			createdAt,
		});

		try {
			await event.save();
		} catch (err) {
			if (err.code === 11000) {
				err.statusCode = 409;
				err.message = "Concurrent event append detected, please retry";
			}
			throw err;
		}

		await Product.findByIdAndUpdate(productId, { status: type });

		res.status(201).json(event);
	} catch (err) {
		log.error(err, "addEvent error");
		next(err);
	}
};

controller.listProducts = async function (req, res, next) {
	try {
		const { page = 1, limit = 20, status, partnerId, from, to } = req.query;
		const query = {};

		if (status) {
			query.status = status;
		}
		if (partnerId) {
			query.partnerId = partnerId;
		}

		if (from || to) {
			query.createdAt = {};

			if (from) {
				query.createdAt.$gte = new Date(from);
			}

			if (to) {
				query.createdAt.$lte = new Date(to);
			}
		}

		const skip = (Number(page) - 1) * Number(limit);

		const [products, total] = await Promise.all([
			Product.find(query)
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(Number(limit))
				.lean(),

			Product.countDocuments(query),
		]);

		res.json({
			data: products,
			total,
			page: Number(page),
			limit: Number(limit),
			pages: Math.ceil(total / Number(limit)),
		});
	} catch (err) {
		log.error(err, "listProducts error");
		next(err);
	}
};

controller.getProductById = async function (req, res, next) {
	try {
		const product = await Product.findById(req.params.id).lean();
		if (!product) return res.status(404).json({ error: "Not found" });

		const events = await Event.find({ productId: req.params.id })
			.sort({ sequence: 1 })
			.lean();

		res.json({ ...product, events });
	} catch (err) {
		log.error(err, "getProductById error");
		next(err);
	}
};

controller.verifyChain = async function (req, res, next) {
	try {
		const product = await Product.findById(req.params.id).lean();

		if (!product) {
			return res.status(404).json({
				error: "Product not found",
			});
		}

		const events = await Event.find({
			productId: req.params.id,
		})
			.sort({ sequence: 1 })
			.lean();

		if (events.length === 0) {
			return res.json({
				valid: true,
				message: "No events found",
				totalEvents: 0,
			});
		}

		const fail = (i, current, reason) =>
			res.json({
				valid: false,
				message: "Chain integrity check failed",
				brokenAt: { index: i, eventId: current._id, reason },
			});

		for (let i = 0; i < events.length; i++) {
			const current = events[i];
			const previous = i > 0 ? events[i - 1] : null;

			if (current.sequence !== i) {
				return fail(
					i,
					current,
					"sequence is out of order or has a gap",
				);
			}

			const expectedHash = computeEventHash(current);
			if (current.hash !== expectedHash) {
				return fail(
					i,
					current,
					"content hash mismatch (event was modified)",
				);
			}

			if (i === 0) {
				if (current.previousHash !== null || current.previousEventId) {
					return fail(
						i,
						current,
						"genesis event must not reference a previous event",
					);
				}
				continue;
			}

			if (current.previousHash !== previous.hash) {
				return fail(
					i,
					current,
					"previousHash does not match prior event",
				);
			}

			if (String(current.previousEventId) !== String(previous._id)) {
				return fail(
					i,
					current,
					"previousEventId does not match prior event",
				);
			}
		}

		res.json({
			valid: true,
			message: "Chain is intact",
			totalEvents: events.length,
		});
	} catch (err) {
		log.error(err, "verifyChain error");
		next(err);
	}
};

module.exports = controller;
