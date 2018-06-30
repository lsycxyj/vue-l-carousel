module.exports = {
	plugins: {
		postcss: [
			require('autoprefixer')({
				browsers: ['iOS >= 6', 'Android >= 2.3', 'IE >= 9', 'Firefox >= 4', 'Opera >= 6'],
			}),
		],
	},
};
