const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const config = require("../common/config");

const User = require("../services/auth/models/User");

const demoUsers = require("../common/utils/demoUsers");
const demoProducts = require("../common/utils/demoProducts");

const { computeEventHash } = require("../common/utils/chain");

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

	const events = [];
	const statusUpdates = [];

	for (let i = 0; i < Math.min(NUM_CHAINED, products.length); i++) {
		const product = products[i];

		let previousHash = null;
		let previousEventId = null;

		let t = product.createdAt.getTime();

		const firstId = new mongoose.Types.ObjectId();
		t += DAY_MS;

		const manufacturedCreatedAt = new Date(t);

		const manufacturedPayload = {
			note: `manufactured event for ${product.name}`,
			location: `factory-0`,
		};

		const manufacturedHash = computeEventHash({
			productId: product._id,
			type: "manufactured",
			payload: manufacturedPayload,
			sequence: 0,
			previousHash: null,
			createdAt: manufacturedCreatedAt,
		});

		events.push({
			_id: firstId,
			productId: product._id,
			type: "manufactured",
			payload: manufacturedPayload,
			sequence: 0,
			previousEventId: null,
			previousHash: null,
			hash: manufacturedHash,
			createdAt: manufacturedCreatedAt,
		});

		previousHash = manufacturedHash;
		previousEventId = firstId;

		let seq = 1;

		statusUpdates.push({
			updateOne: {
				filter: { _id: product._id },
				update: {
					$set: {
						status: "manufactured",
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
