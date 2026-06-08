const rateLimit = require("express-rate-limit");

const WINDOW_MS = 15 * 60 * 1000;

const PARTNER_MAX = 100;
const INTERNAL_MAX = 1000;

const apiLimiter = rateLimit({
	windowMs: WINDOW_MS,
	max: (req) => (req.user?.role === "internal" ? INTERNAL_MAX : PARTNER_MAX),
	keyGenerator: (req) => req.user?.partnerId || req.user?.id || req.ip,
	message: { error: "Too many requests, please try again later." },
	standardHeaders: true,
	legacyHeaders: false,
});

const partnerLimiter = rateLimit({
	windowMs: WINDOW_MS,
	max: PARTNER_MAX,
	message: { error: "Too many requests, please try again later." },
	standardHeaders: true,
	legacyHeaders: false,
});

const internalLimiter = rateLimit({
	windowMs: WINDOW_MS,
	max: INTERNAL_MAX,
	message: { error: "Rate limit exceeded." },
	standardHeaders: true,
	legacyHeaders: false,
});

module.exports = { apiLimiter, partnerLimiter, internalLimiter };
