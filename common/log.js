const log = {
	child: ({ module }) => ({
		info: (...args) => console.log(`[${module}]`, ...args),
		error: (...args) => console.error(`[${module}]`, ...args),
		warn: (...args) => console.warn(`[${module}]`, ...args),
	}),
};

module.exports = log;
