/* global process */
var gulp = require("gulp")
  , gutil = require("gulp-util")
  , sourcemaps = require("gulp-sourcemaps")
  , tsb = require("gulp-tsb")
  , mocha = require("gulp-mocha")
  , emu = require("gulp-emu")
  , del = require("del")
  , spawn = require("child_process").spawn;

var lib = tsb.create("src/lib");
var tests = tsb.create("src/tests");

gulp.task("clean:lib", function (cb) { del(["lib/**/*"], cb); });
gulp.task("clean:tests", function (cb) { del(["tests/**/*", "!./tests/baselines/**"], cb); });
gulp.task("clean:baselines", function (cb) { del(["tests/baselines/local"], cb); });
gulp.task("clean", ["clean:lib", "clean:tests", "clean:baselines"]);

gulp.task("accept-baselines", function () {
    return gulp.src("tests/baselines/local/**/*")
        .pipe(gulp.dest("tests/baselines/reference"));
});

gulp.task("build:lib", function () {
    return lib.src()
        .pipe(sourcemaps.init())
        .pipe(lib.compile())
        .pipe(sourcemaps.write(".", { includeContent: false, destPath: "lib" }))
        .pipe(gulp.dest("lib"));
});

gulp.task("build:tests", ["build:lib"], function () {
    return tests.src()
        .pipe(sourcemaps.init())
        .pipe(tests.compile())
        .pipe(sourcemaps.write(".", { includeContent: false, destPath: "tests" }))
        .pipe(gulp.dest("tests"));
});

gulp.task("build", ["build:lib", "build:tests"]);

gulp.task("test:lib", ["build:tests", "clean:baselines"], function () {
    return gulp.src(["tests/index.js"], { read: false })
        .pipe(mocha({ reporter: "dot" }));
});

gulp.task("test:min", ["build:tests", "clean:baselines"], function () {
    return gulp.src(["tests/index.js"], { read: false })
        .pipe(mocha({ reporter: "min" }));
});

gulp.task("test", ["test:lib"]);

gulp.task("watch", ["build:tests"], function () {
    return gulp.watch(["src/**/*"], ["test:lib"]);
});

gulp.task("default", ["test"]);

gulp.task("diff", function () { return diff("tests/baselines/reference/", "tests/baselines/local/"); });

gulp.task("pages:checkout", function () { return git(["-C", "./pages", "pull", "--no-stat"]); });
gulp.task("pages:gmd:es6", ["build", "pages:checkout"], function () { return gmd("./spec/es6.grammar", "./spec/es6.grammar.html", "ecmarkup"); });
gulp.task("pages:gmd:typescript", ["build", "pages:checkout"], function () { return gmd("./spec/typescript.grammar", "./spec/typescript.grammar.html", "ecmarkup"); });
gulp.task("pages:gmd", ["pages:gmd:es6", "pages:gmd:typescript"]);
gulp.task("pages:emu", ["pages:gmd"], function () {
    return gulp.src(["./spec/es6.grammar.html", "./spec/typescript.grammar.html"])
        .pipe(emu({ js: true, css: true }))
        .pipe(gulp.dest("pages"));
});

gulp.task("pages", ["pages:emu"], function () {
    return Promise.resolve()
        .then(function () { return git(["-C", "./pages", "add", "."]); })
        .then(function () { return git(["-C", "./pages", "commit", "-m", "Deploy to GitHub Pages"]); })
        .then(function () { return git(["-C", "./pages", "push", "--force", "--quiet"]); });
});

function diff(remote, local) {
    var cmd = process.env.DIFF;
    if (!cmd) throw new Error("Please set the 'DIFF' environment variable.");
    return exec(cmd, [remote, local]);
}

function git(args) {
    return exec("git", args);
}

function gmd(inFile, outFile, format) {
    return exec(undefined, ["./bin/grammarkdown", inFile, "-o", outFile, "-f", format, "--emitLinks"]);
}

function exec(cmd, args) {
    return new Promise(function (resolve, reject) {
        gutil.log((cmd ? cmd + " " : "") + args.join(" "));
        spawn(cmd || process.argv[0], args, { stdio: "inherit" })
            .on("error", function (e) { reject(e); })
            .on("close", function (code) { code ? reject(new Error("Process exited with code: " + code)) : resolve(); });
    });
}