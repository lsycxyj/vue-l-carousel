var path = require('path'),
	config = require('./conf');

module.exports = {
	entry: {
		app: './demo/src/main.js'
	},
	output:{
		path: config.path.demoJS,
		filename: '[name].js'
	},
	resolve: {
		extensions: ['', '.js', '.vue'],
		fallback: [path.join(__dirname, '../node_modules')]
	},
	loaders: [
		{
			test: /\.vue$/,
			loader: 'vue'
		},
		{
			test: /\.js$/,
			loader: 'babel',
			query: {
				presets: ["es2015", "stage-2"]
			}
		}
	]
};