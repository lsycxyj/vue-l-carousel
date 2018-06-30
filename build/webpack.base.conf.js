const path = require('path'),
	config = require('./conf'),
	utils = require('./utils');
const webpack = require('webpack'),
	VueLoaderPlugin = require('vue-loader/lib/plugin'),
	LoaderOptionsPlugin = webpack.LoaderOptionsPlugin,
	MiniCssExtractPlugin = require('mini-css-extract-plugin'),
	projectRoot = path.resolve(__dirname, '../'),
	projectSrc = path.resolve(projectRoot, 'src'),
	projectDemo = path.resolve(projectRoot, 'demo');

const { isProduction } = utils;

module.exports = {
	entry: {
		app: path.resolve(config.path.demo, 'src/main.js'),
	},
	output: {
		path: config.path.demoJS,
		filename: '[name].js',
	},
	resolve: {
		extensions: ['.js', '.vue'],
		alias: {
			vue$: 'vue/dist/vue.esm.js',
		},
	},
	externals: {
		vue: 'Vue',
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				loader: 'eslint-loader',
				enforce: 'pre',
				exclude: /node_modules/,
				include: [
					projectSrc,
				],
			},
			{
				test: /\.vue$/,
				loader: 'eslint-loader',
				enforce: 'pre',
				exclude: /node_modules/,
				include: [
					projectSrc,
				],
			},
			{
				test: /\.vue$/,
				loader: 'vue-loader',
			},
			{
				test: /\.less$/,
				use: [
					isProduction() ? MiniCssExtractPlugin.loader : 'vue-style-loader',
					'css-loader',
					'postcss-loader',
					'less-loader',
				],
			},
			{
				test: /\.js$/,
				loader: 'babel-loader',
				include: [
					projectSrc,
					projectDemo,
				],
			},
		],
	},
	plugins: [
		new VueLoaderPlugin(),
		new LoaderOptionsPlugin({
			options: {
				eslint: {
					formatter: require('eslint-friendly-formatter'),
				},
			},
		}),
	],
};
