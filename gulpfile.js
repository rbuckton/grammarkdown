var fs = require('fs');
var gulp = require('gulp');
var tsb = require('gulp-tsb');
var mocha = require('gulp-mocha');
var gutil = require("gulp-util");
var del = require("del");

var sources = [
    "*.ts",
    "{bin,emitter,tests,typings}/**/*.ts"
];

var outputs = [
    "*.js?(.map)",
    "{bin,emitter,tests,typings}/**/*.js?(.map)",
    "!gulpfile.js"
];

var compilation = tsb.create({
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

gulp.task("clean", function (cb) {
    del(outputs, cb);
})

gulp.task("test", ["build"], function() {
    return gulp
        .src(["tests/index.js"], { read: false })
        .pipe(mocha({ reporter: 'dot' }))
        .on("error", function (e) { });
});

gulp.task("watch-build", function () {
    return gulp.watch(sources, ["build"]);
});

gulp.task("watch-test", function() {
    return gulp.watch(sources, ["build", "test"]);
});