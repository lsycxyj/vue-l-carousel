var
	config = require('../config/dev.env'),
	webpack = require('webpack'),
	webpackMerge = require('webpack-merge'),
	baseWebpckConfig = require('./webpack.base.conf.js');

module.exports = webpackMerge(baseWebpckConfig, {
	// eval-source-map is faster for development
	devtool: '#source-map',
	plugins: [
		new webpack.DefinePlugin({
			'process.env': config
		})
	]
});
