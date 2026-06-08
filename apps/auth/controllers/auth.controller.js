const authService = require("../../../common/apps/services/auth");

let controller = {};

controller.login = async function (req, res) {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return res.status(400).json({
				error: "email and password are required",
			});
		}

		const result = await authService.login({ email, password });
		return res.json(result);
	} catch (err) {
		return res.status(err.statusCode || 500).json({
			error: err.message,
		});
	}
};

controller.me = async function (req, res) {
	return res.json({ user: req.user });
};

module.exports = controller;
