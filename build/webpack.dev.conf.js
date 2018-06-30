const webpack = require('webpack'),
	webpackMerge = require('webpack-merge'),
	baseWebpackConfig = require('./webpack.base.conf.js'),
	FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');

module.exports = webpackMerge(baseWebpackConfig, {
	// eval-source-map is faster for development
	devtool: '#eval-source-map',
	mode: 'development',
	plugins: [
		new FriendlyErrorsWebpackPlugin(),
	],
});
