var
	webpackMerge = require('webpack-merge'),
	baseWebpckConfig = require('./webpack.base.conf.js');

module.exports = webpackMerge(baseWebpckConfig, {
	// eval-source-map is faster for development
	devtool: '#source-map'
});
