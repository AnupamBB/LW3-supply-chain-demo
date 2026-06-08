const mongoose = require("mongoose");
const { MONGODB_URI } = require("./config");

let isConnected = false;

const connectDB = async () => {
	if (isConnected) return;
	try {
		await mongoose.connect(MONGODB_URI);
		isConnected = true;
		console.log(`MongoDB connected -> ${MONGODB_URI}`);
	} catch (err) {
		console.error("MongoDB connection failed:", err.message);
		process.exit(1);
	}
};

module.exports = connectDB;
