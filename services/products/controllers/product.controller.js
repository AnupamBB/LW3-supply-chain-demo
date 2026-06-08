const Product = require("../models/product.model");
const Event = require("../models/event.model");
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
			.sort({ createdAt: -1 })
			.lean();

		const event = new Event({
			productId,
			type,
			payload: payload || {},
			previousEventId: lastEvent ? lastEvent._id : null,
		});

		await event.save();

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
			.sort({ createdAt: 1 })
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
			.sort({ createdAt: 1 })
			.lean();

		if (events.length === 0) {
			return res.json({
				valid: true,
				message: "No events found",
				totalEvents: 0,
			});
		}

		for (let i = 0; i < events.length; i++) {
			const current = events[i];

			if (i === 0) {
				if (current.previousEventId !== null) {
					return res.json({
						valid: false,
						message: "Chain integrity check failed",
						brokenAt: {
							index: i,
							eventId: current._id,
							reason: "First event should not reference a previous event",
						},
					});
				}

				continue;
			}

			const previous = events[i - 1];

			if (String(current.previousEventId) !== String(previous._id)) {
				return res.json({
					valid: false,
					message: "Chain integrity check failed",
					brokenAt: {
						index: i,
						eventId: current._id,
						reason: "previousEventId mismatch",
					},
				});
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
