var exec = require("./exec");

module.exports = function gmd(inFile, outFile, format) {
    return exec(undefined, ["./bin/grammarkdown", inFile, "-o", outFile, "-f", format, "--emitLinks"]);
};