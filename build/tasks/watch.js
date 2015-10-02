var gulp = require("gulp");

module.exports = function watch(src, tasks) {
    return function () {
        return gulp.watch(src, tasks);
    };
};
