/* global process */
var fs = require('fs');
var gulp = require('gulp');
var tsb = require('gulp-tsb');
var mocha = require('gulp-mocha');
var gutil = require("gulp-util");
var del = require("del");
var child_process = require("child_process");

var sources = [
    "*.ts",
    "{lib,bin,emitter,tests,typings}/**/*.ts"
];

var outputs = [
    "*.js?(.map)",
    "{lib,bin,emitter,tests,typings}/**/*.js?(.map)",
    "!gulpfile.js"
];

var compilation = tsb.create({
    "target": "es5",
    "module": "commonjs",
    "sourceMap": true
});

var referenceBaselinesDir = "./tests/baselines/reference";
var localBaselinesDir = "./tests/baselines/local";

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

gulp.task("diff", function(cb) {
    diff(referenceBaselinesDir, localBaselinesDir, function (err) {
        if (err) cb(err);
        cb();
    })
});

gulp.task("update-es6-grammar", function (cb) {
    var cmd = process.argv[0];
    var args = ["./bin/grammarkdown", "-o", "./spec/es6.grammar.html", "-f", "ecmarkup", "./tests/resources/es6.grammar"];
    exec(cmd, args, cb);
});

gulp.task("update-typescript-grammar", function (cb) {
    var cmd = process.argv[0];
    var args = ["./bin/grammarkdown", "-o", "./spec/typescript.grammar.html", "-f", "ecmarkup", "./tests/resources/typescript.grammar"];
    exec(cmd, args, cb);
});

gulp.task("update-pages", ["update-es6-grammar", "update-typescript-grammar"], function (cb) {
    var ecmarkup = process.env["ECMARKUP"];
    if (!ecmarkup) {
        throw new Error("Please set the 'ECMARKUP' environment variable.");
    }
    
    advanceToUpdateES6Grammar();
    
    function updateES6Grammar(cb) {
        exec(process.argv[0], ["./bin/grammarkdown", "-o", "./spec/es6.grammar.html", "-f", "ecmarkup", "./tests/resources/es6.grammar"], cb);
    }
    
    function updateTypeScriptGrammar(cb) {
        exec(process.argv[0], ["./bin/grammarkdown", "-o", "./spec/typescript.grammar.html", "-f", "ecmarkup", "./tests/resources/typescript.grammar"], cb);
    }
    
    function updateES6Page(cb) {
        exec(ecmarkup, ["./spec/es6.html", "./spec/_es6.html"], cb);
    }
    
    function updateTypeScriptPage(cb) {
        exec(ecmarkup, ["./spec/typescript.html", "./spec/_typescript.html"], cb);
    }
    
    function updatePages(cb) {
        child_process.exec("git checkout gh-pages && rm es6.html && mv _es6.html es6.html && git add es6.html && rm typescript.html && mv _typescript.html typescript.html && git add typescript.html", cb);
    }
    
    function advanceToUpdateES6Grammar() {
        return updateES6Grammar(advanceToUpdateES6Page);
    }
    
    function advanceToUpdateES6Page(err) {
        return err ? cb(err) : updateES6Page(advanceToUpdateTypeScriptGrammar);
    }
    
    function advanceToUpdateTypeScriptGrammar(err) {
        return err ? cb(err) : updateTypeScriptGrammar(advanceToUpdateTypeScriptPage);
    }
    
    function advanceToUpdateTypeScriptPage(err) {
        return err ? cb(err) : updateTypeScriptPage(advanceToUpdatePages);
    }
    
    function advanceToUpdatePages(err) {
        return err ? cb(err) : updatePages(cb);
    }
});

function diff(reference, local, cb) {
    var diff = process.env["DIFF"];
    if (!diff) {
        throw new Error("Please set the 'DIFF' environment variable.");
    }
    
    exec(diff, [reference, local], cb);
}

function exec(cmd, args, cb) {
    var done = false;
    console.log(cmd + " " + args.join(" "));
    child_process.spawn(cmd, args, {
        stdio: [process.stdin, process.stdout, process.stderr]
    })
    .on("error", function (e) {
        if (done) return;
        done = true;
        cb(e);
    })
    .on("close", function () {
        if (done) return;
        done = true;
        cb();
    });
}