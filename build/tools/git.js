var exec = require("./exec");

module.exports = function git(args, opts) {
    return exec("git", args, opts);
};