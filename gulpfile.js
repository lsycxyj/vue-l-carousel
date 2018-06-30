const gulp = require('gulp');
const gulpZip = require('gulp-zip');

gulp.task('zip', function () {
	return gulp.src([
		'.babelrc',
		'.editorconfig',
		'.eslintrc.js',
		'.gitignore',
		'.travis.yml',
		'LICENSE',
		'build/**/*',
		'config/**/*',
		'demo/**/*',
		'gulpfile.js',
		'package.json',
		'src/**/*',
		'src/**/.*',
		'test/**/*',
	], {
		base: '.',
	})
		.pipe(gulpZip('vue-l-carousel.zip'))
		.pipe(gulp.dest('.'));
});
