var path = require('path'),
	config = require('./conf');
var projectRoot = path.resolve(__dirname, '../');

module.exports = {
	entry: {
		app: './demo/src/main.js'
	},
	output: {
		path: config.path.demoJS,
		filename: '[name].js'
	},
	resolve: {
		extensions: ['', '.js', '.vue'],
		fallback: [path.join(__dirname, '../node_modules')],
		alias: {
			'vue$': 'vue/dist/vue.common.js'
		}
	},
	resolveLoader: {
		fallback: [path.join(__dirname, '../node_modules')]
	},
	module: {
		loaders: [
			{
				test: /\.vue$/,
				loader: 'vue-loader'
			},
			{
				test: /\.js$/,
				loader: 'babel-loader',
				include: projectRoot,
				exclude: /node_modules/
			}
		]
	}
};