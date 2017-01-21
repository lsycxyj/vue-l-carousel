module.exports = {
  extends: 'airbnb',
  plugins: [
    'html'
  ],
  rules: {
    indent: ['error', 'tab'],
    'no-tabs': 0,
    'linebreak-style': ['error', 'windows'],
    'no-mixed-spaces-and-tabs': ['error', 'smart-tabs'],
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0
  }
};
