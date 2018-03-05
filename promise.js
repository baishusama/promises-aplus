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
            if (typeof cb !== 'function') {
                pass(value);
                return;
            }
            try {
                ret = cb(value);
                deferred.resolve(ret); // instead of `pass(ret);` -> Test Case: 2.2.6.js Line 191
            } catch (e) {
                deferred.reject(e);
            }
        }, 0);
    }

    function resolve(newValue) {
        // Needs to avoid recursive calls on promise
        if (newValue === this) {
            throw new TypeError('recursive promise');
        }
        if (newValue // `newValue && ...` for null
            && (typeof newValue === 'object'
                || typeof newValue === 'function')) {
            try {
                var then = newValue.then;
            } catch (e) {
                reject(e);
            }
            if (typeof then === 'function') {
                try {
                    then.call(newValue, function (v) {
                        if (!newValue.isImoPromiseEndState) {
                            resolve(v);
                            newValue.isImoPromiseEndState = true;
                        }
                    }, function (e) {
                        if (!newValue.isImoPromiseEndState) {
                            reject(e);
                            newValue.isImoPromiseEndState = true;
                        }
                    });
                } catch (e) {
                    if (!newValue.isImoPromiseEndState) {
                        reject(e);
                        newValue.isImoPromiseEndState = true;
                    }
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
        /*if (reason
            && (typeof reason=== 'object'
                || typeof reason === 'function')) {
            var then = reason.then;
            if (typeof then === 'function') {
                then.call(reason, resolve, reject);
                return;
            }
        }*/
        if (state === 'pending') {
            state = 'rejected';
            value = reason;
            afterward(reason);
        }
    }

    function afterward() {
        // 包在定时器内部：以避免 fn 同步导致 resolve 在 then 之前
        setTimeout(function () {
            deferreds.forEach(function (deferred) {
                handle(deferred);
            });
        }, 0);
    }

    fn.call(this, resolve, reject); // about `this` -> Test Case: 2.3.1 -> notes/for-2.3.1
}

/* Local Test */
var getNameById = function (id) {
    var fakeData = {
        0: 'imo'
    };
    return new Promise(function (resolve, reject) {
        if (id in fakeData) {
            setTimeout(resolve, 300, fakeData[id]);
        } else {
            setTimeout(reject, 300, '404');
        }
    });
};
var getSomethingElse = function () {
    return new Promise(function (resolve, reject) {
        setTimeout(resolve, 600, 'emmmmm');
    });
};
var getFin = function () {
    return new Promise(function (resolve, reject) {
        setTimeout(resolve, 900, 'Good Luck!');
    });
};
// Success case
/*getNameById(0).then(function (name) {
    console.log('Name : ' + name);
    return name;
}, function (err) {
    console.error('Err : ' + err);
}).then(function (sth) {
    console.log('Name again : ' + sth)
}).then(function (nothing) {
    console.log('Last `then` return nothing : ' + nothing);
}).then(
    getSomethingElse
).then(function (sth) {
    console.log('Sth else : ' + sth);
}).then(
    getFin
).then(function (fin) {
    console.log('Finally : ' + fin);
});*/
// Fail case
/*getNameById(1).then(function (name) {
    console.log('Name : ' + name);
    return name;
}, function (err) {
    console.error('1. Err : ' + err);
    return err;
}).then(function (sth) {
    console.log('Name again : ' + sth)
}, function (err) {
    console.error('2. Err : ' + err);
    return err;
}).then(function (nothing) {
    console.log('Last `then` return nothing : ' + nothing);
}, function (err) {
    console.error('3. Err : ' + err);
    return err;
}).then(
    getSomethingElse
).then(function (sth) {
    console.log('Sth else : ' + sth);
}, function (err) {
    console.error('4. Err : ' + err);
    return err;
}).then(
    getFin
).then(function (fin) {
    console.log('Finally : ' + fin);
}, function (err) {
    console.error('6. Err : ' + err);
    return err;
});*/

/* NodeJS's exports */
module.exports = Promise;