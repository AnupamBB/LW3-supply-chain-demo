const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
	{
		productId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Product",
			required: true,
			index: true,
			immutable: true,
		},
		type: {
			type: String,
			enum: ["manufactured", "shipped", "received", "sold", "recycled"],
			required: true,
			immutable: true,
		},
		payload: {
			type: mongoose.Schema.Types.Mixed,
			default: {},
			immutable: true,
		},
		sequence: { type: Number, required: true, immutable: true },
		previousEventId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Event",
			default: null,
			immutable: true,
		},
		previousHash: { type: String, default: null, immutable: true },
		hash: { type: String, required: true, immutable: true },

		createdAt: { type: Date, default: Date.now, immutable: true },
	},
	{
		timestamps: false,
	},
);

const blockMutation = (verb) =>
	function () {
		throw new Error(`Events are append-only and cannot be ${verb}`);
	};

["findOneAndUpdate", "updateOne", "updateMany", "replaceOne"].forEach((op) =>
	eventSchema.pre(op, blockMutation("modified")),
);
["findOneAndDelete", "deleteOne", "deleteMany"].forEach((op) =>
	eventSchema.pre(op, blockMutation("deleted")),
);

eventSchema.index({ productId: 1, sequence: 1 }, { unique: true });

module.exports = mongoose.model("Event", eventSchema);
