const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const { JWT_SECRET } = require("../../../common/config");
const log = require("../../../common/log").child({
	module: "services/auth/controllers/auth",
});

let controller = {};

controller.login = async function (req, res, next) {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			const err = new Error("email and password are required");
			err.statusCode = 400;
			throw err;
		}
		const user = await User.findOne({ email }).lean();
		const invalid = () => {
			const err = new Error("Invalid credentials");
			err.statusCode = 401;
			return err;
		};

		if (!user) throw invalid();

		const ok = await bcrypt.compare(password, user.password);
		if (!ok) throw invalid();

		const token = jwt.sign(
			{
				id: String(user._id),
				role: user.role,
				partnerId: user.partnerId || null,
			},
			JWT_SECRET,
			{ expiresIn: "1d" },
		);

		res.json({ token });
	} catch (err) {
		log.error(err, "login error");
		next(err);
	}
};

module.exports = controller;
