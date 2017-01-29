var path = require('path');

module.exports = {
	path: {
		dist: path.resolve(__dirname, '../dist'),
		demo: path.resolve(__dirname, '../demo'),
		demoJS: path.resolve(__dirname, '../demo/js'),
		// no e2e tests by now since it's too troublesome.
		// e2e: path.resolve(__dirname, '../test/e2e/pages'),
		// e2eJS: path.resolve(__dirname, '../test/e2e/pages/js')
	}
};