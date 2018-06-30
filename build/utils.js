exports.isProduction = function () {
	return process.env.NODE_ENV === 'production';
};

exports.isDevelopment = function () {
	return process.env.NODE_ENV === 'development';
};
