/* global process */
const gulp = require("gulp");
const log = require("fancy-log");
const sourcemaps = require("gulp-sourcemaps");
const tsb = require("gulp-tsb");
const mocha = require("gulp-mocha");
const del = require("del");
const spawn = require("child_process").spawn;

let errorCount = 0;
const src = {
    compile: tsb.create("src/tsconfig.json", {}, false, message => {
        log(message);
        errorCount++;
    }),
    src: () => gulp.src(["src/**/*.ts"])
};

const clean_dist = () => del(["dist/**/*"]);
gulp.task("clean:dist", clean_dist);

const clean_baselines = () => del(["baselines/local"]);
gulp.task("clean:baselines", clean_baselines);

const clean = gulp.parallel(clean_dist, clean_baselines);
gulp.task("clean", clean);

const build = () => src.src()
    .pipe(sourcemaps.init())
    .pipe(src.compile())
    .pipe(sourcemaps.write(".", { includeContent: false, sourceRoot: "../src" }))
    .pipe(gulp.dest("dist"))
    .on("end", () => { if (errorCount) throw new Error(`Build failed: ${errorCount} error(s)`); });
gulp.task("build", build);

const set_package_version = async () => {
    if (!process.env.npm_package_version) {
        process.env.npm_package_version = require("./package.json").version;
    }
};

const pre_test = gulp.parallel(set_package_version, build, clean_baselines);
gulp.task("pre-test", pre_test);

const run_tests = () => gulp
    .src(["dist/tests/index.js"], { read: false })
    .pipe(mocha({}));
    // .pipe(mocha({ reporter: "dot" })));
const test = gulp.series(pre_test, run_tests);
gulp.task("test", test);

const accept_baselines = () => gulp
    .src("baselines/local/**/*")
    .pipe(gulp.dest("baselines/reference"));
gulp.task("accept-baselines", accept_baselines);

const watch = () => gulp.watch(["src/**/*", "spec/*.grammar"], test);
gulp.task("watch", watch);

gulp.task("default", test);

gulp.task("diff", () => diff("baselines/reference/", "baselines/local/"));

function diff(remote, local) {
    var cmd = process.env.DIFF;
    if (!cmd) throw new Error("Please set the 'DIFF' environment variable.");
    return exec(cmd, [remote, local]);
}

function exec(cmd, args) {
    return new Promise((resolve, reject) => {
        log((cmd ? cmd + " " : "") + args.join(" "));
        spawn(cmd || process.argv[0], args, { stdio: "inherit" })
            .on("error", function (e) { reject(e); })
            .on("close", function (code) { code ? reject(new Error("Process exited with code: " + code)) : resolve(); });
    });
}