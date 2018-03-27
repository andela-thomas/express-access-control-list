'use strict';
const gulp = require('gulp');
const plugins = require('gulp-load-plugins')();
const paths = {
  tests: ['tests/**/**.spec.js'],
  scripts: ['lib/**', 'tests/**', '!tests/config/**.yml']
};

/**
 * - Gulp task for linting all js scripts
 */

gulp.task('lint', () => {
  return (
    gulp
      .src(paths.tests)
      .pipe(plugins.eslint())
      // eslint.format() outputs the lint results to the console.
      // Alternatively use eslint.formatEach() (see Docs).
      .pipe(plugins.eslint.format())
      // To have the process exit with an error code (1) on
      // lint error, return the stream and pipe to failAfterError last.
      .pipe(plugins.eslint.failAfterError())
  );
});
/**
 * Gulp task to run tests
 *
 */

gulp.task('test', ['pre-test'], () => {
  return gulp
    .src(paths.tests, { read: false })
    .pipe(plugins.mocha())
    .pipe(plugins.istanbul.writeReports())
    .pipe(plugins.istanbul.enforceThresholds({ thresholds: { global: 90 } }));
});

/**
 * Watch for changes and lint in all ours scripts and lints
 */
gulp.task('watch', () => gulp.watch(paths.scripts, ['lint']));

gulp.task('pre-test', () => {
  return gulp
    .src(['lib/**/*.js', 'index.js'])
    .pipe(plugins.istanbul())
    .pipe(plugins.istanbul.hookRequire());
});

/**
 * Start gulp
 */

gulp.task('default', ['lint', 'watch']);
