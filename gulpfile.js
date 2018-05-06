/* global process */
const gulp = require("gulp");
const gutil = require("gulp-util");
const sourcemaps = require("gulp-sourcemaps");
const tsb = require("gulp-tsb");
const mocha = require("gulp-mocha");
const del = require("del");
const spawn = require("child_process").spawn;
const src = {
    compile: tsb.create("src/tsconfig.json"),
    src: () => gulp.src(["src/**/*.ts"])
};

gulp.task("clean:dist", () => del(["dist/**/*"]));
gulp.task("clean:baselines", cb => del(["baselines/local"]));
gulp.task("clean", ["clean:dist", "clean:baselines"]);

gulp.task("build", () => src.src()
    .pipe(sourcemaps.init())
    .pipe(src.compile())
    .pipe(sourcemaps.write(".", { includeContent: false, sourceRoot: "../src" }))
    .pipe(gulp.dest("dist")));

gulp.task("pre-test", ["build", "clean:baselines"]);

gulp.task("test", ["pre-test"], () => gulp
    .src(["dist/tests/index.js"], { read: false })
    .pipe(mocha({ reporter: "dot" })));

gulp.task("accept-baselines", () => gulp
    .src("baselines/local/**/*")
    .pipe(gulp.dest("baselines/reference")));

gulp.task("watch", ["test"], () => gulp.watch(["src/**/*", "spec/*.grammar"], ["test"]));

gulp.task("default", ["test"]);

gulp.task("diff", () => diff("baselines/reference/", "baselines/local/"));

function diff(remote, local) {
    var cmd = process.env.DIFF;
    if (!cmd) throw new Error("Please set the 'DIFF' environment variable.");
    return exec(cmd, [remote, local]);
}

function exec(cmd, args) {
    return new Promise((resolve, reject) => {
        gutil.log((cmd ? cmd + " " : "") + args.join(" "));
        spawn(cmd || process.argv[0], args, { stdio: "inherit" })
            .on("error", function (e) { reject(e); })
            .on("close", function (code) { code ? reject(new Error("Process exited with code: " + code)) : resolve(); });
    });
}