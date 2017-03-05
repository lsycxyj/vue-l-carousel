module.exports = {
	extends: 'airbnb',
	plugins: [
		'html'
	],
	rules: {
		indent: ['error', 'tab'],
		eqeqeq: 0,
		'brace-style': ['error', 'stroustrup'],
		'one-var': 0,
		'no-tabs': 0,
		'no-shadow': 0,
		'no-mixed-operators': 0,
		'no-plusplus': 0,
		'no-param-reassign': 0,
		'no-multi-assign': 0,
		'no-var': 0,
		'linebreak-style': 0,
		'no-mixed-spaces-and-tabs': ['error', 'smart-tabs'],
		'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
		'import/prefer-default-export': 0
	}
};
