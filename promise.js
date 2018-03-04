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
                resolve: resolve,
                reject: reject
            });
        });
    };

    function handle(deferred) {
        if (state === 'pending') {
            deferreds.push(deferred);
            return;
        }
        var cb = state === 'fulfilled' ? deferred.onFulfilled : deferred.onRejected,
            pass = state === 'fulfilled' ? deferred.resolve : deferred.reject,
            ret;
        if (!(cb && typeof cb === 'function')) {
            pass(value);
            return;
        }
        try {
            ret = cb(value);
            pass(ret); // TODO ???
        } catch (e) {
            deferred.reject(e);
        }
    }

    function resolve(newValue) {
        setTimeout(function () {
            if (newValue
                && (typeof newValue === 'object'
                    || typeof newValue === 'function')) {
                var then = newValue.then;
                if (typeof then === 'function') {
                    then.call(newValue, resolve, reject);
                    return;
                }
            }
            if (state === 'pending') {
                state = "fulfilled";
                // value = newValue;
                afterward(newValue);
            }
        }, 0);
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
        setTimeout(function () {
            if (state === 'pending') {
                state = 'rejected';
                // value = reason;
                afterward(reason);
            }
        }, 0);
    }

    function afterward(v) {
        value = v;
        // 包在定时器内部：以避免 fn 同步导致 resolve 在 then 之前
        // setTimeout(function () {
        deferreds.forEach(function (deferred) {
            handle(deferred);
        });
        // }, 0);
    }

    fn(resolve, reject);
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