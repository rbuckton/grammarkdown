var Promise = require("../tools/Promise")
  , git = require("../tools/git")
  , gmd = require("../tools/gmd")
  , emu = require("../tools/emu");

module.exports = function pages() {
    return function () {
        var ecmarkup = process.env["ECMARKUP"];
        if (!ecmarkup) {
            throw new Error("Please set the 'ECMARKUP'' environment variable.");
        }

        return new Promise(function (resolve) { resolve(); })
            .then(function() { return git(["-C", "./pages", "pull", "--no-stat"]); })
            .then(function() { return gmd("./spec/es6.grammar", "./spec/es6.grammar.html", "ecmarkup"); })
            .then(function() { return gmd("./spec/typescript.grammar", "./spec/typescript.grammar.html", "ecmarkup"); })
            .then(function() { return emu("./spec/es6.html", "./pages/es6.html", { js: "./pages/menu.js", css: "./pages/elements.css" }); })
            .then(function() { return emu("./spec/typescript.html", "./pages/typescript.html", { }); })
            .then(function() { return git(["-C", "./pages", "add", "."]); })
            .then(function() { return git(["-C", "./pages", "commit", "-m", "Deploy to GitHub Pages"]); })
            .then(function() { return git(["-C", "./pages", "push", "--force", "--quiet"]); });
    };
};