var
	webpack = require('webpack'),
	webpackMerge = require('webpack-merge'),
	baseWebpackConfig = require('./webpack.base.conf.js');

module.exports = webpackMerge(baseWebpackConfig, {
	// eval-source-map is faster for development
	devtool: '#eval-source-map'
});
