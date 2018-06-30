const path = require('path'),
	utils = require('./utils'),
	config = require('./conf'),
	webpack = require('webpack'),
	UglifyJsPlugin = require('uglifyjs-webpack-plugin'),
	webpackMerge = require('webpack-merge'),
	baseWebpackConfig = require('./webpack.base.conf.js'),
	CompressionWebpackPlugin = require('compression-webpack-plugin'),
	MiniCssExtractPlugin = require('mini-css-extract-plugin'),
	webpackConfig = webpackMerge(baseWebpackConfig, {
		entry: {
			main: './src/index.js',
		},
		devtool: false,
		mode: 'production',
		output: {
			path: config.path.dist,
			filename: '[name].js',
			chunkFilename: '[id].[chunkhash].js',
			libraryTarget: 'umd',
			library: 'vue-l-carousel',
		},
		optimization: {
			minimizer: [
				new UglifyJsPlugin({
					uglifyOptions: {
						compress: {
							warnings: false,
							dead_code: true,
							unused: true,
							collapse_vars: true,
							reduce_vars: true,
							loops: true,
						},
						// TODO Somehow not work
						comments: /@preserve/i,
					},
				}),
			],
		},
		plugins: [
			new MiniCssExtractPlugin({
				filename: 'main.css',
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
				minRatio: 0.8,
			}),
		],
	});

delete webpackConfig.entry.app;

module.exports = webpackConfig;
