/* global Promise */
module.exports = typeof Promise === "function" ? Promise : (function () {
    function Promise(executor) {
        if (!(this instanceof Promise)) throw new TypeError("Constructor called as a function.");
        this._result = undefined;
        this._state = "pending";
        this._waiters = [];
        await(undefined, executor);
    
        function await(target, then) {
            var called = false;
            try { 
                then.call(target, onfulfilled, onrejected); 
            } 
            catch (e) { 
                onrejected(e); 
            }
            
            function onfulfilled(value) {
                if (!called) {
                    called = true;
                    resolve(value);
                } 
            }
            
            function onrejected(reason) {
                if (!called) {
                    called = true;
                    reject(reason);
                }
            }
        }
        
        function resolve(value) { 
            try {
                var then = Object(value).then;
                if (typeof then === "function") {
                    setImmediate(await, value, then);
                }
                else {
                    fulfill(value);
                }
            }
            catch (e) {
                reject(e);
            }
        }
        
        function fulfill(value) {
            this._state = "fulfilled";
            this._result = value;
            setImmediate(notify, this._waiters, this._state, this._result);
            this._waiters = [];
        }
        
        function reject(reason) { 
            this._state = "rejected";
            this._result = reason;
            setImmediate(notify, this._waiters, this._state, this._result);
            this._waiters = [];
        }
    }
    
    Promise.prototype.then = function (onfulfilled, onrejected) {
        var _this = this;
        if (!(this instanceof Promise) || !this._state || !this._waiters) {
            throw new Error("Invalid object.");
        }
        
        return new Promise(function (resolve, reject) {
            var called = false;
            _this._waiters.push({
                fulfilled: typeof onfulfilled === "function" ? makeHandler(onfulfilled) : resolve,
                rejected: typeof onrejected === "function" ? makeHandler(onrejected) : reject
            });
            
            if (_this._state !== "pending") {
                setImmediate(notify, _this._waiters, _this._state, _this._result);
                _this._waiters = [];
            }

            function makeHandler(handler) {
                return function (value) {
                    if (!called) {
                        called = true;
                        try {
                            resolve(handler(value));
                        }
                        catch (e) {
                            reject(e);
                        }
                    }
                }
            }
        });
    };
    
    Promise.prototype.catch = function (onrejected) {
        return this.then(undefined, onrejected);
    };
    
    Promise.resolve = function (value) {
        return value instanceof Promise && value.constructor === Promise ? value : new Promise(function (resolve) { resolve(value); });
    };
    
    Promise.reject = function (reason) {
        return new Promise(function (_, reject) { reject(reason); });
    };
    
    Promise.all = function(promises) {
        return new Promise(function (resolve, reject) {
            promises = Array.prototype.map.call(promises, Promise.resolve);
            var count = promises.length;
            var result = [];
            if (count === 0) {
                resolve(result);
            }
            else {
                function makeResolve(i) {
                    var called = false;
                    return function (value) {
                        if (!called) {
                            called = true; 
                            result[i] = value;
                            if (--count === 0) {
                                resolve(result);
                            }
                        }
                    }
                }
                promises.forEach(function (promise, i) {
                    promise.then(makeResolve(i), reject);
                });
            }
        });
    };
    
    Promise.race = function(promises) {
        return new Promise(function (resolve, reject) {
            promises = Array.prototype.map.call(promises, Promise.resolve);
            promises.forEach(function (promise) {
                promise.then(resolve, reject);
            });
        });
    };
    
    function notify(waiters, state, result) {
        waiters.forEach(function (d) { 
            d[state](result);
        });
    }
    
    return Promise;
})();