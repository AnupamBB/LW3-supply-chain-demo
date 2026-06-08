const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const config = require("../common/config");

const User = require("../services/auth/models/User");

const demoUsers = require("../services/auth/utils/demoUsers");
const demoProducts = require("../services/products/utils/demoProducts");
const LIFECYCLE = require("../services/products/utils/lifecycle");

const { computeEventHash } = require("../services/products/utils/chain");

const NUM_CHAINED = Number(process.env.SEED_CHAINED || 5);
const DAY_MS = 24 * 60 * 60 * 1000;

async function run() {
	await mongoose.connect(config.MONGODB_URI);
	console.log(
		`Running the script and connecting to mongodb URL -> ${config.MONGODB_URI}`,
	);

	const productsColl = mongoose.connection.collection("products");
	const eventsColl = mongoose.connection.collection("events");

	await productsColl.deleteMany({});
	await eventsColl.deleteMany({});
	console.log("Cleared products + events");

	await User.deleteMany({});
	await User.insertMany(
		demoUsers.map((u) => ({
			email: u.email,
			password: bcrypt.hashSync(u.password, 10),
			role: u.role,
			partnerId: u.partnerId,
		})),
	);
	console.log(`Inserted ${demoUsers.length} users`);

	const now = Date.now();

	const products = demoProducts.map((p, index) => {
		const _id = new mongoose.Types.ObjectId();

		return {
			_id,
			name: p.name,
			description: p.description,
			partnerId: p.partnerId,
			status: "manufactured",
			createdAt: new Date(now - index * DAY_MS),
			updatedAt: new Date(now - index * DAY_MS),
		};
	});

	await productsColl.insertMany(products);
	console.log(`Inserted ${products.length} products from file`);

	// Events
	const events = [];
	const statusUpdates = [];

	for (let i = 0; i < Math.min(NUM_CHAINED, products.length); i++) {
		const product = products[i];

		let previousHash = null;
		let previousEventId = null;
		let t = product.createdAt.getTime();

		for (let seq = 0; seq < LIFECYCLE.length; seq++) {
			const type = LIFECYCLE[seq];
			const _id = new mongoose.Types.ObjectId();

			t += DAY_MS;
			const createdAt = new Date(t);

			const payload = {
				note: `${type} event for ${product.name}`,
				location: `factory-${seq}`,
			};

			const hash = computeEventHash({
				productId: product._id,
				type,
				payload,
				sequence: seq,
				previousHash,
				createdAt,
			});

			events.push({
				_id,
				productId: product._id,
				type,
				payload,
				sequence: seq,
				previousEventId,
				previousHash,
				hash,
				createdAt,
			});

			previousHash = hash;
			previousEventId = _id;
		}

		statusUpdates.push({
			updateOne: {
				filter: { _id: product._id },
				update: {
					$set: {
						status: LIFECYCLE[LIFECYCLE.length - 1],
					},
				},
			},
		});
	}

	await eventsColl.insertMany(events);
	await productsColl.bulkWrite(statusUpdates);

	console.log(
		`Inserted ${events.length} events across ${statusUpdates.length} products`,
	);

	await mongoose.disconnect();
	console.log("Data seeded successfully.");
	process.exit(0);
}

run().catch((err) => {
	console.error("Seed failed:", err.message);
	process.exit(1);
});
