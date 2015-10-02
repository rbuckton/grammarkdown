module.exports = function assign(a) {
    var args = [].slice.call(arguments, 1);
    args.forEach(function (b) {
        for (var p in b) {
            a[p] = b[p];
        }
    });
    return a;
};