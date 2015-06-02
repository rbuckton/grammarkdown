var fs = require('fs');
var gulp = require('gulp');
var tsb = require('gulp-tsb');
var mocha = require('gulp-mocha');
var gutil = require("gulp-util");

var sources = [
    "*.ts",
    "bin/**/*.ts",
    "typings/**/*.d.ts"
];

var testSources = sources.concat([
    "tests/**/*.ts"
]);

var testOutputs = [
    "tests/index.js"
];

var compilation = tsb.create({
    "target": "es5",
    "module": "commonjs",
    "sourceMap": true
});

var testCompilation = tsb.create({
    "target": "es5",
    "module": "commonjs",
    "sourceMap": true
});

gulp.task("default", ["build"]);

gulp.task("build", function () {
    return gulp
        .src(sources)
        .pipe(compilation())
        .pipe(gulp.dest('.')); 
});

gulp.task("watch-build", function () {
    return gulp.watch(sources, ["build"]);
});

gulp.task("build-tests", function () {
    return gulp
        .src(testSources)
        .pipe(testCompilation())
        .pipe(gulp.dest('.'));
});

gulp.task("test", ["build-tests"], function() {
    return gulp
        .src(testOutputs, { read: false })
        .pipe(mocha({ reporter: 'dot' }))
        .on("error", function (e) { });
});

gulp.task("watch-test", ["build-tests", "test"], function() {
    gulp.watch(testSources, ["build-tests", "test"]);
});