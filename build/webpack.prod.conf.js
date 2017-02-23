var path = require('path'),
	utils = require('./utils'),
	config = require('./conf'),
	webpack = require('webpack'),
	webpackMerge = require('webpack-merge'),
	baseWebpackConfig = require('./webpack.base.conf.js'),
	ExtractTextPlugin = require('extract-text-webpack-plugin'),
	CompressionWebpackPlugin = require('compression-webpack-plugin'),
	webpackConfig = webpackMerge(baseWebpackConfig, {
		module: {
			loaders: utils.styleLoaders({extract: true})
		},
		entry: {
			main: './src/index.js'
		},
		devtool: false,
		output: {
			path: config.path.dist,
			filename: '[name].js',
			chunkFilename: '[id].[chunkhash].js',
			libraryTarget: 'umd',
			library: 'vue-l-carousel'
		},
		vue: {
			loaders: utils.cssLoaders({
				extract: true
			})
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
			new ExtractTextPlugin('[name].css'),
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
