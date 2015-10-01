module.exports = function src() {
    return Array.from(arguments).reduce(function (ar, opts) {
        return ar.concat(opts.src);
    }, []);
};