var path = require('path'),
	config = require('./conf'),
	webpack = require('webpack'),
	webpackMerge = require('webpack-merge'),
	baseWebpackConfig = require('./webpack.base.conf.js'),
	CompressionWebpackPlugin = require('compression-webpack-plugin'),
	webpackConfig = webpackMerge(baseWebpackConfig, {
		entry: {
			main: './src/index.js'
		},
		devtool: false,
		output: {
			path: config.path.dist,
			filename: '[name].js',
			libraryTarget: 'umd',
			library: 'vue-l-carousel'
		},
		plugins: [
			new webpack.optimize.UglifyJsPlugin({
				compress: {
					warnings: false,
					dead_code: true,
					unused: true,
					collapse_vars: true,
					reduce_vars: true,
					loops: true
				}
			}),
			new webpack.optimize.OccurrenceOrderPlugin(),
			new CompressionWebpackPlugin({
				asset: '[path].gz[query]',
				algorithm: 'gzip',
				test: new RegExp(
					'\\.(' +
					['js', 'css'].join('|') +
					')$'
				),
				threshold: 10240,
				minRatio: 0.8
			})
		]
	});

delete webpackConfig.entry.app;

module.exports = webpackConfig;
