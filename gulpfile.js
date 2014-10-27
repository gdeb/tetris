/*jslint node: true */
'use strict';

var gulp = require('gulp'),
    rimraf = require('rimraf'),
    runSequence = require('run-sequence'),
    browserify = require('gulp-browserify'),
    rename = require('gulp-rename');

var SRC = './src',
    BUILD = './dist';
//-----------------------------------------------------------------------------
gulp.task('clean', function (cb) {
    rimraf(BUILD, cb);
});

gulp.task('move-html', function () {
    return gulp.src(['src/**/*.html'])
        .pipe(gulp.dest(BUILD));
});

gulp.task('prepare-js', function() {
    return gulp.src(SRC + '/index.js')
        .pipe(browserify())
        .pipe(rename('app.js'))
        .pipe(gulp.dest(BUILD));
});

gulp.task('prepare-css', function () {
    return gulp.src(['src/**/*.css'])
        .pipe(gulp.dest(BUILD));
});

gulp.task('prepare', function (cb) {
    var tasks = [
        'move-html',
        'prepare-js',
        'prepare-css',
    ];
    runSequence('clean', tasks, cb);
});

gulp.task('watch', function (cb) {
    gulp.watch([SRC + '/**/*.html'], ['move-html']);
    gulp.watch([SRC + '/**/*.js'], ['prepare-js']);
    gulp.watch([SRC + '/**/*.css'], ['prepare-css']);
});

gulp.task('develop', function (cb) {
    runSequence('prepare', 'watch');
});
