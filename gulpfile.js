/* global process */
var gulp = require("gulp")
  , src = require("./build/tools/src")
  , clean = require("./build/tasks/clean")
  , build = require("./build/tasks/build")
  , test = require("./build/tasks/test")
  , watch = require("./build/tasks/watch")
  , diff = require("./build/tasks/diff")
  , pages = require("./build/tasks/pages");

var lib = {
    project: "./src/lib/tsconfig.json",
    base: "./src/lib/",
    dest: "./lib/",
    src: ["./src/lib/**/*.ts"],
    out: ["./lib/**/*"],
    tests: ["./tests/index.js"]
};

var tests = {
    project: "./src/tests/tsconfig.json",
    base: "./src/tests/",
    dest: "./tests/",
    src: ["./src/tests/**/*.ts"],
    out: ["./tests/**/*", "!./tests/baselines/**"]
};

var baselines = {
    remote: "./tests/baselines/reference/",
    local: "./tests/baselines/local/",
    out: ["./tests/baselines/local/**/*"]
};

gulp.task("clean:lib", clean(lib));
gulp.task("clean:tests", clean(tests));
gulp.task("clean:baselines", clean(baselines));
gulp.task("clean", ["clean:lib", "clean:tests", "clean:baselines"]);
gulp.task("build:lib", build(lib));
gulp.task("build:tests", ["build:lib"], build(tests));
gulp.task("build", ["build:lib", "build:tests"]);
gulp.task("test:lib", ["build:tests", "clean:baselines"], test(lib));
gulp.task("test", ["test:lib"]);
gulp.task("watch:lib", watch(src(lib), ["build:lib"]));
gulp.task("watch:tests", watch(src(lib, tests), ["test:lib"]));
gulp.task("watch", ["watch:tests"]);
gulp.task("default", ["test"]);
gulp.task("diff", diff(baselines));
gulp.task("publish:pages", ["build"], pages());
gulp.task("publish", ["publish:pages"]);