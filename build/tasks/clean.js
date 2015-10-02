var del = require("del");

module.exports = function clean(opts) {
    return function () {
        return del(opts.out);
    };
};