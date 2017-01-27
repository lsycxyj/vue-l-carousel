var path = require('path'),
	config = require('./conf');
var projectRoot = path.resolve(__dirname, '../'),
	projectSrc = path.resolve(projectRoot, 'src'),
	projectDemo = path.resolve(projectRoot, 'demo');

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
		preLoaders: [
			{
				test: /\.js$/,
				loader: 'eslint',
				exclude: /node_modules/,
				include: [
					projectSrc
				]
			},
			{
				test: /\.vue$/,
				loader: 'eslint',
				exclude: /node_modules/,
				include: [
					projectSrc
				]
			}
		],
		loaders: [
			{
				test: /\.vue$/,
				loader: 'vue-loader'
			},
			{
				test: /\.js$/,
				loader: 'babel-loader',
				include: [
					projectSrc,
					projectDemo
				],
				exclude: /node_modules/
			}
		]
	},
	eslint: {
		formatter: require('eslint-friendly-formatter')
	},
	vue: {
		postcss: [
			require('autoprefixer')({
				browsers: ['last 2 versions']
			})
		]
	}
};
