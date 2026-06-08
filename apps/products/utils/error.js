const makeError = (err) => {
	return {
		error: err.message || "Something went wrong",
		code: err.code || "ERR_INTERNAL",
		status: err.statusCode || 500,
	};
};

module.exports = makeError;
