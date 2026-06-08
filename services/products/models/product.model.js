const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, trim: true },
		description: { type: String, trim: true },
		partnerId: { type: String, required: true, index: true },
		status: {
			type: String,
			enum: ["manufactured", "shipped", "received", "sold", "recycled"],
			default: "manufactured",
			index: true,
		},
	},
	{
		timestamps: true,
	},
);

productSchema.index({ partnerId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model("Product", productSchema);
