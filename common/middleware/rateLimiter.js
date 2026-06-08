const rateLimit = require("express-rate-limit");

const partnerLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 100,
	message: { error: "Too many requests, please try again later." },
	standardHeaders: true,
	legacyHeaders: false,
});

const internalLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 1000,
	message: { error: "Rate limit exceeded." },
	standardHeaders: true,
	legacyHeaders: false,
});

module.exports = { partnerLimiter, internalLimiter };
