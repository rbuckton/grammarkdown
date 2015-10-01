var Promise = require("./promise")
  , assign = require("./assign")
  , spawn = require("child_process").spawn;
  
module.exports = function exec(cmd, args, opts) {
    return new Promise(function (resolve, reject) {
        console.log((cmd ? cmd + " " : "") + args.join(" "));
        spawn(cmd || process.argv[0], args, assign({ }, opts, { stdio: [process.stdin, process.stdout, process.stderr] }))
            .on("error", function (e) { reject(e); })
            .on("close", function (code) { code ? reject(new Error("Process exited with code: " + code)) : resolve(); });
    });
}
