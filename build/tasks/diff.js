var exec = require("../tools/exec");

module.exports = function diff(opts) {
    return function () {
        var diff = process.env["DIFF"];
        if (!diff) {
            throw new Error("Please set the 'DIFF' environment variable.");
        }
        
        return exec(diff, [opts.remote, opts.local]);
    };
};