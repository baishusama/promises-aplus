/* Promise Class */
function Promise(fn) {
    var state = 'pending';
    var value;
    var deferreds = [];

    // 暴露接口供 adapters 封装
    this.resolve = resolve;
    this.reject = reject;

    this.then = function (onFulfilled, onRejected) {
        return new Promise(function (resolve, reject) {
            handle({
                onFulfilled: onFulfilled, // TODO: || ???
                onRejected: onRejected,
                resolve: resolve.bind(this),
                reject: reject.bind(this)
            });
        });
    };

    function handle(deferred) {
        if (state === 'pending') {
            deferreds.push(deferred);
            return;
        }
        setTimeout(function () { // instead of none -> Test Case: 2.2.4.js Line 68 & 154
            var cb = state === 'fulfilled' ? deferred.onFulfilled : deferred.onRejected,
                pass = state === 'fulfilled' ? deferred.resolve : deferred.reject,
                ret;
            if (!(cb && typeof cb === 'function')) {
                pass(value);
                return;
            }
            try {
                ret = cb(value);
                deferred.resolve(ret); // instead of `pass(ret);` -> Test Case: 2.2.6.js Line 191
            } catch (e) {
                console.log('try{}catch(e){}, e :', e);
                deferred.reject(e);
            }
        }, 0);
    }

    function resolve(newValue) {
        // Needs to avoid recusive calls on promise
        if (newValue === this) {
            throw new TypeError('recusive promise');
        }
        if (newValue
            && (typeof newValue === 'object'
                || typeof newValue === 'function')) {
            /**
             * Note: 根据规范，添加在获取 then 方法的时候 `try-catch`
             */
            try {
                var then = newValue.then;
            } catch (e) {
                reject(e);
            }
            if (typeof then === 'function') {
                try {
                    then.call(newValue, resolve, reject);
                } catch (e) {
                    console.log('Caught an error while state is `' +
                        state +
                        '` then `reject` which :', e);
                    reject(e);
                }
                return;
            }
        }
        if (state === 'pending') {
            state = "fulfilled";
            value = newValue;
            afterward();
        }
    }

    function reject(reason) {
        if (state === 'pending') {
            state = 'rejected';
            value = reason;
            afterward(reason);
        }
    }

    function afterward() {
        console.log('After setting `fulfilled` state\n├─ Before afterward `setTimeout`');
        // 包在定时器内部：以避免 fn 同步导致 resolve 在 then 之前
        setTimeout(function () {
            console.log('└─ Inside afterward `setTimeout`');
            deferreds.forEach(function (deferred) {
                handle(deferred);
            });
        }, 0);
    }

    fn.call(this, resolve, reject); // about `this` -> Test Case: 2.3.1 -> notes/for-2.3.1
}

/* adapter functions */
var resolved = function (value) {
    return new Promise(function (resolve) {
        resolve(value);
    });
};
var rejected = function (reason) {
    return new Promise(function (resolve, reject) {
        reject(reason);
    });
};
var deferred = function () {
    var promise = new Promise(function (resolve, reject) {
    });
    var fulfill = function (value) {
        promise.resolve(value);
    };
    var reject = function (err) {
        promise.reject(err);
    };
    return {
        promise: promise,
        resolve: fulfill,
        reject: reject
    };
};


/**
 * Test Case
 *   - Source:
 *     - File-1: promises-aplus-tests/lib/tests/2.3.3.js
 *     - File-2: promises-aplus-tests/lib/tests/helpers/thenable.js "a thenable that tries to fulfill twice"
 */
console.log('### Test Start ###');
var dummy = {dummy: "dummy"}; // we fulfill or reject with this when we don't intend to test against it
var sentinel = {sentinel: "sentinel"}; // a sentinel fulfillment value to test for with strict equality
var other = {other: "other"}; // a value we don't want to be strict equal to

var yFactory = function () {
    return {
        then: function (onFulfilled) {
            // TODO: how modify to keep order
            onFulfilled({
                then: function (onFulfilled) {
                    setTimeout(function () {
                        onFulfilled(sentinel);
                    }, 0);
                }
            });
            onFulfilled(other);
        }
    };
};
var xFactory = function () {
    return {
        then: function (resolvePromise) {
            setTimeout(function () {
                resolvePromise(yFactory());
            }, 0);
        }
    };
};
var test = function (promise) {
    promise.then(null, function onPromiseRejected(value) {
        console.log('---> Finally, value is', value);
        console.log('---> Does value equals sentinel ? :', value === sentinel);
    });
};

var promise = resolved(dummy).then(function onBasePromiseFulfilled() {
    return xFactory();
});
test(promise);