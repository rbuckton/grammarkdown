/* global process */
const gulp = require("gulp");
const gutil = require("gulp-util");
const sourcemaps = require("gulp-sourcemaps");
const tsb = require("gulp-tsb");
const mocha = require("gulp-mocha");
const emu = require("gulp-emu");
const del = require("del");
const spawn = require("child_process").spawn;
const lib = tsb.create("src/lib");
const tests = tsb.create("src/tests");

gulp.task("clean:lib", () => del(["out/lib/**/*"]));
gulp.task("clean:tests", () => del(["out/tests/**/*"]));
gulp.task("clean:baselines", cb => del(["tests/baselines/local"]));
gulp.task("clean", ["clean:lib", "clean:tests", "clean:baselines"]);

gulp.task("accept-baselines", () => gulp
    .src("tests/baselines/local/**/*")
    .pipe(gulp.dest("tests/baselines/reference")));

gulp.task("build:lib", () => lib
    .src()
    .pipe(sourcemaps.init())
    .pipe(lib.compile())
    .pipe(sourcemaps.write(".", { includeContent: false, destPath: "out/lib" }))
    .pipe(gulp.dest("out/lib")));

gulp.task("build:tests", ["build:lib"], () => tests
    .src()
    .pipe(sourcemaps.init())
    .pipe(tests.compile())
    .pipe(sourcemaps.write(".", { includeContent: false, destPath: "out/tests" }))
    .pipe(gulp.dest("out/tests")));

gulp.task("build", ["build:lib", "build:tests"]);

gulp.task("test:lib", ["build:tests", "clean:baselines"], () => gulp
    .src(["out/tests/index.js"], { read: false })
    .pipe(mocha({ reporter: "dot" })));

gulp.task("test:min", ["build:tests", "clean:baselines"], () => gulp
    .src(["out/tests/index.js"], { read: false })
    .pipe(mocha({ reporter: "min" })));

gulp.task("test", ["test:lib"]);

gulp.task("watch", ["build:tests"], () => gulp.watch(["src/**/*"], ["test:lib"]));

gulp.task("default", ["test"]);

gulp.task("diff", () => diff("tests/baselines/reference/", "tests/baselines/local/"));

gulp.task("pages:checkout", () => git(["-C", "./pages", "pull", "--no-stat"]));
gulp.task("pages:gmd:es6", ["build", "pages:checkout"], () => gmd("./spec/es6.grammar", "./spec/es6.grammar.html", "ecmarkup"));
gulp.task("pages:gmd:typescript", ["build", "pages:checkout"], () => gmd("./spec/typescript.grammar", "./spec/typescript.grammar.html", "ecmarkup"));
gulp.task("pages:gmd", ["pages:gmd:es6", "pages:gmd:typescript"]);
gulp.task("pages:emu", ["pages:gmd"], () => gulp
    .src(["./spec/es6.grammar.html", "./spec/typescript.grammar.html"])
    .pipe(emu({ js: true, css: true }))
    .pipe(gulp.dest("pages")));

gulp.task("pages", ["pages:emu"], () => Promise.resolve()
    .then(() => git(["-C", "./pages", "add", "."]))
    .then(() => git(["-C", "./pages", "commit", "-m", "Deploy to GitHub Pages"]))
    .then(() => git(["-C", "./pages", "push", "--force", "--quiet"])));

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
    return new Promise((resolve, reject) => {
        gutil.log((cmd ? cmd + " " : "") + args.join(" "));
        spawn(cmd || process.argv[0], args, { stdio: "inherit" })
            .on("error", function (e) { reject(e); })
            .on("close", function (code) { code ? reject(new Error("Process exited with code: " + code)) : resolve(); });
    });
}