var exec = require("./exec");

module.exports = function emu(inFile, outFile, opts) {
    opts = opts || { };
    var ecmarkup = process.env["ECMARKUP"];
    if (!ecmarkup) {
        throw new Error("Please set the 'ECMARKUP'' environment variable.");
    }
    
    var args = [inFile, outFile];
    if (opts.css) {
        args.push("--css", opts.css);
    }
    
    if (opts.js) {
        args.push("--js", opts.js);
    }
    
    if (opts.biblio) {
        args.push("--biblio", opts.biblio);
    }
    
    return exec(ecmarkup, args);
};