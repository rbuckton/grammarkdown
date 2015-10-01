var gulp = require("gulp")
  , sourcemaps = require("gulp-sourcemaps")
  , ts = require("gulp-typescript")
  , typescript = require("typescript")
  , merge = require("merge2")
  , path = require("path");

module.exports = function build(opts) {
    return function () {
        var project = ts.createProject(opts.project, { typescript: typescript });
        var tee = gulp
            .src(opts.src, { base: opts.base })
            .pipe(sourcemaps.init())
            .pipe(ts(project));
        return merge([
            tee.dts
                .pipe(gulp.dest(opts.dest)),
            tee.js
                .pipe(sourcemaps.write(".", { includeContent: false, sourceRoot: path.relative(opts.dest, opts.base) }))
                .pipe(gulp.dest(opts.dest))
        ]);
    };
};