var gulp = require("gulp")
  , mocha = require("gulp-mocha");

module.exports = function test(opts) {
    return function () {
        return gulp
            .src(opts.tests, { read: false })
            .pipe(mocha({ reporter: "dot" }))
            .on("error", function (e) { });
    };
};
