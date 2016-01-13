var gulp = require('gulp');

var shell = require('gulp-shell');

gulp.task('compile-typescript', function () {
    gulp.src('package.json').pipe(shell('tsc'));
});

gulp.task('build', ['compile-typescript']);