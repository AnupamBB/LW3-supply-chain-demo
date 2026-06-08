const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
	{
		productId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Product",
			required: true,
			index: true,
		},
		type: {
			type: String,
			enum: ["manufactured", "shipped", "received", "sold", "recycled"],
			required: true,
		},
		payload: { type: mongoose.Schema.Types.Mixed, default: {} },
		previousEventId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Event",
			default: null,
		},
		createdAt: { type: Date, default: Date.now, immutable: true },
	},
	{
		timestamps: false,
	},
);

eventSchema.pre("findOneAndUpdate", function () {
	throw new Error("Events are append-only and cannot be modified");
});

eventSchema.pre("findByIdAndUpdate", function () {
	throw new Error("Events are append-only and cannot be modified");
});

eventSchema.pre("updateOne", function () {
	throw new Error("Events are append-only and cannot be modified");
});

eventSchema.pre("updateMany", function () {
	throw new Error("Events are append-only and cannot be modified");
});

eventSchema.pre("findOneAndDelete", function () {
	throw new Error("Events are append-only and cannot be deleted");
});

eventSchema.pre("findByIdAndDelete", function () {
	throw new Error("Events are append-only and cannot be deleted");
});

eventSchema.pre("deleteOne", function () {
	throw new Error("Events are append-only and cannot be deleted");
});

eventSchema.pre("deleteMany", function () {
	throw new Error("Events are append-only and cannot be deleted");
});

eventSchema.index({ productId: 1, createdAt: 1 });

module.exports = mongoose.model("Event", eventSchema);
