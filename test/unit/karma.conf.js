// Karma configuration
// Generated on Mon Jan 23 2017 12:00:17 GMT+0800 (中国标准时间)

var path = require('path');
var merge = require('webpack-merge');
var baseConfig = require('../../build/webpack.base.conf');
var webpack = require('webpack');
var projectRoot = path.resolve(__dirname, '../../');

var webpackConfig = merge(baseConfig, {
	// use inline sourcemap for karma-sourcemap-loader
	devtool: '#inline-source-map',
	vue: {
		loaders: {
			js: 'babel-loader'
		}
	}
});

// no need for app entry during tests
delete webpackConfig.entry;
// library required
delete webpackConfig.externals;

// Use babel for test files too
webpackConfig.module.loaders.some(function (loader, i) {
	if (/^babel(-loader)?$/.test(loader.loader)) {
		loader.include.push(path.resolve(projectRoot, 'test/unit'));
		return true;
	}
});

module.exports = function (config) {
	config.set({

		// base path that will be used to resolve all patterns (eg. files, exclude)
		basePath: '',


		// frameworks to use
		// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
		frameworks: ['jasmine'],


		// list of files / patterns to load in the browser
		files: [
			'./index.js'
		],


		// list of files to exclude
		exclude: [],


		// preprocess matching files before serving them to the browser
		// available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
		preprocessors: {
			'./index.js': ['webpack', 'sourcemap']
		},


		// test results reporter to use
		// possible values: 'dots', 'progress'
		// available reporters: https://npmjs.org/browse/keyword/karma-reporter
		// add coverage support with babel's test plugins
		reporters: ['spec', 'coverage'],

		// webpack
		webpack: webpackConfig,
		webpackMiddleware: {
			noInfo: true
		},
		// Coverage options
		coverageReporter: {
			dir: './coverage',
			reporters: [
				{type: 'lcov', subdir: '.'},
				{type: 'text-summary'}
			]
		},

		// web server port
		port: 9876,


		// enable / disable colors in the output (reporters and logs)
		colors: true,


		// level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel: config.LOG_INFO,


		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: false,


		// start these browsers
		// available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
		browsers: [
			'PhantomJS',
			// This doesn't seem to work
			// 'Firefox',
			// Uncomment Chrome and IE for development since Travis doesn't have these browsers
			// 'Chrome',
			// 'IE',
			// Simulated events don't always work
			// 'Edge'
		],


		// Continuous Integration mode
		// if true, Karma captures browsers, runs the tests and exits
		singleRun: false,

		// Concurrency level
		// how many browser should be started simultaneous
		concurrency: Infinity
	});
};
